import { requireAdmin } from '~/server/utils/admin-auth'
import { getMysqlPool } from '~/server/utils/mysql'

function joinTitle(lead: string, emphasis: string) {
  return [lead, emphasis].map(value => String(value || '').trim()).filter(Boolean).join(' ')
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const [rows] = await getMysqlPool().query(`
    SELECT id, category_zh AS categoryZh, category_en AS categoryEn,
      title_lead_zh AS titleLeadZh, title_lead_en AS titleLeadEn,
      title_emphasis_zh AS titleEmphasisZh, title_emphasis_en AS titleEmphasisEn,
      summary_zh AS summaryZh, summary_en AS summaryEn, image,
      primary_label_zh AS primaryLabelZh, primary_label_en AS primaryLabelEn,
      primary_to AS primaryTo, secondary_label_zh AS secondaryLabelZh,
      secondary_label_en AS secondaryLabelEn, sort_order AS sortOrder, status
    FROM home_hero_slides WHERE id=?
  `, [id]) as any
  if (!rows[0]) throw createError({ statusCode: 404, statusMessage: 'Home slide not found' })
  const row = rows[0]
  return { ...row, titleZh: joinTitle(row.titleLeadZh, row.titleEmphasisZh), titleEn: joinTitle(row.titleLeadEn, row.titleEmphasisEn) }
})
