import { getMysqlPool } from '~/server/utils/mysql'
import { NEWS_CATEGORIES, sampleNewsArticles } from '~/data/news'

export default defineEventHandler(async () => {
  try {
    const [rows] = await getMysqlPool().query(`
      SELECT a.id, a.slug, a.title_zh AS titleZh, a.title_en AS titleEn,
        a.summary_zh AS summaryZh, a.summary_en AS summaryEn,
        a.content_zh AS contentZh, a.content_en AS contentEn,
        a.cover_image AS image, a.published_at AS publishedAt, a.created_at AS createdAt,
        c.name_zh AS categoryZh, c.name_en AS categoryEn
      FROM articles a
      INNER JOIN categories c ON c.id = a.category_id
      WHERE a.status = 'PUBLISHED' AND c.name_zh IN (?, ?)
      ORDER BY a.sort_order ASC, COALESCE(a.published_at, a.created_at) DESC
    `, [...NEWS_CATEGORIES]) as any

    return rows.map((item: any) => ({
      id: item.id,
      slug: item.slug,
      date: new Date(item.publishedAt || item.createdAt).toISOString().slice(0, 10),
      category: item.categoryZh || '公司新闻',
      categoryEn: item.categoryEn || 'Company news',
      title: item.titleZh,
      titleEn: item.titleEn,
      summary: item.summaryZh,
      summaryEn: item.summaryEn,
      content: item.contentZh,
      contentEn: item.contentEn,
      image: item.image
    }))
  } catch {
    return sampleNewsArticles
  }
})
