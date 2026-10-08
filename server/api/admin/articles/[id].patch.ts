import { getMysqlPool } from '~/server/utils/mysql'
import { requireAdmin } from '~/server/utils/admin-auth'
import { parsePublishedDate, requireArticleCategory } from '~/server/utils/article-categories'
import { readText } from '~/server/utils/input'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const input = await readBody(event) as Record<string, unknown>
  const text=(key:string,max=10000)=>readText(input,key,max); const titleZh=text('titleZh',240),titleEn=text('titleEn',240),slug=text('slug',240),categoryId=text('categoryId',32),summaryZh=text('summaryZh'),summaryEn=text('summaryEn'),contentZh=text('contentZh'),contentEn=text('contentEn'),coverImage=text('coverImage',500); const status=text('status',12).toUpperCase(); const sortOrder=Number(input?.sortOrder)
  if (input?.status && Object.keys(input).every((key) => ['status', 'sortOrder'].includes(key))) {
    if (!['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status) || (input.sortOrder !== undefined && (!Number.isInteger(sortOrder) || sortOrder < 0))) throw createError({ statusCode: 400, statusMessage: '无效的新闻状态' })
    const [result] = await getMysqlPool().execute(
      input.sortOrder === undefined
        ? "UPDATE articles SET status=?, published_at=IF(?='PUBLISHED', COALESCE(published_at, CURRENT_DATE()), published_at) WHERE id=?"
        : "UPDATE articles SET status=?,sort_order=?,published_at=IF(?='PUBLISHED', COALESCE(published_at, CURRENT_DATE()), published_at) WHERE id=?",
      input.sortOrder === undefined ? [status, status, id] : [status, sortOrder, status, id]
    ) as any
    if (!result.affectedRows) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    return { ok: true, id, status, sortOrder: input.sortOrder === undefined ? undefined : sortOrder }
  }
  if(!id||!titleZh||!titleEn||!slug||!categoryId||!summaryZh||!summaryEn||!contentZh||!contentEn||!coverImage||!['DRAFT','PUBLISHED','ARCHIVED'].includes(status)||!Number.isInteger(sortOrder)||sortOrder<0) throw createError({statusCode:400,statusMessage:'请完整填写新闻必填项。'})
  const publishedAt = parsePublishedDate(input.publishedAt)
  await requireArticleCategory(categoryId)
  const [result] = await getMysqlPool().execute('UPDATE articles SET title_zh=?,title_en=?,slug=?,category_id=?,summary_zh=?,summary_en=?,content_zh=?,content_en=?,cover_image=?,published_at=?,status=?,sort_order=? WHERE id=?', [titleZh,titleEn,slug,categoryId,summaryZh,summaryEn,contentZh,contentEn,coverImage,publishedAt,status,sortOrder,id]) as any
  if (!result.affectedRows) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  return { ok: true, id, status, sortOrder }
})
