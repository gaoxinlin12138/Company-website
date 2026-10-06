import { getMysqlPool } from '~/server/utils/mysql'
import { requireAdmin } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const [rows] = await getMysqlPool().query(
    "SELECT id,title_zh AS titleZh,title_en AS titleEn,slug,category_id AS categoryId,summary_zh AS summaryZh,summary_en AS summaryEn,content_zh AS contentZh,content_en AS contentEn,cover_image AS coverImage,DATE_FORMAT(published_at,'%Y-%m-%d') AS publishedAt,status,sort_order AS sortOrder FROM articles WHERE id=?",
    [id]
  ) as any
  if (!rows[0]) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  return rows[0]
})
