import { getMysqlPool } from '~/server/utils/mysql'

export default defineEventHandler(async () => {
  const [rows] = await getMysqlPool().query(`
    SELECT p.id, p.name_zh AS nameZh, p.name_en AS nameEn, p.model,
      p.material_zh AS materialZh, p.material_en AS materialEn,
      p.cover_image AS image,
      c.name_zh AS categoryZh, c.name_en AS categoryEn,
      COALESCE(parent.name_zh, c.name_zh) AS groupZh
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN categories parent ON parent.id = c.parent_id
    WHERE p.status = 'PUBLISHED'
    ORDER BY p.sort_order ASC, p.created_at DESC
  `) as any
  return rows.map((item: any) => ({
    id: item.id,
    name: item.nameZh,
    nameEn: item.nameEn,
    category: item.categoryZh,
    categoryEn: item.categoryEn,
    group: item.groupZh === '卫浴产品' ? '卫浴产品' : '其他产品',
    material: item.materialZh,
    materialEn: item.materialEn,
    model: item.model,
    image: item.image
  }))
})
