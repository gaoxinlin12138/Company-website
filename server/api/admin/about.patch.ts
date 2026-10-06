import { requireAdmin } from '~/server/utils/admin-auth'
import { writeSiteSetting } from '~/server/utils/site-settings'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody(event)
  if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: '内容格式不正确。' })
  return writeSiteSetting('about', body)
})
