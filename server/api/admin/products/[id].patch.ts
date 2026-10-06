import { getMysqlPool } from '~/server/utils/mysql'
import { requireAdmin } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const input = await readBody(event) as Record<string, unknown>
  const text = (key: string, max = 5000) => typeof input?.[key] === 'string' ? String(input[key]).trim().slice(0, max) : ''
  if (input?.status && Object.keys(input).every((key) => ['status', 'sortOrder'].includes(key))) {
    const statusOnly = text('status', 12).toUpperCase()
    const sortOnly = input.sortOrder === undefined ? null : Number(input.sortOrder)
    if (!['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(statusOnly) || (sortOnly !== null && (!Number.isInteger(sortOnly) || sortOnly < 0))) throw createError({ statusCode: 400, statusMessage: '无效的产品状态' })
    const [result] = await getMysqlPool().execute(sortOnly === null ? 'UPDATE products SET status=? WHERE id=?' : 'UPDATE products SET status=?,sort_order=? WHERE id=?', sortOnly === null ? [statusOnly, id] : [statusOnly, sortOnly, id]) as any
    if (!result.affectedRows) throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    return { ok: true, id, status: statusOnly, sortOrder: sortOnly }
  }
  const model = text('model', 120); const nameZh = model; const nameEn = model; const categoryId = text('categoryId', 32); const materialZh = text('materialZh', 120); const materialEn = text('materialEn', 120) || materialZh; const finishZh = text('finishZh', 120) || '—'; const finishEn = text('finishEn', 120) || '—'; const summaryZh = text('summaryZh') || model; const summaryEn = text('summaryEn') || model; const coverImage = text('coverImage', 500)
  const slug = text('slug', 200) || `${model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'product'}-${Date.now()}`
  const status = text('status', 12).toUpperCase(); const sortOrder = Number(input?.sortOrder)
  if (!id || !slug || !categoryId || !model || !materialZh || !coverImage || !['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status) || !Number.isInteger(sortOrder) || sortOrder < 0) throw createError({ statusCode: 400, statusMessage: '请填写产品型号、材质、分类和图片' })
  const [result] = await getMysqlPool().execute('UPDATE products SET name_zh=?,name_en=?,slug=?,category_id=?,model=?,material_zh=?,material_en=?,finish_zh=?,finish_en=?,summary_zh=?,summary_en=?,cover_image=?,status=?,sort_order=? WHERE id=?', [nameZh,nameEn,slug,categoryId,model,materialZh,materialEn,finishZh,finishEn,summaryZh,summaryEn,coverImage,status,sortOrder,id]) as any
  if (!result.affectedRows) throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  return { ok: true, id, status, sortOrder }
})
