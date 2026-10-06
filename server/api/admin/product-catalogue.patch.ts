import { requireAdmin } from '~/server/utils/admin-auth'
import type { ProductCatalogueContent } from '~/data/site-content'
import { readSiteSetting, writeSiteSetting } from '~/server/utils/site-settings'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody(event)
  if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: '内容格式不正确。' })
  const current = await readSiteSetting('product-catalogue') as ProductCatalogueContent
  const next = {
    fileUrl: typeof body.fileUrl === 'string' && body.fileUrl.trim() ? body.fileUrl : current.fileUrl,
    titleZh: current.titleZh,
    titleEn: current.titleEn
  }
  return writeSiteSetting('product-catalogue', next)
})
