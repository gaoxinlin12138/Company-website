import { getMysqlPool } from '~/server/utils/mysql'
import { requireAdmin } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const [rows] = await getMysqlPool().query(`
    SELECT id, category_zh AS categoryZh, category_en AS categoryEn,
      title_lead_zh AS titleLeadZh, title_lead_en AS titleLeadEn,
      title_emphasis_zh AS titleEmphasisZh, title_emphasis_en AS titleEmphasisEn,
      summary_zh AS summaryZh, summary_en AS summaryEn, image, sort_order AS sortOrder, status
    FROM home_hero_slides ORDER BY sort_order ASC, created_at ASC LIMIT 4
  `)
  return rows
})
