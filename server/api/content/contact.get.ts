import { defaultContactContent } from '~/data/site-content'
import { readSiteSetting } from '~/server/utils/site-settings'

export default defineEventHandler(async () => {
  try { return await readSiteSetting('contact') } catch { return defaultContactContent }
})
