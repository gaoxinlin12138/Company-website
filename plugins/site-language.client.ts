import { SITE_LANGUAGE_KEY, type SiteLanguage } from '~/composables/useSiteLanguage'

export default defineNuxtPlugin(() => {
  const languageCookie = useCookie<SiteLanguage>(SITE_LANGUAGE_KEY, { default: () => 'zh' })
  const language = useState<SiteLanguage>('site-language', () => languageCookie.value === 'en' ? 'en' : 'zh')

  const apply = (next: SiteLanguage) => {
    language.value = next
    languageCookie.value = next
    localStorage.setItem(SITE_LANGUAGE_KEY, next)
    document.documentElement.lang = next === 'en' ? 'en' : 'zh-CN'
  }

  onNuxtReady(() => apply(localStorage.getItem(SITE_LANGUAGE_KEY) === 'en' ? 'en' : languageCookie.value))

  window.addEventListener('storage', (event) => {
    if (event.key === SITE_LANGUAGE_KEY) apply(event.newValue === 'en' ? 'en' : 'zh')
  })
})
