import { defaultSocialContactContent } from '~/data/site-content'
import { readSiteSetting } from '~/server/utils/site-settings'

export default defineEventHandler(async () => {
  try {
    return await readSiteSetting('social-contact')
  } catch {
    return defaultSocialContactContent
  }
})
