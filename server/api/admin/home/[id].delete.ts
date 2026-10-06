import { requireAdmin } from '~/server/utils/admin-auth'

export default defineEventHandler((event) => {
  requireAdmin(event)
  throw createError({ statusCode: 405, statusMessage: '首页轮播固定为4个位置，不能删除' })
})
