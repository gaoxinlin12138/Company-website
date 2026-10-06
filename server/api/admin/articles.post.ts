import { getMysqlPool } from '~/server/utils/mysql'
import { requireAdmin } from '~/server/utils/admin-auth'
import { parsePublishedDate, requireArticleCategory } from '~/server/utils/article-categories'
const text = (i: Record<string, unknown>, k: string, m = 10000) => typeof i[k] === 'string' ? String(i[k]).trim().slice(0, m) : ''
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const i = await readBody(event) as Record<string, unknown>
  const titleZh = text(i, 'titleZh', 240), titleEn = text(i, 'titleEn', 240), slug = text(i, 'slug', 240), categoryId = text(i, 'categoryId', 32)
  const summaryZh = text(i, 'summaryZh'), summaryEn = text(i, 'summaryEn'), contentZh = text(i, 'contentZh'), contentEn = text(i, 'contentEn'), coverImage = text(i, 'coverImage', 500)
  const status = text(i, 'status', 12).toUpperCase() || 'DRAFT'
  const sortOrder = Number(i.sortOrder || 0)
  if (!titleZh || !titleEn || !slug || !categoryId || !summaryZh || !summaryEn || !contentZh || !contentEn || !coverImage || !['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status) || !Number.isInteger(sortOrder) || sortOrder < 0) {
    throw createError({ statusCode: 400, statusMessage: '请完整填写新闻必填项。' })
  }
  const publishedAt = parsePublishedDate(i.publishedAt)
  await requireArticleCategory(categoryId)
  const id = crypto.randomUUID().replaceAll('-', '')
  try {
    await getMysqlPool().execute(
      'INSERT INTO articles (id,title_zh,title_en,slug,category_id,summary_zh,summary_en,content_zh,content_en,cover_image,published_at,status,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, titleZh, titleEn, slug, categoryId, summaryZh, summaryEn, contentZh, contentEn, coverImage, publishedAt, status, sortOrder]
    )
  } catch (error: any) {
    if (error?.code === 'ER_DUP_ENTRY') throw createError({ statusCode: 409, statusMessage: '新闻 slug 已存在。' })
    throw error
  }
  return { ok: true, id }
})
