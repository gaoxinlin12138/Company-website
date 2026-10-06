import { createHash, randomUUID } from 'node:crypto'

type BaiduTranslationItem = { src: string; dst: string }
type BaiduTranslationResponse = {
  from?: string
  to?: string
  trans_result?: BaiduTranslationItem[]
  error_code?: string
  error_msg?: string
}

type TranslationPart = {
  fieldIndex: number
  lineIndex: number
  partIndex: number
  text: string
}

const endpoint = 'https://fanyi-api.baidu.com/api/trans/vip/translate'
const requestByteLimit = 4800
const partByteLimit = 3800

const errorMessages: Record<string, string> = {
  '52001': '百度翻译请求超时，请稍后重试。',
  '52002': '百度翻译服务暂时异常，请稍后重试。',
  '52003': '百度翻译凭证无效，请检查 APP ID 和密钥。',
  '54000': '百度翻译请求参数不完整。',
  '54001': '百度翻译签名校验失败，请检查密钥配置。',
  '54003': '百度翻译调用频率过高，请稍后再保存。',
  '54004': '百度翻译账户余额不足或额度已用完。',
  '54005': '翻译内容过长且调用过于频繁，请稍后重试。',
  '58000': '当前服务器 IP 未通过百度翻译校验。',
  '58001': '百度翻译暂不支持当前语言方向。',
  '90107': '百度翻译账号尚未完成认证。'
}

function splitByUtf8Bytes(value: string, maxBytes: number) {
  const parts: string[] = []
  let current = ''
  let currentBytes = 0
  for (const character of value) {
    const bytes = Buffer.byteLength(character, 'utf8')
    if (current && currentBytes + bytes > maxBytes) {
      parts.push(current)
      current = character
      currentBytes = bytes
    } else {
      current += character
      currentBytes += bytes
    }
  }
  if (current) parts.push(current)
  return parts
}

function makeSignature(appId: string, query: string, salt: string, secretKey: string) {
  return createHash('md5').update(`${appId}${query}${salt}${secretKey}`, 'utf8').digest('hex')
}

async function translateBatch(parts: TranslationPart[], appId: string, secretKey: string) {
  const query = parts.map(item => item.text).join('\n')
  const salt = randomUUID().replaceAll('-', '')
  const body = new URLSearchParams({
    q: query,
    from: 'zh',
    to: 'en',
    appid: appId,
    salt,
    sign: makeSignature(appId, query, salt, secretKey)
  })

  let response: BaiduTranslationResponse
  try {
    response = await $fetch<BaiduTranslationResponse>(endpoint, {
      method: 'POST',
      body,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      timeout: 20000
    })
  } catch {
    throw createError({ statusCode: 502, statusMessage: '无法连接百度翻译服务，请检查网络后重试。' })
  }

  if (response.error_code) {
    throw createError({
      statusCode: response.error_code === '54003' ? 429 : 502,
      statusMessage: errorMessages[response.error_code] || `百度翻译失败（${response.error_code}）。`
    })
  }
  if (!Array.isArray(response.trans_result) || response.trans_result.length !== parts.length) {
    throw createError({ statusCode: 502, statusMessage: '百度翻译返回内容不完整，请重试。' })
  }
  return response.trans_result.map(item => String(item.dst || '').trim())
}

export async function translateChineseTexts(texts: string[]) {
  const config = useRuntimeConfig()
  const appId = String(config.baiduTranslateAppId || '').trim()
  const secretKey = String(config.baiduTranslateSecretKey || '').trim()
  if (!appId || !secretKey) {
    throw createError({ statusCode: 503, statusMessage: '百度翻译尚未配置，请在服务器环境变量中填写 APP ID 和密钥。' })
  }

  const lineShapes = texts.map(text => String(text || '').replaceAll('红财万富', 'HONGCAI_WANFU').replace(/\r\n?/g, '\n').split('\n'))
  const parts: TranslationPart[] = []
  lineShapes.forEach((lines, fieldIndex) => {
    lines.forEach((line, lineIndex) => {
      const cleanLine = line.trim()
      if (!cleanLine) return
      splitByUtf8Bytes(cleanLine, partByteLimit).forEach((text, partIndex) => {
        parts.push({ fieldIndex, lineIndex, partIndex, text })
      })
    })
  })

  const translatedParts = new Map<string, string>()
  let batch: TranslationPart[] = []
  let batchBytes = 0
  const flush = async () => {
    if (!batch.length) return
    const translated = await translateBatch(batch, appId, secretKey)
    batch.forEach((item, index) => translatedParts.set(`${item.fieldIndex}:${item.lineIndex}:${item.partIndex}`, translated[index]))
    batch = []
    batchBytes = 0
  }

  for (const part of parts) {
    const bytes = Buffer.byteLength(part.text, 'utf8') + (batch.length ? 1 : 0)
    if (batch.length && batchBytes + bytes > requestByteLimit) await flush()
    batch.push(part)
    batchBytes += bytes
  }
  await flush()

  return lineShapes.map((lines, fieldIndex) => lines.map((line, lineIndex) => {
    if (!line.trim()) return ''
    const matchingParts = parts.filter(item => item.fieldIndex === fieldIndex && item.lineIndex === lineIndex)
    return matchingParts.map(item => translatedParts.get(`${fieldIndex}:${lineIndex}:${item.partIndex}`) || '').join('')
  }).join('\n').replace(/HONGCAI[-_ ]WANFU/gi, 'Hongcai Wanfu'))
}
