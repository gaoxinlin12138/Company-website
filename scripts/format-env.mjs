#!/usr/bin/env node
/**
 * 规范化 .env 文件格式。
 *
 * 线上部署中反复出现的格式问题都会导致变量静默失效，本脚本统一处理：
 *   1. UTF-8 BOM
 *   2. Windows 换行（CRLF / 孤立 CR）
 *   3. 等号两侧多余空格
 *   4. 两个变量被误写在同一行（缺少换行）
 *   5. 值两端多余空格、行尾空白
 *   6. 连续多个空行
 *   7. 重复定义的键（保留首次出现，仅提示）
 *
 * 用法（项目根目录）：
 *   node scripts/format-env.mjs                    # 预览，不改文件
 *   node scripts/format-env.mjs --write            # 备份后写入
 *   node scripts/format-env.mjs --file .env.local --write
 *
 * 安全性：
 *   - 只调整格式，不改变键名与值的内容（除两端空白与纯包裹用的引号）
 *   - 写入前自动生成 .bak 备份
 *   - 若规范化后解析不出任何变量则拒绝写入
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve, basename, isAbsolute } from 'node:path'

const KEY = '[A-Za-z_][A-Za-z0-9_]*'
const KEY_AT_START = new RegExp(`^\\s*(?:export\\s+)?(${KEY})\\s*=\\s*`)
// 行内任意位置的「下一个赋值」，用于识别两个变量被粘在同一行。
// 两组模式按顺序尝试，兼顾「正常值不被误切」与「各种粘连都能拆开」：
//   1. 名字前面是行首、空白或刚闭合的引号 —— 最常见的粘连形态
//   2. 名字前面是数字 —— 覆盖 A=1B=2 这种值尾部直接接变量名的情况
// 两组都只认全大写+下划线的名字（环境变量惯例），因此
// mysql://u:p=ss@host/db 里的小写 p= 不会被误判成变量。
const ASSIGNMENT_PATTERNS = [
  new RegExp(`(?:^|\\s|["'])(?:export\\s+)?([A-Z][A-Z0-9_]*)\\s*=`, 'g'),
  new RegExp(`[0-9]([A-Z][A-Z0-9_]*)\\s*=`, 'g')
]

/**
 * 找出 rest 中位于引号外部的赋值起点。
 * 引号内部的 KEY= 属于「值」的一部分，不能当成分隔点。
 */
function findExternalAssignment(rest) {
  const candidates = []
  for (const pattern of ASSIGNMENT_PATTERNS) {
    pattern.lastIndex = 0
    let m
    while ((m = pattern.exec(rest))) {
      // 变量名在命中文本中的位置（命中文本可能带有前置的分隔字符）
      candidates.push({ nameAt: m.index + m[0].indexOf(m[1]), name: m[1] })
    }
  }
  candidates.sort((a, b) => a.nameAt - b.nameAt)

  for (const c of candidates) {
    const before = rest.slice(0, c.nameAt)
    // 位于未闭合的引号内：属于值的内容，跳过
    if ((before.match(/"/g) || []).length % 2 === 1) continue
    if ((before.match(/'/g) || []).length % 2 === 1) continue
    const assignEnd = rest.indexOf('=', c.nameAt) + 1
    return { index: c.nameAt, name: c.name, length: assignEnd - c.nameAt }
  }
  return null
}

/** 把一行按 KEY=value 拆成若干项；返回 null 表示不是赋值行 */
export function parseAssignmentLine(line) {
  const m = line.match(KEY_AT_START)
  if (!m) return null
  const items = []
  let name = m[1]
  let rest = line.slice(m[0].length)

  for (;;) {
    const hit = findExternalAssignment(rest)
    if (!hit) {
      items.push({ name, value: rest.trim() })
      return items
    }
    items.push({ name, value: rest.slice(0, hit.index).trim() })
    name = hit.name
    rest = rest.slice(hit.index + hit.length)
  }
}

/** 检测原文中存在的格式问题 */
export function detectProblems(text, bytes) {
  const spacedEqualsRe = new RegExp(`^\\s*(?:export\\s+)?${KEY}\\s+=\\s*|^\\s*(?:export\\s+)?${KEY}\\s*=[ \\t]+\\S`, 'm')
  return {
    bom: bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF,
    crlf: /\r\n/.test(text),
    loneCr: /(^|[^\r])\r(?!\n)/.test(text),
    spacedEquals: spacedEqualsRe.test(text),
    // 连续空行：两个换行之间只允许空白字符。
    // 字符类必须包含 \r，否则 CRLF 文件里的空行（\n\r\n）匹配不到。
    multipleBlank: /\n[ \t\r]*\n[ \t\r]*\n/.test(text),
    trailingSpace: /[ \t]+$/m.test(text)
  }
}

/**
 * 规范化 .env 文本。纯函数，不触碰文件系统，便于测试。
 * @returns {{ result: string, names: string[], merged: string[], splitLines: string[][], problems: object }}
 */
export function formatEnvText(inputBytes) {
  const original = Buffer.isBuffer(inputBytes) ? inputBytes.toString('utf8') : String(inputBytes)
  const bytes = Buffer.isBuffer(inputBytes) ? inputBytes : Buffer.from(original, 'utf8')
  const problems = detectProblems(original, bytes)

  let text = original
  if (problems.bom) text = text.slice(1)
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  const output = []
  const seen = new Set()
  const merged = []
  const splitLines = []

  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/[ \t]+$/, '')
    if (!line.trim()) { output.push(''); continue }
    if (/^\s*#/.test(line)) { output.push(line); continue }

    const parsed = parseAssignmentLine(line)
    if (!parsed) { output.push(line); continue }
    if (parsed.length > 1) splitLines.push(parsed.map(p => p.name))

    for (const item of parsed) {
      // 去掉两端空白后，剥掉纯粹用于包裹值的成对引号
      let value = item.value
      if (value.length >= 2 && /^(["']).*\1$/.test(value)) value = value.slice(1, -1)

      if (seen.has(item.name)) { merged.push(item.name); continue }
      seen.add(item.name)
      output.push(`${item.name}=${value}`)
    }
  }

  // 折叠连续空行，去掉首尾多余空行
  const collapsed = []
  for (const line of output) {
    if (!line.trim() && !collapsed.length) continue
    if (!line.trim() && !collapsed[collapsed.length - 1].trim()) continue
    collapsed.push(line)
  }
  while (collapsed.length && !collapsed[collapsed.length - 1].trim()) collapsed.pop()

  return {
    result: collapsed.join('\n') + '\n',
    names: [...seen],
    merged,
    splitLines,
    problems
  }
}

/* ==================== CLI ==================== */

function main() {
  const here = dirname(fileURLToPath(import.meta.url))
  const root = join(here, '..')

  const args = process.argv.slice(2)
  const write = args.includes('--write')
  const argValue = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined }
  const fileArg = argValue('file')
  const target = !fileArg ? join(root, '.env') : (isAbsolute(fileArg) ? fileArg : resolve(root, fileArg))

  if (!existsSync(target)) {
    console.error(`✗ 找不到文件：${target}`)
    process.exit(1)
  }

  const bytes = readFileSync(target)
  const { result, names, merged, splitLines, problems } = formatEnvText(bytes)
  const original = bytes.toString('utf8')

  console.log(`文件: ${target}`)
  console.log(`原始: ${bytes.length} 字节 / ${original.split('\n').length} 行`)
  console.log(`规范后: ${Buffer.byteLength(result)} 字节 / ${result.split('\n').length - 1} 行\n`)

  console.log('=== 发现的问题 ===')
  const found = []
  if (problems.bom) found.push('存在 UTF-8 BOM')
  if (problems.crlf) found.push('使用 Windows 换行（CRLF）')
  if (problems.loneCr) found.push('存在孤立回车符（CR）')
  if (problems.spacedEquals) found.push('等号两侧有多余空格')
  if (splitLines.length) found.push(`变量被写在同一行：${splitLines.map(l => l.join(' + ')).join('、')}`)
  if (problems.trailingSpace) found.push('存在行尾多余空格')
  if (problems.multipleBlank) found.push('存在连续空行')
  if (merged.length) found.push(`重复定义的键（保留首次出现）：${[...new Set(merged)].join('、')}`)
  if (found.length) found.forEach(f => console.log(`  · ${f}`))
  else console.log('  （无，格式已规范）')

  console.log('\n=== 规范后的内容（值已隐藏）===')
  for (const line of result.split('\n')) {
    if (!line.trim()) { console.log(''); continue }
    if (/^\s*#/.test(line)) { console.log(line); continue }
    const i = line.indexOf('=')
    const name = line.slice(0, i)
    const value = line.slice(i + 1)
    console.log(`${name}=<${value.length} 字符>${value ? '' : '   ← 空值，请确认'}`)
  }

  console.log(`\n解析出 ${names.length} 个变量：${names.join(', ')}`)

  if (!names.length) {
    console.error('\n✗ 规范化后没有解析出任何变量，拒绝写入。请手工检查文件。')
    process.exit(1)
  }

  if (!write) {
    console.log(result === original ? '\n格式已规范，无需修改。' : '\n预览模式，未写入。确认无误后加 --write 执行。')
    process.exit(0)
  }

  const backup = `${target}.bak`
  copyFileSync(target, backup)
  writeFileSync(target, result, 'utf8')
  console.log(`\n已写入 ${basename(target)}，备份为 ${basename(backup)}`)
  console.log('注意：.env 在进程启动时读取，请重新构建并重启 Node 进程使其生效。')
}

// 仅在被直接执行时运行 CLI，被 import 时不产生副作用
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
