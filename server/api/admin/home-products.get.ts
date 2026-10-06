import { requireAdmin } from '~/server/utils/admin-auth'
import { getMysqlPool } from '~/server/utils/mysql'
import { readSiteSetting } from '~/server/utils/site-settings'
import type { HomeProductContent } from '~/data/site-content'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const setting = await readSiteSetting('home-products') as HomeProductContent
  const [rows] = await getMysqlPool().query(`
    SELECT p.id, p.name_zh AS nameZh, p.name_en AS nameEn, p.model,
      p.material_zh AS materialZh, p.material_en AS materialEn,
      p.cover_image AS image, c.name_zh AS categoryZh
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.status = 'PUBLISHED'
    ORDER BY p.sort_order ASC, p.created_at DESC
  `) as any

  return {
    productIds: Array.isArray(setting.productIds) ? setting.productIds : [],
    products: rows
  }
})
