#!/usr/bin/env node
/**
 * 更新 site_settings 里的文案（服务端配置的文字，前台优先读数据库）。
 *
 * 背景：关于我们、联系方式、询价表单等文案存储在 site_settings 中，前台优先
 * 使用数据库的值，代码里的默认值只是兜底。改了 data/site-content.ts 的默认值
 * 之后，若数据库里已有旧值，前台仍显示旧文案，需用本脚本同步。
 *
 * 用法（项目根目录）：
 *   node scripts/patch-site-text.mjs                     # 预览将改动的项
 *   node scripts/patch-site-text.mjs --apply             # 写入
 *   node scripts/patch-site-text.mjs --apply --url '...' # 指定连接串
 *   node scripts/patch-site-text.mjs --apply --key contact --set privacyZh=新文案
 *
 * 说明：
 * - 按 `设置键` + `字段路径` 定位，例如 contact / inquiry.privacyZh
 * - 只替换指定字段，其余内容原样保留
 * - 预览模式打印改动前后对比（可 --limit N 控制打印长度）
 * - 写入前校验 JSON 合法性；自动生成 .env.bak 同级的 settings 备份不做，
 *   但会打印被改字段的旧值，便于人工回退
 */

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'
import { resolveDatabaseUrl, printDatabaseUrlHelp } from './lib/env-database.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const argValue = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined }
const onlyKey = argValue('key')
const limit = Number(argValue('limit') || 120)
const setArg = argValue('set') // 形如 field.path=新值，可重复

/** 内置补丁：与 data/site-content.ts 的默认值保持一致 */
const PATCHES = [
  {
    key: 'contact',
    fields: {
      'inquiry.privacyZh': '您提交的姓名、公司与联系方式仅用于本次商务沟通，我们不会向第三方提供。如需删除或更正，请通过下方联系方式告知我们。',
      'inquiry.privacyEn': 'The name, company and contact details you submit are used only to respond to this enquiry and are never shared with third parties. Contact us if you would like them removed or corrected.'
    }
  }
]

const dbUrl = resolveDatabaseUrl(argValue('url'), root)
if (!dbUrl) {
  printDatabaseUrlHelp()
  process.exit(1)
}

let mysql
try {
  mysql = createRequire(import.meta.url)('mysql2/promise')
} catch {
  console.error('✗ 找不到 mysql2 模块。请在项目根目录执行。')
  process.exit(1)
}

const url = new URL(dbUrl)
console.log(`数据库: ${url.hostname}:${url.port || 3306}/${url.pathname.replace(/^\//, '')}`)
console.log(apply ? '模式: 实际写入\n' : '模式: 仅预览（加 --apply 才会写入）\n')

const conn = await mysql.createConnection({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, '')
})

const shorten = (v) => {
  const s = String(v ?? '')
  return s.length > limit ? `${s.slice(0, limit)}…（共 ${s.length} 字）` : s
}
const readPath = (obj, path) => path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj)
const writePath = (obj, path, value) => {
  const keys = path.split('.')
  const last = keys.pop()
  let target = obj
  for (const k of keys) {
    if (target[k] == null || typeof target[k] !== 'object') target[k] = {}
    target = target[k]
  }
  target[last] = value
}

// --set 参数覆盖/追加补丁
if (setArg) {
  const eq = setArg.indexOf('=')
  const path = setArg.slice(0, eq)
  const value = setArg.slice(eq + 1)
  const key = onlyKey || 'contact'
  const existing = PATCHES.find(p => p.key === key)
  if (existing) existing.fields[path] = value
  else PATCHES.push({ key, fields: { [path]: value } })
}

let changedTotal = 0
try {
  for (const patch of PATCHES) {
    if (onlyKey && patch.key !== onlyKey) continue
    const [rows] = await conn.execute('SELECT `value` FROM site_settings WHERE `key` = ? LIMIT 1', [patch.key])
    if (!rows.length) { console.log(`【${patch.key}】数据库中无此设置，跳过（前台将使用代码默认值）`); continue }

    let raw = rows[0].value
    if (Buffer.isBuffer(raw)) raw = raw.toString('utf8')
    if (typeof raw === 'string') { try { raw = JSON.parse(raw) } catch { console.error(`【${patch.key}】现有值不是合法 JSON，跳过`); continue } }

    const next = JSON.parse(JSON.stringify(raw))
    let touched = 0
    console.log(`【${patch.key}】`)
    for (const [path, value] of Object.entries(patch.fields)) {
      const before = readPath(raw, path)
      if (before === value) { console.log(`  · ${path} 已是目标值，无需修改`); continue }
      console.log(`  · ${path}`)
      console.log(`      旧: ${shorten(before)}`)
      console.log(`      新: ${shorten(value)}`)
      writePath(next, path, value)
      touched++
    }
    if (!touched) { console.log('  （无改动）\n'); continue }

    if (apply) {
      await conn.execute('UPDATE site_settings SET `value` = ? WHERE `key` = ?', [JSON.stringify(next), patch.key])
      changedTotal += touched
    }
    console.log('')
  }
} catch (error) {
  console.error(`✗ 执行失败：${error.code || error.message}`)
  await conn.end()
  process.exit(1)
}

console.log(apply
  ? `已更新 ${changedTotal} 个字段。前台刷新（Ctrl + F5）后生效。`
  : '预览模式未写入。确认无误后加 --apply 执行。')

await conn.end()
