import { getMysqlPool } from '~/server/utils/mysql'

export default defineEventHandler(async () => {
  try {
    const [rows] = await getMysqlPool().query(`
      SELECT k.id, k.slug, k.title_zh AS titleZh, k.title_en AS titleEn,
        k.summary_zh AS summaryZh, k.summary_en AS summaryEn,
        k.content_zh AS contentZh, k.content_en AS contentEn,
        k.project_type_zh AS typeZh, k.project_type_en AS typeEn,
        k.location_zh AS locationZh, k.location_en AS locationEn,
        k.supplied_products_zh AS productsZh, k.supplied_products_en AS productsEn,
        k.cover_image AS image, c.name_zh AS categoryZh, c.name_en AS categoryEn
      FROM case_studies k
      LEFT JOIN categories c ON c.id = k.category_id
      WHERE k.status = 'PUBLISHED'
      ORDER BY k.sort_order ASC, k.created_at DESC
    `) as any

    return rows.map((item: any) => ({
      id: item.id,
      slug: item.slug,
      category: item.categoryZh || '项目案例',
      categoryEn: item.categoryEn || 'Project case',
      title: item.titleZh,
      titleEn: item.titleEn,
      summary: item.summaryZh,
      summaryEn: item.summaryEn,
      content: item.contentZh,
      contentEn: item.contentEn,
      type: item.typeZh,
      typeEn: item.typeEn,
      location: item.locationZh,
      locationEn: item.locationEn,
      products: item.productsZh,
      productsEn: item.productsEn,
      image: item.image
    }))
  } catch {
    return []
  }
})
