#!/usr/bin/env node
/*
 * 管理员密码恢复工具（应急用，独立于网站运行）
 *
 * 用途：后台登录不进去、且网站没有注册/找回入口时，在服务器上直接重置管理员密码。
 *
 * 用法（在项目根目录执行）：
 *   node scripts/reset-admin.mjs
 *   node scripts/reset-admin.mjs --user myadmin
 *   node scripts/reset-admin.mjs --password '自己指定的强密码至少12位'
 *   node scripts/reset-admin.mjs --url 'mysql://用户:密码@127.0.0.1:3306/hongcai_wanfu'
 *
 * 说明：
 * - 会打印当前所有管理员及创建顺序，指出登录实际使用的是哪一个。
 * - 默认把密码重置为随机强密码，只打印一次，请立即登录并妥善保存。
 * - 只改 password_hash，不新建多余账号（除非表里一个都没有）。
 * - 用完即可删除本脚本，或留着以后应急。
 */

import { randomBytes, scrypt as scryptCallback } from 'node:crypto'
import { promisify } from 'node:util'
import { readFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'

const scrypt = promisify(scryptCallback)

/* ---------- 参数 ---------- */
const args = process.argv.slice(2)
function arg(name) {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const wantUser = arg('user')
const wantPassword = arg('password')
const wantUrl = arg('url')
if (args.includes('--help') || args.includes('-h')) {
  console.log(readFileSync(new URL(import.meta.url)).toString().split('\n').slice(1, 22).map(l => l.replace(/^\s?\*?\s?/, '')).join('\n'))
  process.exit(0)
}

/* ---------- 读取数据库连接 ---------- */
function fromEnvFile(file) {
  if (!existsSync(file)) return null
  const lines = readFileSync(file, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const m = line.match(/^\s*DATABASE_URL\s*=\s*(.*)$/)
    if (m) return m[1].trim().replace(/^["']|["']$/g, '')
  }
  return null
}
const dbUrl = wantUrl || process.env.DATABASE_URL || fromEnvFile('.env') || fromEnvFile('.output/.env')
if (!dbUrl) {
  console.error('✗ 找不到数据库连接。请用 --url 指定，或在项目根目录 .env 中设置 DATABASE_URL。')
  process.exit(1)
}

let mysql
try {
  mysql = createRequire(import.meta.url)('mysql2/promise')
} catch {
  console.error('✗ 找不到 mysql2 模块。请在项目根目录执行，或先运行：pnpm install --prod')
  process.exit(1)
}

/* ---------- 连接 ---------- */
const url = new URL(dbUrl)
const label = `${url.hostname}:${url.port || 3306}/${url.pathname.replace(/^\//, '')}`
console.log(`数据库: ${label}`)

let conn
try {
  conn = await mysql.createConnection({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, '')
  })
} catch (e) {
  console.error(`✗ 数据库连接失败：${e.code || e.message}`)
  process.exit(1)
}

/* ---------- 与网站相同的哈希格式 ---------- */
async function hashPassword(password) {
  const salt = randomBytes(16)
  const derived = await scrypt(password, salt, 64)
  return `scrypt$${salt.toString('base64url')}$${derived.toString('base64url')}`
}
function randomPassword() {
  // 用无歧义字符集，避免抄错
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const bytes = randomBytes(20)
  let out = ''
  for (let i = 0; i < 20; i++) out += alphabet[bytes[i] % alphabet.length]
  return out
}

/* ---------- 现状 ---------- */
const [rows] = await conn.query(
  'SELECT id, username, role, created_at FROM admin_users ORDER BY created_at ASC'
)

console.log(`\n当前管理员账号共 ${rows.length} 个：`)
if (!rows.length) {
  console.log('  （空）—— 网站会在首次访问后台时用 ADMIN_USERNAME / ADMIN_PASSWORD 自动创建')
} else {
  rows.forEach((r, i) => {
    const mark = i === 0 ? '  ← 登录实际只认这一个' : '  （存在但登录不使用）'
    console.log(`  ${i + 1}. ${r.username}  role=${r.role}  创建于 ${new Date(r.created_at).toISOString()}${mark}`)
  })
}

const target = wantUser
  ? rows.find(r => r.username === wantUser)
  : rows[0]

if (wantUser && !target) {
  console.error(`\n✗ 找不到用户名为 ${wantUser} 的管理员。`)
  await conn.end()
  process.exit(1)
}

/* ---------- 重置或创建 ---------- */
const password = wantPassword || randomPassword()
if (password.length < 10 || password.length > 200) {
  console.error('\n✗ 密码长度需在 10~200 之间。')
  await conn.end()
  process.exit(1)
}
const passwordHash = await hashPassword(password)

if (target) {
  await conn.execute('UPDATE admin_users SET password_hash = ? WHERE id = ?', [passwordHash, target.id])
  console.log(`\n✓ 已重置管理员「${target.username}」的密码`)
} else {
  const username = wantUser || 'admin'
  await conn.execute(
    'INSERT INTO admin_users (id, username, password_hash, role) VALUES (?, ?, ?, ?)',
    [randomBytes(16).toString('hex'), username, passwordHash, 'admin']
  )
  console.log(`\n✓ 已创建管理员「${username}」`)
}

if (!wantPassword) {
  console.log(`\n  登录用户名：${target ? target.username : (wantUser || 'admin')}`)
  console.log(`  临时密码　：${password}`)
  console.log('\n  ⚠ 密码只显示这一次，请立即登录后修改并妥善保存。')
}

console.log(`
下一步：
  1. 打开 https://你的域名/admin/login，用上面的账号密码登录。
  2. 若登录报 503「管理员账号尚未在服务器配置」，
     说明环境变量 NUXT_SESSION_SECRET 未设置或短于 32 位，请在面板环境变量中补上后重启 Node 进程。
  3. 若提示「登录尝试过多」，是连续失败 5 次触发限流，等 15 分钟或重启 Node 进程即可。
`)

await conn.end()
