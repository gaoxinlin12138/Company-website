import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import type { H3Event } from 'h3'

const scrypt = promisify(scryptCallback)
const SESSION_COOKIE = 'hongcai_admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 12

type AdminSession = {
  username: string
  role: string
  exp: number
}

function sessionSecret() {
  const secret = String(useRuntimeConfig().sessionSecret || '')
  if (secret.length < 32) throw createError({ statusCode: 500, statusMessage: 'Admin session secret is not configured' })
  return secret
}

export function adminSessionConfigured() {
  return String(useRuntimeConfig().sessionSecret || '').length >= 32
}

function encode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function decode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(value: string) {
  return createHmac('sha256', sessionSecret()).update(value).digest('base64url')
}

export async function hashAdminPassword(password: string) {
  const salt = randomBytes(16)
  const derived = await scrypt(password, salt, 64) as Buffer
  return `scrypt$${salt.toString('base64url')}$${derived.toString('base64url')}`
}

export async function verifyAdminPassword(password: string, stored: string) {
  const [algorithm, saltValue, hashValue] = stored.split('$')
  if (algorithm !== 'scrypt' || !saltValue || !hashValue) return false
  try {
    const expected = Buffer.from(hashValue, 'base64url')
    const actual = await scrypt(password, Buffer.from(saltValue, 'base64url'), expected.length) as Buffer
    return expected.length === actual.length && timingSafeEqual(expected, actual)
  } catch {
    return false
  }
}

export async function ensureConfiguredAdmin() {
  const { getMysqlPool } = await import('~/server/utils/mysql')
  const pool = getMysqlPool()
  const [rows] = await pool.query(
    'SELECT username FROM admin_users ORDER BY created_at ASC LIMIT 1'
  ) as any
  if (rows[0]?.username) return { ready: true, username: String(rows[0].username) }

  const config = useRuntimeConfig()
  const username = String(config.adminUsername || '').trim()
  const password = String(config.adminPassword || '')
  if (!/^[\w.-]{3,60}$/.test(username) || password.length < 12 || password.length > 200) {
    return { ready: false, username }
  }

  const id = randomBytes(16).toString('hex')
  const passwordHash = await hashAdminPassword(password)
  await pool.execute(
    'INSERT IGNORE INTO admin_users (id, username, password_hash, role) VALUES (?, ?, ?, ?)',
    [id, username, passwordHash, 'admin']
  )
  const [created] = await pool.query(
    'SELECT username FROM admin_users ORDER BY created_at ASC LIMIT 1'
  ) as any
  return {
    ready: Boolean(created[0]?.username),
    username: String(created[0]?.username || username)
  }
}

export function assertSameOrigin(event: H3Event) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(event.method)) return
  const origin = getHeader(event, 'origin')
  if (!origin) return
  try {
    if (new URL(origin).host !== getRequestURL(event).host) {
      throw createError({ statusCode: 403, statusMessage: 'Cross-origin admin request rejected' })
    }
  } catch (error: any) {
    if (error?.statusCode === 403) throw error
    throw createError({ statusCode: 403, statusMessage: 'Invalid request origin' })
  }
}

export function setAdminSession(event: H3Event, session: Omit<AdminSession, 'exp'>) {
  const payload = encode(JSON.stringify({ ...session, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }))
  setCookie(event, SESSION_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS
  })
}

export function clearAdminSession(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

export function readAdminSession(event: H3Event): AdminSession | null {
  const value = getCookie(event, SESSION_COOKIE)
  if (!value) return null
  const separator = value.lastIndexOf('.')
  if (separator < 1) return null
  const payload = value.slice(0, separator)
  const providedSignature = value.slice(separator + 1)
  const expectedSignature = sign(payload)
  const provided = Buffer.from(providedSignature)
  const expected = Buffer.from(expectedSignature)
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null
  try {
    const session = JSON.parse(decode(payload)) as AdminSession
    if (!session.username || !session.role || !Number.isFinite(session.exp) || session.exp < Math.floor(Date.now() / 1000)) return null
    return session
  } catch {
    return null
  }
}

export function requireAdmin(event: H3Event) {
  assertSameOrigin(event)
  const session = readAdminSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Admin authentication required' })
  return session
}

export { SESSION_COOKIE }
