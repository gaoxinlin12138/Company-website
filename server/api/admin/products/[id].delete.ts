import { getMysqlPool } from '~/server/utils/mysql'
import { requireAdmin } from '~/server/utils/admin-auth'
export default defineEventHandler(async (event) => { requireAdmin(event); const id = getRouterParam(event, 'id') || ''; const [result] = await getMysqlPool().execute('DELETE FROM products WHERE id = ?', [id]) as any; if (!result.affectedRows) throw createError({ statusCode: 404, statusMessage: 'Product not found' }); return { ok: true, id } })
