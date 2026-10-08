import { assertSameOrigin, clearAdminSession } from '~/server/utils/admin-auth'

export default defineEventHandler((event) => {
  assertSameOrigin(event)
  clearAdminSession(event)
  return { ok: true }
})
