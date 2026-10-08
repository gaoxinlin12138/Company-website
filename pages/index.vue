<script setup lang="ts">
import { homeHeroSlides } from '~/data/home'
import { caseStudies } from '~/data/case-studies'
import type { HomeHeroSlide } from '~/types/content'

const { language, t } = useSiteLanguage()
const activeSlide = ref(0)
const outgoingSlide = ref<number | null>(null)
const isHeroTransitioning = ref(false)
const pageRoot = ref<HTMLElement | null>(null)
let carouselTimer: ReturnType<typeof setInterval> | undefined
let heroTransitionTimer: ReturnType<typeof setTimeout> | undefined
let caseCarouselTimer: ReturnType<typeof setInterval> | undefined
let revealObserver: IntersectionObserver | undefined
const activeCaseIndex = ref(0)
const isCasePointerInside = ref(false)
const isCaseFocusInside = ref(false)
const homeCaseShowcase = ref<HTMLElement | null>(null)

const { data: homeContent } = await useFetch<{ heroSlides: HomeHeroSlide[] }>('/api/content/home', {
  default: () => ({ heroSlides: homeHeroSlides })
})
const isUsableSlide = (slide: HomeHeroSlide) => {
  const copy = `${slide.titleLead?.zh || ''}${slide.titleEmphasis?.zh || ''}${slide.summary?.zh || ''}`
  return !/(你好|发顺丰|测试|test)/i.test(copy) && copy.trim().length > 12
}
const slides = computed(() => {
  const published = homeContent.value.heroSlides.filter(item => item.status === 'published' && isUsableSlide(item)).sort((a, b) => a.sortOrder - b.sortOrder)
  return published.length ? published : homeHeroSlides.filter(item => item.status === 'published').sort((a, b) => a.sortOrder - b.sortOrder)
})
const localize = (value: { zh: string; en: string }) => value[language.value]

type HomeProduct = {
  id?: string
  name: string
  nameEn?: string
  category: string
  categoryEn?: string
  material: string
  materialEn?: string
  model?: string
  image: string
}

const { data: publishedProducts } = await useFetch<HomeProduct[]>('/api/content/home-products', {
  default: () => []
})
const recommendedProducts = computed(() => publishedProducts.value || [])
type HomeNews = {
  slug: string
  date: string
  category: string
  categoryEn?: string
  title: string
  titleEn?: string
  summary: string
  summaryEn?: string
}
const { data: managedNews } = await useFetch<HomeNews[]>('/api/content/articles', { default: () => [] })
const latestNews = computed(() => [...managedNews.value].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3))
const formatNewsDate = (date: string) => new Intl.DateTimeFormat(language.value === 'en' ? 'en-GB' : 'zh-CN', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
const aboutLinks = [
  { icon: 'lucide:building-2', zh: '公司简介', en: 'Company profile', to: '/about#company-profile' },
  { icon: 'lucide:layout-grid', zh: '产品体系', en: 'Product system', to: '/products' },
  { icon: 'lucide:handshake', zh: '合作咨询', en: 'Sourcing enquiry', to: '/contact' }
]
const advantages = [
  { icon: 'lucide:panels-top-left', image: '/assets/images/hero-sanitaryware.webp', zh: '产品范围清晰', en: 'Clear product scope', detailZh: '围绕卫浴产品、卫浴五金、安装及配件三大方向组织产品，并按使用场景与采购需求归类，帮助采购人员更快确定选品范围，减少前期信息查找和反复确认的成本。', detailEn: 'Products are organised across sanitaryware, bathroom hardware and installation parts, then grouped by application and sourcing needs to make early product selection clearer and more efficient.' },
  { icon: 'lucide:list-checks', image: '/assets/images/detail-materials.webp', zh: '信息围绕采购', en: 'Procurement-focused information', detailZh: '以类别、型号、材质、表面处理和产品图片为沟通基础，集中呈现采购过程中常用的关键信息，方便快速比较不同产品并整理候选清单。', detailEn: 'Categories, models, materials, finishes and product imagery bring frequently used sourcing information together, making comparisons and shortlist preparation more straightforward.' },
  { icon: 'lucide:messages-square', image: '/assets/images/hero-faucet-concept.webp', zh: '询价路径直接', en: 'A direct enquiry path', detailZh: '从产品浏览可直接进入询价，集中提交产品方向、预计数量、目标市场和项目要求，让后续报价、资料补充与细节确认更有针对性。', detailEn: 'Move directly from product browsing to an enquiry with product direction, estimated quantity, target market and project requirements, giving later quotation and detail confirmation a clearer focus.' },
  { icon: 'lucide:languages', image: '/assets/images/hero-basin-concept.webp', zh: '面向多类合作', en: 'Built for varied sourcing', detailZh: '页面兼顾批发、外贸与工程采购场景，支持中英文内容切换，帮助不同类型客户清晰了解产品范围，并更顺畅地开展合作沟通。', detailEn: 'The site supports wholesale, export and project sourcing with Chinese and English content, helping different buyers understand the product range and begin conversations more smoothly.' }
]

useSeoMeta({
  title: () => language.value === 'en' ? 'Hongcai Wanfu | Bathroom & Hardware Supplier' : '红财万富｜卫浴产品与五金供应商',
  description: () => language.value === 'en'
    ? 'Hongcai Wanfu supplies sanitaryware, bathroom hardware and installation parts for wholesale, export and project sourcing.'
    : '红财万富面向批发、外贸与工程采购，提供卫浴产品、卫浴五金与安装配件。'
})

function showSlide(index: number) {
  if (isHeroTransitioning.value || slides.value.length < 2) return
  const nextIndex = (index + slides.value.length) % slides.value.length
  if (nextIndex === activeSlide.value) return
  outgoingSlide.value = activeSlide.value
  activeSlide.value = nextIndex
  isHeroTransitioning.value = true
  if (heroTransitionTimer) clearTimeout(heroTransitionTimer)
  heroTransitionTimer = setTimeout(() => {
    outgoingSlide.value = null
    isHeroTransitioning.value = false
    heroTransitionTimer = undefined
  }, 840)
}

function heroStackClass(index: number) {
  if (index === activeSlide.value) return 'is-active'
  if (index === outgoingSlide.value) return 'is-exiting'
  return 'is-queued'
}

function changeSlide(step: number) {
  if (isHeroTransitioning.value) return
  showSlide(activeSlide.value + step)
  startCarousel()
}

function startCarousel() {
  stopCarousel()
  if (slides.value.length < 2) return
  carouselTimer = setInterval(() => showSlide(activeSlide.value + 1), 6500)
}

function stopCarousel() {
  if (carouselTimer) clearInterval(carouselTimer)
  carouselTimer = undefined
}

function showCase(index: number) {
  activeCaseIndex.value = (index + caseStudies.length) % caseStudies.length
}

function startCaseCarousel() {
  stopCaseCarousel()
  if (isCasePointerInside.value || isCaseFocusInside.value || caseStudies.length < 2 || (import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return
  caseCarouselTimer = setInterval(() => showCase(activeCaseIndex.value + 1), 5600)
}

function stopCaseCarousel() {
  if (caseCarouselTimer) clearInterval(caseCarouselTimer)
  caseCarouselTimer = undefined
}

function handleCasePointerEnter() {
  isCasePointerInside.value = true
  stopCaseCarousel()
}

function handleCasePointerLeave() {
  isCasePointerInside.value = false
  startCaseCarousel()
}

function handleCaseFocusIn() {
  isCaseFocusInside.value = true
  stopCaseCarousel()
}

function handleCaseFocusOut(event: FocusEvent) {
  if (homeCaseShowcase.value?.contains(event.relatedTarget as Node | null)) return
  isCaseFocusInside.value = false
  startCaseCarousel()
}

onMounted(() => {
  startCarousel()
  startCaseCarousel()
  const nodes = pageRoot.value?.querySelectorAll<HTMLElement>('[data-home-reveal]') || []
  revealObserver = new IntersectionObserver((items) => {
    items.forEach((item) => {
      if (!item.isIntersecting) return
      item.target.classList.add('is-visible')
      revealObserver?.unobserve(item.target)
    })
  }, { threshold: 0.14 })
  nodes.forEach(node => revealObserver?.observe(node))
})

onBeforeUnmount(() => {
  stopCarousel()
  stopCaseCarousel()
  if (heroTransitionTimer) clearTimeout(heroTransitionTimer)
  revealObserver?.disconnect()
})
</script>

<template>
  <div ref="pageRoot" class="home-page">
    <section class="home-hero" aria-roledescription="carousel" :aria-label="t('产品系列轮播')">
      <div class="home-hero__media" aria-live="off">
        <article
          v-for="(slide, index) in slides"
          :key="slide.id"
          class="home-hero__slide"
          :class="[`home-hero__slide--${slide.id}`, heroStackClass(index)]"
          :style="{ '--slide-image': `url('${slide.image}')` }"
          :aria-hidden="activeSlide !== index"
          :inert="activeSlide !== index"
        >
          <div class="home-hero__shade" aria-hidden="true"></div>
          <div class="home-hero__content">
            <p class="home-hero__category">{{ localize(slide.category) }}</p>
            <component :is="index === 0 ? 'h1' : 'h2'" class="home-hero__title"><span>{{ localize(slide.titleLead) }}</span><em>{{ localize(slide.titleEmphasis) }}</em></component>
            <p class="home-hero__summary">{{ localize(slide.summary) }}</p>
            <div class="home-hero__actions">
              <NuxtLink class="home-button home-button--red" :to="slide.primaryAction.to">{{ localize(slide.primaryAction) }} <Icon name="lucide:arrow-up-right" /></NuxtLink>
              <NuxtLink class="home-button home-button--ghost" to="/contact#inquiry">{{ localize(slide.secondaryAction) }} <Icon name="lucide:arrow-up-right" /></NuxtLink>
            </div>
          </div>
        </article>
      </div>
      <div class="home-hero__grain" aria-hidden="true"></div>
      <div class="home-hero__progress" :aria-label="t('轮播控制')">
        <button type="button" :disabled="isHeroTransitioning" :aria-label="language === 'en' ? 'Previous slide' : '上一张'" @click="changeSlide(-1)"><Icon name="lucide:arrow-left" /></button>
        <span>{{ String(activeSlide + 1).padStart(2, '0') }}</span>
        <i><b :key="activeSlide" class="is-running"></b></i>
        <span>{{ String(slides.length).padStart(2, '0') }}</span>
        <button type="button" :disabled="isHeroTransitioning" :aria-label="language === 'en' ? 'Next slide' : '下一张'" @click="changeSlide(1)"><Icon name="lucide:arrow-right" /></button>
      </div>
    </section>

    <section class="home-about" id="about-preview">
      <div class="home-container">
        <div class="home-about__grid">
          <header class="home-about__title">
            <h2>{{ language === 'en' ? 'About Hongcai Wanfu' : '关于红财万富' }}</h2>
            <p>{{ language === 'en' ? 'Bathroom products, made easier to source.' : '让卫浴产品采购更清晰。' }}</p>
          </header>
          <div class="home-about__copy">
            <p>{{ language === 'en' ? 'Hongcai Wanfu focuses on sanitaryware, bathroom hardware and installation parts. We organise product information around real sourcing needs, helping wholesale, export and project buyers understand category scope, compare models and materials, and move into quotation discussions with less repeated communication.' : '红财万富专注于卫浴产品、卫浴五金与安装配件。我们从真实采购需求出发整理产品信息，面向批发、外贸与工程采购客户，帮助客户清晰了解产品范围，快速比较型号、材质与适用方向，更顺畅地进入选品和询价沟通。' }}</p>
            <p>{{ language === 'en' ? 'From product selection and information confirmation to subsequent enquiry coordination, we continue to improve product images, specifications and supporting materials with verified information, providing a clearer and more efficient basis for every cooperation conversation.' : '从产品筛选、资料确认到后续询价对接，我们会根据真实信息持续完善产品图片、规格参数和配套资料，减少前期沟通中的信息差异，让每一次合作沟通都有更清晰、更高效的依据。' }}</p>
            <NuxtLink class="home-about__more" to="/about">{{ language === 'en' ? 'Learn more about us' : '进一步了解我们' }} <Icon name="lucide:arrow-right" /></NuxtLink>
          </div>
          <nav class="home-about__links" :aria-label="language === 'en' ? 'About and sourcing links' : '公司与合作入口'">
            <NuxtLink v-for="item in aboutLinks" :key="item.zh" :to="item.to"><span><Icon :name="item.icon" /></span><strong>{{ language === 'en' ? item.en : item.zh }}</strong></NuxtLink>
          </nav>
        </div>
      </div>
    </section>

    <section class="home-section home-section--paper" id="recommended-products">
      <div class="home-container">
        <div class="home-section-head" data-home-reveal>
          <div><h2>{{ language === 'en' ? 'Products buyers are viewing now' : '近期推荐产品' }}</h2><p>{{ language === 'en' ? 'A focused selection from the current published catalogue. Open the product centre for the full range and filters.' : '从当前已发布产品中精选展示，更多类别、材质和型号可前往产品中心查看。' }}</p></div>
          <NuxtLink to="/products">{{ language === 'en' ? 'Enter product centre' : '进入产品中心' }} <Icon name="lucide:arrow-up-right" /></NuxtLink>
        </div>
        <HomeProductOrbit :products="recommendedProducts" />
      </div>
    </section>

    <section class="home-advantages" id="advantages">
      <div class="home-container home-advantages__layout">
        <div class="home-advantages__intro" data-home-reveal>
          <h2>{{ language === 'en' ? 'Make sourcing conversations more focused.' : '让采购沟通，更快进入重点。' }}</h2>
          <p>{{ language === 'en' ? 'A good supplier website should not only show products. It should help buyers establish scope, identify information gaps and reach the next conversation efficiently.' : '一个好的供应商网站不只是展示产品，更要帮助采购人员确定范围、发现待确认信息，并顺畅进入下一步沟通。' }}</p>
          <NuxtLink class="home-advantages__cta" to="/contact">{{ language === 'en' ? 'Start an enquiry' : '提交采购需求' }} <Icon name="lucide:arrow-up-right" /></NuxtLink>
        </div>
        <div class="home-advantages__list" data-home-reveal>
          <article v-for="item in advantages" :key="item.zh">
            <img :src="item.image" alt="" width="640" height="420" loading="lazy">
            <Icon :name="item.icon" />
            <div><h3>{{ language === 'en' ? item.en : item.zh }}</h3><p>{{ language === 'en' ? item.detailEn : item.detailZh }}</p></div>
          </article>
        </div>
      </div>
    </section>

    <section class="home-stories" id="cases-news">
      <div class="home-container">
        <div class="home-section-head home-section-head--light" data-home-reveal>
          <div><h2>{{ language === 'en' ? 'Applications and updates' : '案例与动态' }}</h2><p>{{ language === 'en' ? 'Review application directions and follow the ongoing completion of product information.' : '了解产品应用方向，也关注产品资料与网站内容的持续更新。' }}</p></div>
        </div>
        <div class="home-stories__grid" data-home-reveal>
          <div
            ref="homeCaseShowcase"
            class="home-case-showcase"
            role="region"
            aria-roledescription="carousel"
            :aria-label="language === 'en' ? 'Application case carousel' : '应用案例轮播'"
            @pointerenter="handleCasePointerEnter"
            @pointerleave="handleCasePointerLeave"
            @focusin="handleCaseFocusIn"
            @focusout="handleCaseFocusOut"
          >
            <NuxtLink
              v-for="(item, index) in caseStudies"
              :key="item.id"
              class="home-case"
              :class="{ 'is-active': activeCaseIndex === index }"
              :to="{ path: '/cases', query: { category: item.category }, hash: '#case-list' }"
              :aria-hidden="activeCaseIndex !== index"
              :inert="activeCaseIndex !== index"
            >
              <img :src="item.image" :alt="t(item.title, item.titleEn)" width="1600" height="1066" loading="lazy">
              <div class="home-case__copy">
                <p>{{ t(item.type, item.typeEn) }}</p>
                <h3>{{ t(item.title, item.titleEn) }}</h3>
                <div v-if="item.summary" class="home-case__summary">{{ t(item.summary, item.summaryEn) }}</div>
                <dl><div><dt>{{ language === 'en' ? 'Application' : '应用空间' }}</dt><dd>{{ t(item.location || '', item.locationEn) }}</dd></div><div><dt>{{ t('供应产品') }}</dt><dd>{{ t(item.products, item.productsEn) }}</dd></div></dl>
                <strong>{{ language === 'en' ? 'Explore this case' : '查看这一案例' }} <Icon name="lucide:arrow-right" /></strong>
              </div>
            </NuxtLink>
            <div class="home-case-dots" role="group" :aria-label="language === 'en' ? 'Choose a case' : '选择案例'">
              <button
                v-for="(_, index) in caseStudies"
                :key="index"
                type="button"
                :class="{ 'is-active': activeCaseIndex === index }"
                :aria-current="activeCaseIndex === index ? 'true' : undefined"
                :aria-label="language === 'en' ? `Show case ${index + 1}` : `查看第 ${index + 1} 个案例`"
                @click="showCase(index)"
              ></button>
            </div>
          </div>
          <div class="home-news">
            <header><h3>{{ language === 'en' ? 'Latest updates' : '最新动态' }}</h3><NuxtLink to="/news">{{ language === 'en' ? 'View news' : '进入新闻动态' }} <Icon name="lucide:arrow-up-right" /></NuxtLink></header>
            <NuxtLink v-for="item in latestNews" :key="item.slug" :to="`/news/${item.slug}`">
              <time :datetime="item.date">{{ formatNewsDate(item.date) }}</time><div><p>{{ t(item.category, item.categoryEn) }}</p><h4>{{ t(item.title, item.titleEn) }}</h4><span>{{ t(item.summary, item.summaryEn) }}</span></div><Icon name="lucide:arrow-right" />
            </NuxtLink>
            <p v-if="!latestNews.length" class="home-news__empty">{{ language === 'en' ? 'No published updates yet.' : '暂无已发布动态。' }}</p>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>
