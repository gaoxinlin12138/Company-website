import { mkdir, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { ProductCatalogueContent } from '~/data/site-content'
import { requireAdmin } from '~/server/utils/admin-auth'
import { readSiteSetting, writeSiteSetting } from '~/server/utils/site-settings'

const allowedTypes: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'application/pdf': '.pdf'
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const parts = await readMultipartFormData(event)
  const file = parts?.find((part) => part.name === 'file' && part.data?.length)
  const kind = parts?.find((part) => part.name === 'kind')?.data?.toString() || 'products'
  const uploadKind = ['home', 'about', 'social', 'articles', 'cases', 'catalogue'].includes(kind) ? kind : 'products'
  const extension = extname(file?.filename || '').toLowerCase()
  const resolvedType = file?.type || (extension === '.pdf' ? 'application/pdf' : '')
  if (!file || !allowedTypes[resolvedType]) throw createError({ statusCode: 400, statusMessage: '请选择 JPG、PNG、WebP、GIF 图片或 PDF 文件' })
  if (uploadKind !== 'catalogue' && file.data.length > 5 * 1024 * 1024) throw createError({ statusCode: 413, statusMessage: '图片不能超过 5MB' })

  const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}${allowedTypes[resolvedType]}`
  const directory = join(process.cwd(), 'public', 'uploads', uploadKind)
  await mkdir(directory, { recursive: true })
  await writeFile(join(directory, fileName), file.data)
  const url = `/uploads/${uploadKind}/${fileName}`
  // Persist catalogue uploads immediately so a later settings save cannot
  // accidentally overwrite the URL with an empty form value.
  if (uploadKind === 'catalogue') {
    const current = await readSiteSetting('product-catalogue') as ProductCatalogueContent
    await writeSiteSetting('product-catalogue', {
      fileUrl: url,
      titleZh: current.titleZh,
      titleEn: current.titleEn
    })
  }
  return { ok: true, url, filename: file.filename || fileName }
})



