import { getMysqlPool } from '~/server/utils/mysql'
import { requireAdmin } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const query = getQuery(event)
  const status = String(query.status || '').toUpperCase()
  const search = String(query.search || '').trim()
  const conditions: string[] = []
  const params: string[] = []
  if (['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) { conditions.push('k.status = ?'); params.push(status) }
  if (search) { conditions.push('(k.title_zh LIKE ? OR k.title_en LIKE ? OR c.name_zh LIKE ?)'); const q = `%${search}%`; params.push(q, q, q) }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const [rows] = await getMysqlPool().query(`SELECT k.id, k.title_zh AS titleZh, k.title_en AS titleEn, k.cover_image AS coverImage, k.project_type_zh AS projectTypeZh, k.location_zh AS locationZh, k.status, k.sort_order AS sortOrder, c.name_zh AS categoryZh FROM case_studies k LEFT JOIN categories c ON c.id = k.category_id ${where} ORDER BY k.sort_order ASC, k.created_at DESC`, params)
  return rows
})
