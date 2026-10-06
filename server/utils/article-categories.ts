import { NEWS_CATEGORIES } from '~/data/news'
import { getMysqlPool } from '~/server/utils/mysql'

export async function requireArticleCategory(categoryId: string) {
  const [rows] = await getMysqlPool().query(
    'SELECT id FROM categories WHERE id = ? AND name_zh IN (?, ?) AND status <> ?',
    [categoryId, ...NEWS_CATEGORIES, 'ARCHIVED']
  ) as any
  if (!rows[0]) {
    throw createError({ statusCode: 400, statusMessage: '新闻分类仅支持公司新闻或行业资讯。' })
  }
}

export function parsePublishedDate(value: unknown) {
  const date = typeof value === 'string' ? value.trim() : ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError({ statusCode: 400, statusMessage: '请选择有效的发布日期。' })
  }
  const parsed = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw createError({ statusCode: 400, statusMessage: '请选择有效的发布日期。' })
  }
  return date
}
