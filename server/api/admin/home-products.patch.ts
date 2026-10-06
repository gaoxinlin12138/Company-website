import { requireAdmin } from '~/server/utils/admin-auth'
import { getMysqlPool } from '~/server/utils/mysql'
import { writeSiteSetting } from '~/server/utils/site-settings'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody(event) as { productIds?: unknown }
  if (!Array.isArray(body?.productIds)) {
    throw createError({ statusCode: 400, statusMessage: '请选择要展示的产品。' })
  }

  const productIds = body.productIds
    .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
    .map(id => id.trim())
    .filter((id, index, list) => list.indexOf(id) === index)

  if (productIds.length > 8) {
    throw createError({ statusCode: 400, statusMessage: '首页推荐产品最多选择 8 项。' })
  }

  const [rows] = await getMysqlPool().query(
    'SELECT id FROM products WHERE status = \'PUBLISHED\''
  ) as any
  const publishedIds = new Set((rows as Array<{ id: string }>).map(item => item.id))
  const validIds = productIds.filter(id => publishedIds.has(id))
  if (validIds.length !== productIds.length) {
    throw createError({ statusCode: 400, statusMessage: '部分产品已下架，请刷新后重新选择。' })
  }

  return writeSiteSetting('home-products', { productIds: validIds })
})
