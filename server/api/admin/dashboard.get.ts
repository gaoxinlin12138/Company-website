import { getMysqlPool } from '~/server/utils/mysql'
import { requireAdmin } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const [rows] = await getMysqlPool().query(`
    SELECT
      (SELECT COUNT(*) FROM products) AS products,
      (SELECT COUNT(*) FROM articles) AS articles,
      (SELECT COUNT(*) FROM case_studies) AS cases,
      (SELECT COUNT(*) FROM inquiries) AS inquiries,
      (SELECT COUNT(*) FROM inquiries WHERE status = 'NEW') AS newInquiries
  `) as any
  return Object.fromEntries(Object.entries(rows[0] || {}).map(([key, value]) => [key, Number(value || 0)]))
})
