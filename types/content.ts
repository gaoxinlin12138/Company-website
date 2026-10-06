export type PublishStatus = 'draft' | 'published' | 'archived'

export interface LocalizedText {
  zh: string
  en: string
}

export interface MediaAsset {
  id: string
  url: string
  alt: LocalizedText
  filename?: string
}

export interface HomeHeroSlide {
  id: string
  category: LocalizedText
  titleLead: LocalizedText
  titleEmphasis: LocalizedText
  summary: LocalizedText
  image: string
  primaryAction: LocalizedText & { to: string }
  secondaryAction: LocalizedText
  sortOrder: number
  status: PublishStatus
}

export interface ProductRecord {
  id: string
  name: LocalizedText
  slug: string
  categoryId: string
  model: string
  material: LocalizedText
  finish: LocalizedText
  summary: LocalizedText
  coverImage: string
  gallery: string[]
  status: PublishStatus
  sortOrder: number
}

export interface ArticleRecord {
  id: string
  title: LocalizedText
  slug: string
  categoryId: string
  summary: LocalizedText
  content: LocalizedText
  coverImage: string
  publishedAt: string | null
  status: PublishStatus
  sortOrder: number
}

export interface CaseRecord extends ArticleRecord {
  projectType: LocalizedText
  location: LocalizedText
  suppliedProducts: LocalizedText
}

export interface InquiryRecord {
  id: string
  name: string
  company: string
  email: string
  phone?: string
  interest: string
  message: string
  source: string
  status: 'new' | 'processing' | 'closed'
  createdAt: string
}

