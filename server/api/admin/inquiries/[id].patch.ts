import { getMysqlPool } from '~/server/utils/mysql'
import { requireAdmin } from '~/server/utils/admin-auth'

const allowedStatuses = new Set(['NEW', 'PROCESSING', 'CLOSED'])

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const input = await readBody(event) as Record<string, unknown>
  const status = typeof input?.status === 'string' ? input.status.toUpperCase() : ''
  const internalNote = typeof input?.internalNote === 'string' ? input.internalNote.trim() : ''
  if (!id || !allowedStatuses.has(status) || internalNote.length > 4000) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid inquiry update' })
  }
  const [result] = await getMysqlPool().execute(
    'UPDATE inquiries SET status = ?, internal_note = ? WHERE id = ?',
    [status, internalNote || null, id]
  ) as any
  if (!result.affectedRows) throw createError({ statusCode: 404, statusMessage: 'Inquiry not found' })
  return { ok: true, id, status, internalNote: internalNote || null }
})
