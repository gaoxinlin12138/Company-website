import { defaultHomeProductContent, type HomeProductContent } from '~/data/site-content'
import { getMysqlPool } from '~/server/utils/mysql'
import { readSiteSetting } from '~/server/utils/site-settings'

type ProductRow = {
  id: string
  nameZh: string
  nameEn: string
  model: string
  materialZh: string
  materialEn: string
  image: string
  categoryZh: string
  categoryEn: string
  groupZh: string
}

function mapProduct(item: ProductRow) {
  return {
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
  }
}

export default defineEventHandler(async () => {
  try {
    const setting = await readSiteSetting('home-products') as HomeProductContent
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

    const products = rows as ProductRow[]
    const byId = new Map(products.map(product => [product.id, product]))
    const selected = Array.isArray(setting.productIds)
      ? setting.productIds.map(id => byId.get(id)).filter(Boolean) as ProductRow[]
      : []
    const output = selected.length ? selected : products.slice(0, 6)
    return output.map(mapProduct)
  } catch {
    return []
  }
})
