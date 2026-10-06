import { homeHeroSlides } from '~/data/home'
import { getMysqlPool } from '~/server/utils/mysql'

export default defineEventHandler(async () => {
  let heroSlides = homeHeroSlides

  try {
    const [rows] = await getMysqlPool().query(`
      SELECT id, category_zh AS categoryZh, category_en AS categoryEn,
        title_lead_zh AS titleLeadZh, title_lead_en AS titleLeadEn,
        title_emphasis_zh AS titleEmphasisZh, title_emphasis_en AS titleEmphasisEn,
        summary_zh AS summaryZh, summary_en AS summaryEn, image,
        primary_label_zh AS primaryLabelZh, primary_label_en AS primaryLabelEn,
        primary_to AS primaryTo, secondary_label_zh AS secondaryLabelZh,
        secondary_label_en AS secondaryLabelEn, sort_order AS sortOrder
      FROM home_hero_slides ORDER BY sort_order ASC, created_at ASC LIMIT 4
    `) as any

    if (rows.length === 4) {
      heroSlides = rows.map((row: any) => ({
        id: row.id,
        category: { zh: row.categoryZh, en: row.categoryEn },
        titleLead: { zh: row.titleLeadZh, en: row.titleLeadEn },
        titleEmphasis: { zh: row.titleEmphasisZh, en: row.titleEmphasisEn },
        summary: { zh: row.summaryZh, en: row.summaryEn },
        image: row.image,
        primaryAction: { zh: row.primaryLabelZh, en: row.primaryLabelEn, to: row.primaryTo },
        secondaryAction: { zh: row.secondaryLabelZh, en: row.secondaryLabelEn },
        sortOrder: Number(row.sortOrder),
        status: 'published'
      }))
    }
  } catch {
    // Keep the bundled homepage content available if the database is unavailable.
  }

  return {
    heroSlides: heroSlides.filter(item => item.status === 'published').sort((a, b) => a.sortOrder - b.sortOrder)
  }
})

