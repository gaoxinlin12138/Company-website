import { requireAdmin } from '~/server/utils/admin-auth'
import { readSiteSetting } from '~/server/utils/site-settings'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  return readSiteSetting('about')
})
