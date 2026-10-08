import { adminSessionConfigured, ensureConfiguredAdmin, readAdminSession } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  const admin = await ensureConfiguredAdmin()
  const session = readAdminSession(event)
  return {
    authenticated: Boolean(session),
    user: session ? { username: session.username, role: session.role } : null,
    ready: admin.ready && adminSessionConfigured(),
    loginUsername: admin.username
  }
})
