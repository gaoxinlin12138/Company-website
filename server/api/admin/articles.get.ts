import { getMysqlPool } from '~/server/utils/mysql'
import { requireAdmin } from '~/server/utils/admin-auth'
import { NEWS_CATEGORIES } from '~/data/news'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const query = getQuery(event)
  const status = String(query.status || '').toUpperCase()
  const search = String(query.search || '').trim()
  const category = String(query.category || '').trim()
  const conditions: string[] = ['c.name_zh IN (?, ?)']
  const params: string[] = [...NEWS_CATEGORIES]
  if (['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) { conditions.push('a.status = ?'); params.push(status) }
  if (category) { conditions.push('c.name_zh = ?'); params.push(category) }
  if (search) { conditions.push('(a.title_zh LIKE ? OR a.title_en LIKE ? OR c.name_zh LIKE ?)'); const q = `%${search}%`; params.push(q, q, q) }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const [rows] = await getMysqlPool().query(`SELECT a.id, a.title_zh AS titleZh, a.title_en AS titleEn, a.cover_image AS coverImage, a.status, a.sort_order AS sortOrder, DATE_FORMAT(a.published_at,'%Y-%m-%d') AS publishedAt, c.name_zh AS categoryZh FROM articles a INNER JOIN categories c ON c.id = a.category_id ${where} ORDER BY a.sort_order ASC, COALESCE(a.published_at, a.created_at) DESC`, params)
  return rows
})
