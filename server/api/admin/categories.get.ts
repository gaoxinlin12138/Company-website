import { getMysqlPool } from '~/server/utils/mysql'
import { requireAdmin } from '~/server/utils/admin-auth'
import { NEWS_CATEGORIES } from '~/data/news'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const scope = String(getQuery(event).scope || '')
  const articleOnly = scope === 'articles'
  const [rows] = await getMysqlPool().query(
    `SELECT id, name_zh AS nameZh, name_en AS nameEn, parent_id AS parentId, sort_order AS sortOrder, status
      FROM categories
      ${articleOnly ? 'WHERE name_zh IN (?, ?) AND status <> ?' : ''}
      ORDER BY parent_id IS NOT NULL, sort_order, name_zh`,
    articleOnly ? [...NEWS_CATEGORIES, 'ARCHIVED'] : []
  )
  return rows
})
