import { requireAdmin } from '~/server/utils/admin-auth'

/**
 * 配置自查接口（仅管理员可访问）。
 * 只返回各项配置是否就绪与值的长度，绝不返回密钥内容。
 */
export default defineEventHandler((event) => {
  requireAdmin(event)
  const config = useRuntimeConfig()

  const text = (value: unknown) => String(value ?? '').trim()
  const report = (value: unknown) => ({ configured: text(value).length > 0, length: text(value).length })

  return {
    checkedAt: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || '(未设置)',
    database: report(config.databaseUrl),
    sessionSecret: { configured: text(config.sessionSecret).length >= 32, length: text(config.sessionSecret).length },
    baiduTranslate: {
      appId: report(config.baiduTranslateAppId),
      secretKey: report(config.baiduTranslateSecretKey)
    },
    amap: {
      key: report(config.public?.amapKey),
      securityCode: report(config.public?.amapSecurityCode)
    },
    adminBootstrap: {
      username: text(config.adminUsername) ? '已设置' : '未设置',
      passwordLength: text(config.adminPassword).length
    },
    cookieSecure: config.cookieSecure === undefined ? '(按 NODE_ENV 判断)' : Boolean(config.cookieSecure)
  }
})
