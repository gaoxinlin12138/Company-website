import { defaultAboutContent, defaultContactContent, defaultHomeProductContent, defaultProductCatalogueContent, defaultSocialContactContent, type ProductCatalogueContent, type SocialContactContent } from '~/data/site-content'
import { getMysqlPool } from '~/server/utils/mysql'

export type SiteSettingKey = 'about' | 'contact' | 'social-contact' | 'product-catalogue' | 'home-products'

const defaults = { about: defaultAboutContent, contact: defaultContactContent, 'social-contact': defaultSocialContactContent, 'product-catalogue': defaultProductCatalogueContent, 'home-products': defaultHomeProductContent }

function mergeValue<T>(base: T, value: unknown): T {
  if (Array.isArray(base)) return (Array.isArray(value) ? value : base) as T
  if (base && typeof base === 'object') {
    const source = value && typeof value === 'object' ? value as Record<string, unknown> : {}
    const output: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(base as Record<string, unknown>)) output[key] = mergeValue(child, source[key])
    for (const [key, child] of Object.entries(source)) if (!(key in output)) output[key] = child
    return output as T
  }
  return (value === undefined || value === null ? base : value) as T
}

function normalizeSiteSetting(key: SiteSettingKey, value: unknown) {
  const merged = mergeValue(defaults[key], value)
  if (key === 'social-contact') {
    const social = merged as SocialContactContent
    return {
      channels: social.channels.map(channel => ({
        id: channel.id,
        icon: channel.icon,
        nameZh: channel.nameZh,
        nameEn: channel.nameEn,
        qrImage: channel.qrImage,
        enabled: channel.enabled
      }))
    }
  }

  if (key !== 'product-catalogue') return merged

  const catalogue = merged as ProductCatalogueContent
  return {
    fileUrl: catalogue.fileUrl,
    titleZh: catalogue.titleZh,
    titleEn: catalogue.titleEn
  }
}

export async function readSiteSetting(key: SiteSettingKey) {
  const [rows] = await getMysqlPool().query('SELECT `value` FROM site_settings WHERE `key` = ?', [key]) as any
  let value: unknown = rows?.[0]?.value
  if (typeof value === 'string') {
    try { value = JSON.parse(value) } catch { value = undefined }
  }
  return normalizeSiteSetting(key, value)
}

export async function writeSiteSetting(key: SiteSettingKey, value: unknown) {
  const merged = normalizeSiteSetting(key, value)
  await getMysqlPool().execute(
    'INSERT INTO site_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)',
    [key, JSON.stringify(merged)]
  )
  return merged
}
