import { getMysqlPool } from '~/server/utils/mysql'
import { requireAdmin } from '~/server/utils/admin-auth'

import { readRawText } from '~/server/utils/input'

const text = (input: Record<string, unknown>, key: string) => readRawText(input, key)

function splitTitle(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length < 2) return { lead: value.trim(), emphasis: ' ' }
  return { lead: parts.slice(0, -1).join(' '), emphasis: parts.at(-1) || ' ' }
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const input = await readBody(event) as Record<string, unknown>
  const pool = getMysqlPool()
  const [currentRows] = await pool.query('SELECT category_zh AS categoryZh, category_en AS categoryEn, primary_label_zh AS primaryLabelZh, primary_label_en AS primaryLabelEn, primary_to AS primaryTo, secondary_label_zh AS secondaryLabelZh, secondary_label_en AS secondaryLabelEn FROM home_hero_slides WHERE id=?', [id]) as any
  const current = currentRows[0]
  if (!id || !current) throw createError({ statusCode: 404, statusMessage: 'Home slide not found' })

  const titleZh = text(input, 'titleZh')
  const titleEn = text(input, 'titleEn')
  const summaryZh = text(input, 'summaryZh')
  const summaryEn = text(input, 'summaryEn')
  const image = text(input, 'image')
  const status = text(input, 'status').slice(0, 12).toUpperCase() || 'PUBLISHED'
  const sortOrder = Number(input.sortOrder)
  if (!titleZh || !titleEn || !summaryZh || !summaryEn || !image || !['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status) || !Number.isInteger(sortOrder) || sortOrder < 0) {
    throw createError({ statusCode: 400, statusMessage: '请填写标题、摘要和背景图片' })
  }
  if (titleZh.length > 30 || titleEn.length > 75 || summaryZh.length > 80 || summaryEn.length > 180) {
    throw createError({ statusCode: 400, statusMessage: '轮播文案超过长度限制，请按编辑页提示调整。' })
  }
  if (image.length > 500) throw createError({ statusCode: 400, statusMessage: '背景图片地址过长。' })

  const zh = splitTitle(titleZh)
  const en = splitTitle(titleEn)
  await pool.execute(
    'UPDATE home_hero_slides SET title_lead_zh=?,title_lead_en=?,title_emphasis_zh=?,title_emphasis_en=?,summary_zh=?,summary_en=?,image=?,sort_order=?,status=? WHERE id=?',
    [zh.lead, en.lead, zh.emphasis, en.emphasis, summaryZh, summaryEn, image, sortOrder, status, id]
  )
  return { ok: true, id }
})
