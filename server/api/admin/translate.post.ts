import { requireAdmin } from '~/server/utils/admin-auth'
import { translateChineseTexts } from '~/server/utils/baidu-translate'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody(event) as { texts?: unknown }
  if (!Array.isArray(body?.texts) || body.texts.length < 1 || body.texts.length > 100) {
    throw createError({ statusCode: 400, statusMessage: '每次可翻译 1–100 段中文内容。' })
  }
  const texts = body.texts.map(item => typeof item === 'string' ? item.trim() : '')
  if (texts.some(text => !text)) throw createError({ statusCode: 400, statusMessage: '翻译内容不能为空。' })
  const totalLength = texts.reduce((sum, text) => sum + text.length, 0)
  if (totalLength > 30000) throw createError({ statusCode: 413, statusMessage: '本次翻译内容过长，请分次保存。' })
  return { translations: await translateChineseTexts(texts) }
})
