import { getMysqlPool } from '~/server/utils/mysql'
import { requireAdmin } from '~/server/utils/admin-auth'

const allowedStatuses = new Set(['NEW', 'PROCESSING', 'CLOSED'])

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const query = getQuery(event)
  const page = Math.max(1, Number.parseInt(String(query.page || '1'), 10) || 1)
  const pageSize = Math.min(50, Math.max(5, Number.parseInt(String(query.pageSize || '20'), 10) || 20))
  const status = String(query.status || '').toUpperCase()
  const search = String(query.search || '').trim()
  const conditions: string[] = []
  const params: (string | number)[] = []
  if (allowedStatuses.has(status)) {
    conditions.push('status = ?')
    params.push(status)
  }
  if (search) {
    conditions.push('(name LIKE ? OR company LIKE ? OR email LIKE ? OR interest LIKE ?)')
    const pattern = `%${search}%`
    params.push(pattern, pattern, pattern, pattern)
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const pool = getMysqlPool()
  const [countRows] = await pool.query(`SELECT COUNT(*) AS count FROM inquiries ${where}`, params) as any
  const offset = (page - 1) * pageSize
  const [rows] = await pool.query(
    `SELECT id, name, company, email, phone, interest, message, source, status, internal_note AS internalNote, created_at AS createdAt, updated_at AS updatedAt
     FROM inquiries ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  )
  return { items: rows, page, pageSize, total: Number(countRows[0]?.count || 0) }
})
