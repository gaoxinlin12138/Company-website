import { getMysqlPool } from '~/server/utils/mysql'
import { adminSessionConfigured, assertSameOrigin, ensureConfiguredAdmin, hashAdminPassword, setAdminSession, verifyAdminPassword } from '~/server/utils/admin-auth'

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5
const attempts = new Map<string, { count: number; resetAt: number }>()
const dummyHash = hashAdminPassword('not-a-real-admin-password')

/**
 * 取客户端真实 IP 用于限流。
 *
 * 不能直接用 X-Forwarded-For 的第一个值：nginx 的 $proxy_add_x_forwarded_for
 * 是「追加」，客户端自带的值会排在前面，攻击者换着伪造就能绕过限流。
 *
 * 取值优先级：
 *   1. X-Real-IP —— nginx 用 $remote_addr 覆盖写入，客户端伪造不了
 *   2. X-Forwarded-For 的最后一个值 —— 由我们这层代理追加，最接近真实来源
 *   3. socket 地址 —— 未经代理直接访问时使用
 */
function clientIp(event: Parameters<typeof getRequestIP>[0]) {
  const realIp = getHeader(event, 'x-real-ip')?.trim()
  if (realIp) return realIp

  const forwarded = getHeader(event, 'x-forwarded-for')
  if (forwarded) {
    const hops = forwarded.split(',').map(part => part.trim()).filter(Boolean)
    if (hops.length) return hops[hops.length - 1]!
  }

  return getRequestIP(event) || 'unknown'
}

function rateLimitKey(event: Parameters<typeof getRequestIP>[0], username: string) {
  return `${clientIp(event)}:${username.toLowerCase()}`
}

function currentAttempt(key: string) {
  const now = Date.now()
  if (attempts.size > 1000) {
    for (const [storedKey, stored] of attempts) {
      if (stored.resetAt <= now) attempts.delete(storedKey)
    }
  }
  const attempt = attempts.get(key)
  if (!attempt || attempt.resetAt <= now) {
    const fresh = { count: 0, resetAt: now + WINDOW_MS }
    attempts.set(key, fresh)
    return fresh
  }
  return attempt
}

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const input = await readBody(event) as Record<string, unknown>
  const username = typeof input?.username === 'string' ? input.username.trim() : ''
  const password = typeof input?.password === 'string' ? input.password : ''
  if (!username || username.length > 60 || !password || password.length > 200) {
    throw createError({ statusCode: 400, statusMessage: '请输入有效的管理员账号和密码' })
  }
  const key = rateLimitKey(event, username)
  const attempt = currentAttempt(key)
  if (attempt.count >= MAX_ATTEMPTS) {
    setResponseHeader(event, 'Retry-After', Math.ceil((attempt.resetAt - Date.now()) / 1000))
    throw createError({ statusCode: 429, statusMessage: '登录尝试过多，请 15 分钟后再试' })
  }
  const admin = await ensureConfiguredAdmin()
  if (!admin.ready || !adminSessionConfigured()) {
    throw createError({ statusCode: 503, statusMessage: '管理员账号尚未在服务器配置' })
  }
  const [rows] = await getMysqlPool().execute(
    'SELECT username, password_hash, role FROM admin_users ORDER BY created_at ASC LIMIT 1'
  ) as any
  const user = rows[0]
  const passwordMatches = await verifyAdminPassword(password, user?.password_hash || await dummyHash)
  if (!user || username !== user.username || !passwordMatches) {
    attempt.count += 1
    throw createError({ statusCode: 401, statusMessage: '管理员账号或密码不正确' })
  }
  attempts.delete(key)
  setAdminSession(event, { username: user.username, role: user.role })
  return { ok: true, user: { username: user.username, role: user.role } }
})
