export type PublishStatus = 'draft' | 'published' | 'archived'

export interface LocalizedText {
  zh: string
  en: string
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

