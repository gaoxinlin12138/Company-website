#!/usr/bin/env node
/**
 * 填充 categories 表（产品分类、新闻分类、案例分类）。
 *
 * 背景：database/001_initial.sql 只建表、不含数据，因此新部署的数据库里
 * categories 是空的。前台产品分类筛选、后台新增产品的「产品分类」下拉
 * 都依赖这张表，为空时会造成「分类下拉没有选项、产品无法保存」。
 *
 * 用法（项目根目录）：
 *   node scripts/seed-categories.mjs
 *   node scripts/seed-categories.mjs --url 'mysql://user:pass@127.0.0.1:3306/hongcai_wanfu'
 *
 * 特性：
 * - 可重复执行：已存在的分类按 slug 更新名称与排序，不会产生重复
 * - 缺失的分类自动补齐
 * - 只写 categories 表，不动任何其它数据
 */

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

/* ---------- 参数 ---------- */
const args = process.argv.slice(2)
const argValue = (name) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const wantUrl = argValue('url')

/* ---------- 数据库连接 ---------- */
function fromEnvFile(file) {
  if (!existsSync(file)) return null
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*DATABASE_URL\s*=\s*(.*)$/)
    if (m) return m[1].trim().replace(/^["']|["']$/g, '')
  }
  return null
}
const dbUrl = wantUrl || process.env.DATABASE_URL || fromEnvFile(join(root, '.env')) || fromEnvFile(join(root, '.output/.env'))
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

/* ---------- 分类定义 ---------- */
// [slug, 中文名, 英文名, 父分类 slug 或 null, sortOrder]
const CATEGORIES = [
  // 新闻分类（前台按中文名筛选文章，名称不可改）
  ['company-news', '公司新闻', 'Company news', null, 0],
  ['industry-insights', '行业资讯', 'Industry insights', null, 1],
  // 产品大类
  ['sanitaryware', '卫浴产品', 'Sanitaryware', null, 0],
  ['bathroom-hardware', '卫浴五金', 'Bathroom hardware', null, 1],
  ['installation-parts', '安装及配件', 'Installation parts', null, 2],
  // 产品子类（后台新增产品的下拉项）
  ['basin-faucets', '面盆龙头', 'Basin faucets', 'sanitaryware', 1],
  ['shower-sets', '花洒套装', 'Shower sets', 'sanitaryware', 2],
  ['toilets', '坐便器', 'Toilets', 'sanitaryware', 3],
  ['bathroom-cabinets', '浴室柜', 'Bathroom cabinets', 'sanitaryware', 4],
  ['kitchen-faucets', '厨房龙头', 'Kitchen faucets', 'sanitaryware', 5],
  ['bathroom-accessories', '卫浴挂件', 'Bathroom accessories', 'bathroom-hardware', 1],
  ['valve-parts', '阀门配件', 'Valve parts', 'bathroom-hardware', 2],
  ['drainage-parts', '排水配件', 'Drainage parts', 'installation-parts', 1],
  ['installation-accessories', '安装配件', 'Installation accessories', 'installation-parts', 2],
  // 案例分类（前台按中文名筛选案例，名称不可改）
  ['customer-cases', '客户案例', 'Customer cases', null, 0],
  ['project-cases', '项目案例', 'Project cases', null, 1],
  ['delivered-results', '落地效果', 'Delivered results', null, 2]
]

// 与数据库主键长度一致（VARCHAR(32)）
function idFor(slug) {
  return createHash('sha1').update(`category:${slug}`).digest('hex').slice(0, 32)
}

/* ---------- 执行 ---------- */
const url = new URL(dbUrl)
console.log(`数据库: ${url.hostname}:${url.port || 3306}/${url.pathname.replace(/^\//, '')}`)

const conn = await mysql.createConnection({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, '')
})

const [before] = await conn.query('SELECT COUNT(*) AS c FROM categories')
console.log(`执行前 categories 共 ${before[0].c} 条`)

let inserted = 0
let updated = 0
let skipped = 0

try {
  await conn.beginTransaction()

  for (const [slug, nameZh, nameEn, parentSlug, sortOrder] of CATEGORIES) {
    const id = idFor(slug)
    const parentId = parentSlug ? idFor(parentSlug) : null

    const [existing] = await conn.execute('SELECT id, name_zh, name_en, parent_id FROM categories WHERE slug = ? LIMIT 1', [slug])

    if (!existing.length) {
      // 该 slug 不存在：按主键插入，主键被占用则说明 id 冲突，报错回滚
      await conn.execute(
        'INSERT INTO categories (id, name_zh, name_en, slug, parent_id, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, nameZh, nameEn, slug, parentId, sortOrder, 'PUBLISHED']
      )
      inserted++
      console.log(`  + 新增 ${nameZh} (${slug})`)
      continue
    }

    const row = existing[0]
    const changes = []
    if (row.name_zh !== nameZh) changes.push('name_zh')
    if (row.name_en !== nameEn) changes.push('name_en')
    if ((row.parent_id || null) !== parentId) changes.push('parent_id')

    if (changes.length) {
      await conn.execute(
        'UPDATE categories SET name_zh = ?, name_en = ?, parent_id = ?, sort_order = ?, status = ? WHERE slug = ?',
        [nameZh, nameEn, parentId, sortOrder, 'PUBLISHED', slug]
      )
      updated++
      console.log(`  ~ 更新 ${nameZh} (${slug}) → ${changes.join(', ')}`)
    } else {
      skipped++
    }
  }

  await conn.commit()
} catch (error) {
  await conn.rollback()
  console.error(`\n✗ 执行失败，已回滚：${error.code || error.message}`)
  await conn.end()
  process.exit(1)
}

const [after] = await conn.query('SELECT COUNT(*) AS c FROM categories')
const [children] = await conn.query('SELECT COUNT(*) AS c FROM categories WHERE parent_id IS NOT NULL')

console.log(`
✓ 完成：新增 ${inserted}，更新 ${updated}，无需改动 ${skipped}
  categories 现共 ${after[0].c} 条，其中子分类 ${children[0].c} 条（后台新增产品的下拉项数）

下一步：刷新后台「新建产品」页面（Ctrl + F5），产品分类下拉应出现选项。
`)

await conn.end()
