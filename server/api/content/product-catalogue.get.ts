import { defaultProductCatalogueContent } from '~/data/site-content'
import { readSiteSetting } from '~/server/utils/site-settings'

export default defineEventHandler(async () => {
  try { return await readSiteSetting('product-catalogue') } catch { return defaultProductCatalogueContent }
})
