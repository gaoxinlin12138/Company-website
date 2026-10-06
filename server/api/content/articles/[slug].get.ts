import { NEWS_CATEGORIES, sampleNewsArticles } from '~/data/news'
import { getMysqlPool } from '~/server/utils/mysql'

export default defineEventHandler(async (event) => {
  const slug = (getRouterParam(event, 'slug') || '').trim()
  if (!slug) throw createError({ statusCode: 404, statusMessage: 'Article not found' })

  try {
    const [rows] = await getMysqlPool().query(`
      SELECT a.id, a.slug, a.title_zh AS titleZh, a.title_en AS titleEn,
        a.summary_zh AS summaryZh, a.summary_en AS summaryEn,
        a.content_zh AS contentZh, a.content_en AS contentEn,
        a.cover_image AS image, a.published_at AS publishedAt, a.created_at AS createdAt,
        c.name_zh AS categoryZh, c.name_en AS categoryEn
      FROM articles a
      INNER JOIN categories c ON c.id = a.category_id
      WHERE a.slug = ? AND a.status = 'PUBLISHED' AND c.name_zh IN (?, ?)
      LIMIT 1
    `, [slug, ...NEWS_CATEGORIES]) as any
    const item = rows[0]
    if (!item) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    return {
      id: item.id,
      slug: item.slug,
      date: new Date(item.publishedAt || item.createdAt).toISOString().slice(0, 10),
      category: item.categoryZh,
      categoryEn: item.categoryEn,
      title: item.titleZh,
      titleEn: item.titleEn,
      summary: item.summaryZh,
      summaryEn: item.summaryEn,
      content: item.contentZh,
      contentEn: item.contentEn,
      image: item.image
    }
  } catch (error: any) {
    if (error?.statusCode === 404) throw error
    const fallback = sampleNewsArticles.find(item => item.slug === slug)
    if (fallback) return fallback
    throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  }
})
