import { getMysqlPool } from '~/server/utils/mysql'
import { requireAdmin } from '~/server/utils/admin-auth'
import { parsePublishedDate, requireArticleCategory } from '~/server/utils/article-categories'
import { readText } from '~/server/utils/input'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const i = await readBody(event) as Record<string, unknown>
  const titleZh = readText(i, 'titleZh', 240), titleEn = readText(i, 'titleEn', 240), slug = readText(i, 'slug', 240), categoryId = readText(i, 'categoryId', 32)
  const summaryZh = readText(i, 'summaryZh'), summaryEn = readText(i, 'summaryEn'), contentZh = readText(i, 'contentZh'), contentEn = readText(i, 'contentEn'), coverImage = readText(i, 'coverImage', 500)
  const status = readText(i, 'status', 12).toUpperCase() || 'DRAFT'
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
