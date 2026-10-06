import { defaultAboutContent } from '~/data/site-content'
import { readSiteSetting } from '~/server/utils/site-settings'

export default defineEventHandler(async () => {
  try { return await readSiteSetting('about') } catch { return defaultAboutContent }
})
