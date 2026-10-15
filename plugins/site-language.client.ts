import { SITE_LANGUAGE_KEY, defaultSiteLanguage, resolveStoredLanguage, type SiteLanguage } from '~/composables/useSiteLanguage'

export default defineNuxtPlugin(() => {
  const languageCookie = useCookie<SiteLanguage>(SITE_LANGUAGE_KEY, { default: () => defaultSiteLanguage })
  const language = useState<SiteLanguage>('site-language', () => resolveStoredLanguage(null, languageCookie.value))

  const apply = (next: SiteLanguage) => {
    language.value = next
    languageCookie.value = next
    localStorage.setItem(SITE_LANGUAGE_KEY, next)
    document.documentElement.lang = next === 'en' ? 'en' : 'zh-CN'
  }

  onNuxtReady(() => apply(resolveStoredLanguage(localStorage.getItem(SITE_LANGUAGE_KEY), languageCookie.value)))

  window.addEventListener('storage', (event) => {
    if (event.key === SITE_LANGUAGE_KEY) apply(resolveStoredLanguage(event.newValue, languageCookie.value))
  })
})
