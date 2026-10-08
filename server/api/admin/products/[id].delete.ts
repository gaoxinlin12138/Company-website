import { realpath, unlink } from 'node:fs/promises'
import { basename, join, sep } from 'node:path'
import { escapeId } from 'mysql2'
import { getMysqlPool } from '~/server/utils/mysql'
import { requireAdmin } from '~/server/utils/admin-auth'

function productUploadUrls(coverImage: unknown, gallery: unknown) {
  const values = [coverImage]
  if (typeof gallery === 'string') {
    try { gallery = JSON.parse(gallery) } catch { gallery = [] }
  }
  if (Array.isArray(gallery)) {
    for (const item of gallery) values.push(typeof item === 'string' ? item : item?.image || item?.url)
  }
  return [...new Set(values
    .filter((value): value is string => typeof value === 'string')
    .filter(value => /^\/uploads\/products\/[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value)))]
}

async function removeProductUploads(urls: string[]) {
  const removedFiles: string[] = []
  const retainedFiles: string[] = []
  const failedFiles: string[] = []
  if (!urls.length) return { removedFiles, retainedFiles, failedFiles }

  const pool = getMysqlPool()
  let columns: Array<{ tableName: string; columnName: string }>
  try {
    const [rows] = await pool.query(
      "SELECT TABLE_NAME AS tableName, COLUMN_NAME AS columnName FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND DATA_TYPE IN ('char','varchar','tinytext','text','mediumtext','longtext','json')"
    )
    columns = rows as typeof columns
    if (!columns.length) throw new Error('No columns available for reference checks')
  } catch {
    // A database/checking failure must never cause an image to be deleted.
    return { removedFiles, retainedFiles, failedFiles: urls }
  }

  const workspace = await realpath(process.cwd())
  for (const url of urls) {
    const filename = basename(url)
    try {
      let referenced = false
      // Check every website text/JSON field, including other products, articles,
      // cases, home slides and settings. Shared images must be retained.
      for (const column of columns) {
        const [references] = await pool.execute(
          `SELECT 1 FROM ${escapeId(column.tableName)} WHERE INSTR(CAST(${escapeId(column.columnName)} AS CHAR CHARACTER SET utf8mb4), ?) > 0 LIMIT 1`,
          [filename]
        ) as any
        if (references.length) { referenced = true; break }
      }
      if (referenced) { retainedFiles.push(url); continue }

      for (const root of ['public', join('.output', 'public')]) {
        try {
          const directory = await realpath(join(workspace, root, 'uploads', 'products'))
          if (!directory.toLowerCase().startsWith(`${workspace}${sep}`.toLowerCase())) {
            throw new Error('The upload directory resolves outside the project')
          }
          await unlink(join(directory, filename))
          removedFiles.push(`${root}/${url.replace(/^\//, '')}`)
        } catch (error: any) {
          if (error?.code !== 'ENOENT') throw error
        }
      }
    } catch {
      failedFiles.push(url)
    }
  }
  return { removedFiles, retainedFiles, failedFiles }
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const connection = await getMysqlPool().getConnection()
  let uploads: string[] = []
  try {
    await connection.beginTransaction()
    const [productRows] = await connection.execute(
      'SELECT cover_image AS coverImage, gallery FROM products WHERE id = ? FOR UPDATE',
      [id]
    ) as any
    if (!productRows[0]) throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    uploads = productUploadUrls(productRows[0].coverImage, productRows[0].gallery)

    const [result] = await connection.execute('DELETE FROM products WHERE id = ?', [id]) as any
    if (!result.affectedRows) throw createError({ statusCode: 409, statusMessage: 'Product could not be deleted' })

    const [rows] = await connection.execute(
      'SELECT `value` FROM site_settings WHERE `key` = ? FOR UPDATE',
      ['home-products']
    ) as any
    if (rows[0]) {
      const setting = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value
      if (Array.isArray(setting.productIds) && setting.productIds.includes(id)) {
        await connection.execute('UPDATE site_settings SET `value` = ? WHERE `key` = ?', [
          JSON.stringify({ ...setting, productIds: setting.productIds.filter((productId: string) => productId !== id) }),
          'home-products'
        ])
      }
    }
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
  // File cleanup is best-effort and happens after the committed transaction.
  return { ok: true, id, ...await removeProductUploads(uploads) }
})
