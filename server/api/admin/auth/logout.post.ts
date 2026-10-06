import { clearAdminSession } from '~/server/utils/admin-auth'

export default defineEventHandler((event) => {
  clearAdminSession(event)
  return { ok: true }
})
