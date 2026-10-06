import { getMysqlPool } from '~/server/utils/mysql'
import { requireAdmin } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Inquiry id is required' })

  const [result] = await getMysqlPool().execute(
    'DELETE FROM inquiries WHERE id = ?',
    [id]
  ) as any
  if (!result.affectedRows) throw createError({ statusCode: 404, statusMessage: 'Inquiry not found' })
  return { ok: true, id }
})
