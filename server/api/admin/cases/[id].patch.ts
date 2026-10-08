import { getMysqlPool } from '~/server/utils/mysql'
import { requireAdmin } from '~/server/utils/admin-auth'
import { readText } from '~/server/utils/input'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const input = await readBody(event) as Record<string, unknown>
  const text = (key: string, max = 10000) => readText(input, key, max)
  const status = text('status', 12).toUpperCase()
  const sortOrder = Number(input?.sortOrder)

  if (input?.status && Object.keys(input).every((key) => ['status', 'sortOrder'].includes(key))) {
    if (!['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status) || (input.sortOrder !== undefined && (!Number.isInteger(sortOrder) || sortOrder < 0))) throw createError({ statusCode: 400, statusMessage: '无效的案例状态' })
    const [result] = await getMysqlPool().execute(input.sortOrder === undefined ? 'UPDATE case_studies SET status=? WHERE id=?' : 'UPDATE case_studies SET status=?,sort_order=? WHERE id=?', input.sortOrder === undefined ? [status, id] : [status, sortOrder, id]) as any
    if (!result.affectedRows) throw createError({ statusCode: 404, statusMessage: 'Case not found' })
    return { ok: true, id, status, sortOrder: input.sortOrder === undefined ? undefined : sortOrder }
  }

  const titleZh = text('titleZh', 240), titleEn = text('titleEn', 240), slug = text('slug', 240), categoryId = text('categoryId', 32)
  const summaryZh = text('summaryZh'), summaryEn = text('summaryEn'), contentZh = text('contentZh'), contentEn = text('contentEn')
  const projectTypeZh = text('projectTypeZh', 160), projectTypeEn = text('projectTypeEn', 160), locationZh = text('locationZh', 160), locationEn = text('locationEn', 160)
  const suppliedProductsZh = text('suppliedProductsZh'), suppliedProductsEn = text('suppliedProductsEn'), coverImage = text('coverImage', 500)
  if (!id || !titleZh || !titleEn || !slug || !categoryId || !summaryZh || !summaryEn || !contentZh || !contentEn || !projectTypeZh || !projectTypeEn || !locationZh || !locationEn || !suppliedProductsZh || !suppliedProductsEn || !coverImage || !['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status) || !Number.isInteger(sortOrder) || sortOrder < 0) throw createError({ statusCode: 400, statusMessage: '请完整填写案例必填项' })
  const [result] = await getMysqlPool().execute('UPDATE case_studies SET title_zh=?,title_en=?,slug=?,category_id=?,summary_zh=?,summary_en=?,content_zh=?,content_en=?,project_type_zh=?,project_type_en=?,location_zh=?,location_en=?,supplied_products_zh=?,supplied_products_en=?,cover_image=?,status=?,sort_order=? WHERE id=?', [titleZh, titleEn, slug, categoryId, summaryZh, summaryEn, contentZh, contentEn, projectTypeZh, projectTypeEn, locationZh, locationEn, suppliedProductsZh, suppliedProductsEn, coverImage, status, sortOrder, id]) as any
  if (!result.affectedRows) throw createError({ statusCode: 404, statusMessage: 'Case not found' })
  return { ok: true, id, status, sortOrder }
})
