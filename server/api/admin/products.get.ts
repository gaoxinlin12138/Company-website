import { getMysqlPool } from '~/server/utils/mysql'
import { requireAdmin } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const query = getQuery(event)
  const status = String(query.status || '').toUpperCase()
  const search = String(query.search || '').trim()
  const categoryId = String(query.categoryId || '').trim()
  const categoryIds = String(query.categoryIds || '').split(',').map(item => item.trim()).filter(Boolean)
  const conditions: string[] = []
  const params: string[] = []
  if (['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) { conditions.push('p.status = ?'); params.push(status) }
  if (categoryId) { conditions.push('p.category_id = ?'); params.push(categoryId) }
  if (!categoryId && categoryIds.length) {
    conditions.push(`p.category_id IN (${categoryIds.map(() => '?').join(', ')})`)
    params.push(...categoryIds)
  }
  if (search) { conditions.push('(p.name_zh LIKE ? OR p.name_en LIKE ? OR p.model LIKE ? OR c.name_zh LIKE ?)'); const q = `%${search}%`; params.push(q, q, q, q) }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const [rows] = await getMysqlPool().query(`
    SELECT p.id, p.name_zh AS nameZh, p.name_en AS nameEn, p.model, p.material_zh AS materialZh, p.category_id AS categoryId,
      p.cover_image AS coverImage, p.status, p.sort_order AS sortOrder,
      c.name_zh AS categoryZh, c.name_en AS categoryEn
    FROM products p LEFT JOIN categories c ON c.id = p.category_id
    ${where} ORDER BY p.sort_order ASC, p.created_at DESC`, params)
  return rows
})
