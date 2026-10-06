import { getMysqlPool } from '~/server/utils/mysql'
import { hashAdminPassword, setAdminSession } from '~/server/utils/admin-auth'

function value(input: Record<string, unknown>, key: string) {
  return typeof input[key] === 'string' ? input[key].trim() : ''
}

export default defineEventHandler(async (event) => {
  const [existing] = await getMysqlPool().query('SELECT COUNT(*) AS count FROM admin_users') as any
  if (Number(existing[0]?.count || 0) > 0) throw createError({ statusCode: 409, statusMessage: 'Admin account already exists' })
  const input = await readBody(event) as Record<string, unknown>
  const username = value(input, 'username')
  const password = value(input, 'password')
  if (!/^[\w.-]{3,60}$/.test(username) || password.length < 10 || password.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Username or password does not meet the requirements' })
  }
  const id = crypto.randomUUID().replaceAll('-', '')
  const passwordHash = await hashAdminPassword(password)
  await getMysqlPool().execute(
    'INSERT INTO admin_users (id, username, password_hash, role) VALUES (?, ?, ?, ?)',
    [id, username, passwordHash, 'admin']
  )
  setAdminSession(event, { username, role: 'admin' })
  return { ok: true, user: { username, role: 'admin' } }
})
