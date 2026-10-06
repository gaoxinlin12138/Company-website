type InquiryPayload = {
  name: string
  company: string
  email: string
  phone?: string
  interest: string
  message: string
  source: string
}

function validateInquiry(payload: unknown): InquiryPayload | null {
  if (!payload || typeof payload !== 'object') return null
  const input = payload as Record<string, unknown>
  const value = (key: string) => typeof input[key] === 'string' ? input[key].trim() : ''
  const name = value('name')
  const company = value('company')
  const email = value('email')
  const phone = value('phone')
  const interest = value('interest')
  const message = value('message')
  const source = value('source') || 'website'
  if (!name || name.length > 80 || company.length > 120 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 160 || phone.length > 60 || !interest || interest.length > 120 || message.length > 4000 || source.length > 80) return null
  return { name, company, email, phone: phone || undefined, interest, message, source }
}

export default defineEventHandler(async (event) => {
  const payload = await readBody(event)
  const inquiry = validateInquiry(payload)
  if (!inquiry) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid inquiry payload' })
  }

  try {
    const id = crypto.randomUUID().replaceAll('-', '')
    await getMysqlPool().execute(
      `INSERT INTO inquiries (id, name, company, email, phone, interest, message, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, inquiry.name, inquiry.company, inquiry.email, inquiry.phone || null, inquiry.interest, inquiry.message, inquiry.source]
    )
    return { ok: true, inquiry: { id, ...inquiry } }
  } catch (error) {
    console.error('Inquiry persistence failed', error)
    throw createError({ statusCode: 503, statusMessage: 'Inquiry service is temporarily unavailable' })
  }
})

import { getMysqlPool } from '~/server/utils/mysql'

