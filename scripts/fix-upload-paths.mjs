#!/usr/bin/env node
/**
 * 更新 site_settings 中已迁移的图片路径。
 *
 * 背景：演示用的案例图与关于我们配图已从 public/uploads/ 迁移到
 * public/assets/images/，这些路径同时存在于数据库的 site_settings 值中
 * （about、contact 为 JSON）。若不更新，前台会请求已不存在的旧路径而裂图。
 *
 * 用法（项目根目录）：
 *   node scripts/fix-upload-paths.mjs            # 预览将要修改的内容
 *   node scripts/fix-upload-paths.mjs --apply    # 实际写入
 *   node scripts/fix-upload-paths.mjs --apply --url 'mysql://...'
 *
 * 只替换图片路径字符串，不改动任何文字内容。
 */

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const argValue = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined }
const wantUrl = argValue('url')

const REPLACEMENTS = [
  ['/uploads/cases/', '/assets/images/cases/'],
  ['/uploads/about/', '/assets/images/about/']
]

const SETTING_KEYS = ['about', 'contact', 'product-catalogue', 'home-products', 'social-contact']

/* ---------- 数据库连接 ---------- */
/**
 * 从 .env 读取 DATABASE_URL。
 * 实际部署中发现该文件的格式存在多种写法（BOM、行首空格、export 前缀、
 * 引号、Windows 换行，甚至两个变量被意外写在同一行），因此这里用宽松匹配：
 * 先定位 DATABASE_URL 的位置，再取其后的第一个 = 作为赋值处。
 */
function readDatabaseUrlFromEnvFile(file) {
  if (!existsSync(file)) return null
  let text = readFileSync(file, 'utf8')
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1)

  for (const line of text.split(/\r?\n/)) {
    if (/^\s*#/.test(line)) continue
    const at = line.indexOf('DATABASE_URL')
    if (at < 0) continue
    // 从变量名之后找赋值等号；若前面误粘了别的变量，也能正确定位
    const eq = line.indexOf('=', at + 'DATABASE_URL'.length)
    if (eq < 0) continue
    let value = line.slice(eq + 1).trim()
    value = value.replace(/^["']+/, '').replace(/["']+$/, '').trim()
    value = value.replace(/\s+#.*$/, '').trim()
    if (/^mysql:\/\//i.test(value)) return value
  }
  return null
}
const dbUrl = wantUrl || process.env.DATABASE_URL || readDatabaseUrlFromEnvFile(join(root, '.env')) || readDatabaseUrlFromEnvFile(join(root, '.output/.env'))
if (!dbUrl) {
  console.error('✗ 找不到数据库连接。可用 --url 直接传入，例如：')
  console.error('  node scripts/fix-upload-paths.mjs --apply --url "$DBURL"')
  console.error('  其中 DBURL 可用这条命令取得（不显示密码）：')
  console.error("  DBURL=\"$(grep -m1 'DATABASE_URL' .env | cut -d= -f2- | tr -d '\\\"' | tr -d \"'\" | tr -d '\\r')\"")
  process.exit(1)
}

let mysql
try {
  mysql = createRequire(import.meta.url)('mysql2/promise')
} catch {
  console.error('✗ 找不到 mysql2 模块。请在项目根目录执行，或先运行：pnpm install --prod')
  process.exit(1)
}

const url = new URL(dbUrl)
console.log(`数据库: ${url.hostname}:${url.port || 3306}/${url.pathname.replace(/^\//, '')}`)
console.log(apply ? '模式: 实际写入' : '模式: 仅预览（加 --apply 才会写入）')

const conn = await mysql.createConnection({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, '')
})

let changed = 0
let scanned = 0
let pending = 0

try {
  for (const key of SETTING_KEYS) {
    const [rows] = await conn.execute('SELECT `key`, `value` FROM site_settings WHERE `key` = ? LIMIT 1', [key])
    if (!rows.length) { console.log(`  ${key.padEnd(20)}  (无此设置，跳过)`); continue }
    scanned++

    let raw = rows[0].value
    if (Buffer.isBuffer(raw)) raw = raw.toString('utf8')
    if (typeof raw !== 'string') raw = JSON.stringify(raw)

    let next = raw
    const hits = []
    for (const [from, to] of REPLACEMENTS) {
      const n = next.split(from).length - 1
      if (n) { hits.push(`${from} → ${to}（${n} 处）`); next = next.split(from).join(to) }
    }

    if (!hits.length) { console.log(`  ${key.padEnd(20)}  无需修改`); continue }

    // 写入前确认仍是合法 JSON，避免破坏设置值
    try { JSON.parse(next) } catch {
      console.error(`  ${key.padEnd(20)}  ✗ 替换后不是合法 JSON，已跳过`)
      continue
    }

    console.log(`  ${key.padEnd(20)}  ${hits.join('; ')}`)
    if (apply) {
      await conn.execute('UPDATE site_settings SET `value` = ? WHERE `key` = ?', [next, key])
      changed++
    } else {
      pending++
    }
  }
} catch (error) {
  console.error(`\n✗ 执行失败：${error.code || error.message}`)
  await conn.end()
  process.exit(1)
}

console.log(`\n扫描 ${scanned} 项设置，${apply ? `已更新 ${changed} 项` : `待更新 ${pending} 项（预览模式未写入）`}`)
if (!apply && pending) console.log('确认无误后加 --apply 重新执行以写入。')
else if (apply && changed) console.log('完成。前台刷新（Ctrl + F5）后图片应正常显示。')
else console.log('无需改动。')

await conn.end()
