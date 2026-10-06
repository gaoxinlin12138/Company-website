import { getMysqlPool } from '~/server/utils/mysql'
import { setAdminSession, verifyAdminPassword } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  const input = await readBody(event) as Record<string, unknown>
  const username = typeof input?.username === 'string' ? input.username.trim() : ''
  const password = typeof input?.password === 'string' ? input.password : ''
  if (!username || !password) throw createError({ statusCode: 400, statusMessage: 'Username and password are required' })
  const [rows] = await getMysqlPool().execute(
    'SELECT username, password_hash, role FROM admin_users WHERE username = ? LIMIT 1',
    [username]
  ) as any
  const user = rows[0]
  if (!user || !(await verifyAdminPassword(password, user.password_hash))) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' })
  }
  setAdminSession(event, { username: user.username, role: user.role })
  return { ok: true, user: { username: user.username, role: user.role } }
})
