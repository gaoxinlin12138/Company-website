import { getMysqlPool } from '~/server/utils/mysql'
import { readAdminSession } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  const [rows] = await getMysqlPool().query('SELECT COUNT(*) AS count FROM admin_users') as any
  const session = readAdminSession(event)
  return {
    authenticated: Boolean(session),
    user: session ? { username: session.username, role: session.role } : null,
    needsSetup: Number(rows[0]?.count || 0) === 0
  }
})
