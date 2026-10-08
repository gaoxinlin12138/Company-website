import { getMysqlPool } from '~/server/utils/mysql'
import { adminSessionConfigured, assertSameOrigin, ensureConfiguredAdmin, hashAdminPassword, setAdminSession, verifyAdminPassword } from '~/server/utils/admin-auth'

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5
const attempts = new Map<string, { count: number; resetAt: number }>()
const dummyHash = hashAdminPassword('not-a-real-admin-password')

function rateLimitKey(event: Parameters<typeof getRequestIP>[0], username: string) {
  return `${getRequestIP(event, { xForwardedFor: true }) || 'unknown'}:${username.toLowerCase()}`
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
