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

export function setAdminSession(event: H3Event, session: Omit<AdminSession, 'exp'>) {
  const payload = encode(JSON.stringify({ ...session, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }))
  setCookie(event, SESSION_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: 'lax',
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
  const session = readAdminSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Admin authentication required' })
  return session
}

export { SESSION_COOKIE }
