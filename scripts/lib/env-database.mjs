/**
 * 读取 .env 中的数据库连接串（供 scripts/ 下的工具共用）。
 *
 * 线上部署中 .env 出现过多种非标准写法，都会让简单正则失效：
 *   - 两个变量被误写在同一行（缺换行）：NUXT_COOKIE_SECURE="false"DATABASE_URL=...
 *   - 等号两侧有空格、行首缩进、export 前缀
 *   - UTF-8 BOM、Windows 换行
 *   - 值被引号包裹
 * 因此这里定位 DATABASE_URL 后从其后的第一个 = 取值，并清理常见杂质。
 *
 * 另附 readEnvValue：按变量名读取任意一行，供将来复用。
 */

import { readFileSync, existsSync } from 'node:fs'

/** 去掉 BOM，统一换行 */
function normalize(text) {
  let value = text
  if (value.charCodeAt(0) === 0xFEFF) value = value.slice(1)
  return value.replace(/\r\n?/g, '\n')
}

/**
 * 取出某个变量名对应的值。
 * @param {string} text .env 内容
 * @param {string} name 变量名
 * @returns {string|null}
 */
export function readEnvValue(text, name) {
  const source = normalize(text)
  for (const line of source.split('\n')) {
    if (/^\s*#/.test(line)) continue
    const at = line.indexOf(name)
    if (at < 0) continue
    // 变量名必须是一个完整的标识符（前面不是字母数字下划线）
    const before = line[at - 1]
    if (before && /[A-Za-z0-9_]/.test(before)) continue
    const after = line[at + name.length]
    if (after && /[A-Za-z0-9_]/.test(after)) continue

    const eq = line.indexOf('=', at + name.length)
    if (eq < 0) continue
    let value = line.slice(eq + 1).trim()
    // 去掉成对或残留的包裹引号
    value = value.replace(/^["']+/, '').replace(/["']+$/, '').trim()
    // 值后面又粘了下一个变量时（DATABASE_URL=xOTHER=y），把多余部分裁掉
    const glued = value.match(/\s*(?:export\s+)?[A-Z][A-Z0-9_]*\s*=/)
    if (glued && glued.index > 0) value = value.slice(0, glued.index).trim()
    // 去掉行尾注释
    value = value.replace(/\s+#.*$/, '').trim()
    return value
  }
  return null
}

/**
 * 从 .env 文件读取数据库连接串。
 * @param {string} file 文件路径
 * @returns {string|null}
 */
export function readDatabaseUrlFromEnvFile(file) {
  if (!existsSync(file)) return null
  const value = readEnvValue(readFileSync(file, 'utf8'), 'DATABASE_URL')
  return value && /^mysql:\/\//i.test(value) ? value : null
}

/**
 * 按优先级解析数据库连接：命令行 --url > 环境变量 > .env > .output/.env
 * @param {string|undefined} explicit 命令行传入的连接串
 * @param {string} root 项目根目录（默认当前目录）
 * @returns {string|null}
 */
export function resolveDatabaseUrl(explicit, root = '.') {
  return explicit
    || process.env.DATABASE_URL
    || readDatabaseUrlFromEnvFile(`${root}/.env`)
    || readDatabaseUrlFromEnvFile(`${root}/.output/.env`)
    || null
}

/** 把连接串中的密码替换为 ***，便于安全打印 */
export function maskDatabaseUrl(url) {
  return String(url).replace(/:\/\/([^@]*)@/, '://***@')
}

/** 找不到连接串时打印统一的排查提示 */
export function printDatabaseUrlHelp() {
  console.error('✗ 找不到数据库连接。可用 --url 直接传入，例如：')
  console.error('  node scripts/<脚本>.mjs --url "$DBURL"')
  console.error('  其中 DBURL 用下面这条取得（不显示密码）：')
  console.error("  DBURL=\"$(grep -m1 'DATABASE_URL' .env | cut -d= -f2- | tr -d '\\\"' | tr -d \"'\" | tr -d '\\r')\"")
  console.error('  也可以先用 node scripts/format-env.mjs --write 规范化 .env 后重试。')
}
