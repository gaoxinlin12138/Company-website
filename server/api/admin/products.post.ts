import { getMysqlPool } from '~/server/utils/mysql'
import { requireAdmin } from '~/server/utils/admin-auth'
import { readText } from '~/server/utils/input'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const input = await readBody(event) as Record<string, unknown>
  const model = readText(input, 'model', 120); const nameZh = model; const nameEn = model; const categoryId = readText(input, 'categoryId', 32)
  const materialZh = readText(input, 'materialZh', 120); const materialEn = readText(input, 'materialEn', 120) || materialZh; const finishZh = readText(input, 'finishZh', 120) || '—'; const finishEn = readText(input, 'finishEn', 120) || '—'; const summaryZh = readText(input, 'summaryZh') || model; const summaryEn = readText(input, 'summaryEn') || model; const coverImage = readText(input, 'coverImage', 500)
  const slug = readText(input, 'slug', 200) || `${model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'product'}-${Date.now()}`
  const status = readText(input, 'status', 12).toUpperCase() || 'DRAFT'; const sortOrder = Number(input.sortOrder || 0)
  if (!slug || !categoryId || !model || !materialZh || !coverImage || !['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status) || !Number.isInteger(sortOrder) || sortOrder < 0) throw createError({ statusCode: 400, statusMessage: '请填写产品型号、材质、分类和图片' })
  const id = crypto.randomUUID().replaceAll('-', '')
  try { await getMysqlPool().execute('INSERT INTO products (id,name_zh,name_en,slug,category_id,model,material_zh,material_en,finish_zh,finish_en,summary_zh,summary_en,cover_image,status,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [id,nameZh,nameEn,slug,categoryId,model,materialZh,materialEn,finishZh,finishEn,summaryZh,summaryEn,coverImage,status,sortOrder]) } catch (error: any) { if (error?.code === 'ER_DUP_ENTRY') throw createError({ statusCode: 409, statusMessage: '产品 slug 已存在' }); throw error }
  return { ok: true, id }
})
