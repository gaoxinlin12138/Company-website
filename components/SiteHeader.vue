<script setup lang="ts">
import { navigation, productCategorySections } from '~/data/site'
import { NEWS_CATEGORIES, sampleNewsArticles } from '~/data/news'
import { caseStudies } from '~/data/case-studies'

const route = useRoute()
const menuOpen = ref(false)
const searchOpen = ref(false)
const activeDropdown = ref<string | null>(null)
const languageOpen = ref(false)
const scrolled = ref(false)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const searchRoot = ref<HTMLElement | null>(null)
const { language, t, setLanguage } = useSiteLanguage()

type SearchProduct = {
  id?: string
  name?: string
  nameEn?: string
  model?: string
  material?: string
  materialEn?: string
  category?: string
  categoryEn?: string
  group?: string
}

type SearchArticle = {
  id?: string
  slug: string
  title: string
  titleEn?: string
  summary?: string
  summaryEn?: string
  content?: string
  contentEn?: string
  category?: string
  categoryEn?: string
}

type SearchCase = {
  id?: string
  slug?: string
  title: string
  titleEn?: string
  summary?: string
  summaryEn?: string
  type?: string
  typeEn?: string
  location?: string
  locationEn?: string
  products?: string
  productsEn?: string
  category?: string
  categoryEn?: string
}

type SearchItem = {
  key: string
  label: string
  meta: string
  to: string
  keywords: string
  displayLabel?: string
  displayMeta?: string
}

const { data: managedSearchProducts } = await useFetch<SearchProduct[]>('/api/content/products', {
  default: () => []
})
const { data: managedSearchNews } = await useFetch<SearchArticle[]>('/api/content/articles', {
  default: () => sampleNewsArticles
})
const { data: managedSearchCases } = await useFetch<SearchCase[]>('/api/content/cases', {
  default: () => caseStudies.map(item => ({
    title: item.title,
    titleEn: item.titleEn,
    summary: item.summary,
    summaryEn: item.summaryEn,
    type: item.type,
    typeEn: item.typeEn,
    location: item.location,
    locationEn: item.locationEn,
    products: item.products,
    productsEn: item.productsEn,
    category: item.category,
    categoryEn: item.categoryEn
  }))
})

const languageOptions = [
  { code: 'zh' as const, label: '中文', nativeLabel: '中文' },
  { code: 'en' as const, label: 'English', nativeLabel: 'EN' }
]

const productCategories = computed(() => productCategorySections.flatMap(section => section.categories.map(category => ({
  category,
  group: section.group,
  count: (managedSearchProducts.value || []).filter(item => item.category === category).length
}))))

const navigationMenus = computed(() => ({
  '/products': {
    heading: '',
    meta: '',
    items: productCategories.value.map(item => ({
      label: item.category,
      to: { path: '/products', query: { group: item.group, category: item.category } }
    }))
  },
  '/about': {
    heading: '',
    meta: '',
    items: [
      { label: '公司简介', to: '/about#company-profile' },
      { label: '品牌文化', to: '/about#brand-culture' },
      { label: '荣誉资质', to: '/about#qualifications' },
      { label: '企业 VI', to: '/about#brand-vi' }
    ]
  },
  '/news': {
    heading: '',
    meta: '',
    items: NEWS_CATEGORIES.map(category => ({
      label: category,
      to: { path: '/news', query: { category } }
    }))
  },
  '/cases': {
    heading: '',
    meta: '',
    items: ['全部案例', '客户案例', '项目案例', '落地效果'].map(category => ({
      label: category,
      to: { path: '/cases', query: { category } }
    }))
  },
  '/contact': {
    heading: '',
    meta: '',
    items: [
      { label: '联系方式', to: '/contact#contact-info' },
      { label: '地理位置', to: '/contact#location' },
      { label: '提交采购需求', to: '/contact#inquiry' }
    ]
  }
}))

const navigationItems = computed(() => navigation.slice(1).map(item => ({
  ...item,
  menu: navigationMenus.value[item.to as keyof typeof navigationMenus.value]
})))

const searchItems = computed<SearchItem[]>(() => {
  const staticItems: SearchItem[] = [
  { label: '首页', meta: '网站首页', to: '/', keywords: '首页 home' },
  { label: '产品中心', meta: '全部产品', to: '/products', keywords: '产品 中心 product' },
  { label: '公司简介', meta: '关于我们', to: '/about#company-profile', keywords: '公司 简介 介绍 关于 我们' },
  { label: '品牌文化', meta: '关于我们', to: '/about#brand-culture', keywords: '品牌 文化 理念' },
  { label: '荣誉资质', meta: '关于我们', to: '/about#qualifications', keywords: '荣誉 资质 认证 文件' },
  { label: '企业 VI', meta: '关于我们', to: '/about#brand-vi', keywords: '企业 vi 视觉 标志 品牌色' },
  { label: '新闻动态', meta: '公司与行业资讯', to: '/news', keywords: '新闻 行业 资讯 采购知识' },
  { label: '案例展示', meta: '客户、项目与落地效果', to: '/cases', keywords: '案例 客户 项目 效果' },
  { label: '联系我们', meta: '采购与合作咨询', to: '/contact', keywords: '联系 询价 报价 合作 电话 邮箱' }
  ].map((item, index) => ({ ...item, key: `page-${index}` }))

  const productSource: SearchProduct[] = managedSearchProducts.value || []
  const productItems = productSource.map((item, index) => {
    const category = item.category || '产品中心'
    const label = item.name || item.model || category
    const model = item.model || ''
    const material = item.material || ''
    return {
      key: `product-${item.id || index}`,
      label,
      meta: [model, category, material].filter(Boolean).join(' · '),
      to: `/products?category=${encodeURIComponent(category)}${model ? `&model=${encodeURIComponent(model)}` : ''}`,
      keywords: [label, item.nameEn, model, material, item.materialEn, category, item.categoryEn, item.group].filter(Boolean).join(' ')
    }
  })

  const newsItems = (managedSearchNews.value?.length ? managedSearchNews.value : sampleNewsArticles).map((item, index) => ({
    key: `news-${item.id || index}`,
    label: item.title,
    meta: item.category || '新闻动态',
    to: `/news/${item.slug}`,
    keywords: [item.title, item.titleEn, item.summary, item.summaryEn, item.content, item.contentEn, item.category, item.categoryEn].filter(Boolean).join(' ')
  }))

  const caseSource: SearchCase[] = managedSearchCases.value?.length
    ? managedSearchCases.value
    : caseStudies.map(item => ({
      title: item.title,
      titleEn: item.titleEn,
      summary: item.summary,
      summaryEn: item.summaryEn,
      type: item.type,
      typeEn: item.typeEn,
      location: item.location,
      locationEn: item.locationEn,
      products: item.products,
      productsEn: item.productsEn,
      category: item.category,
      categoryEn: item.categoryEn
    }))
  const caseItems = caseSource.map((item, index) => ({
    key: `case-${item.id || index}`,
    label: item.title,
    meta: item.category || '案例展示',
    to: `/cases?category=${encodeURIComponent(item.category || '全部案例')}`,
    keywords: [item.title, item.titleEn, item.summary, item.summaryEn, item.type, item.typeEn, item.location, item.locationEn, item.products, item.productsEn, item.category, item.categoryEn].filter(Boolean).join(' ')
  }))

  return [...staticItems, ...productItems, ...newsItems, ...caseItems].map(item => ({
    ...item,
    displayLabel: t(item.label),
    displayMeta: t(item.meta)
  }))
})

const searchResults = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return searchItems.value.slice(0, 6)
  return searchItems.value.filter(item => `${item.label} ${item.meta} ${item.displayLabel} ${item.displayMeta} ${item.keywords}`.toLowerCase().includes(query)).slice(0, 8)
})

function submitSearch() {
  if (!searchQuery.value.trim()) {
    searchOpen.value = true
    void nextTick(() => searchInput.value?.focus())
    return
  }
  const first = searchResults.value[0]
  if (first) navigateTo(first.to)
}

const closeOverlaysOnEscape = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  searchOpen.value = false
  activeDropdown.value = null
  languageOpen.value = false
}

const closeDropdownOnFocusOut = (event: FocusEvent) => {
  const item = event.currentTarget as HTMLElement
  const next = event.relatedTarget as Node | null
  if (!next || !item.contains(next)) activeDropdown.value = null
}

const closeSearchOnFocusOut = (event: FocusEvent) => {
  const search = event.currentTarget as HTMLElement
  const next = event.relatedTarget as Node | null
  if (!next || !search.contains(next)) searchOpen.value = false
}

const closeSearchOnOutsidePointer = (event: PointerEvent) => {
  if (searchRoot.value && !searchRoot.value.contains(event.target as Node)) searchOpen.value = false
}

function handleDropdownHover(value: string | null) {
  if (!import.meta.client || window.matchMedia('(min-width: 1121px)').matches) activeDropdown.value = value
}

function handleDropdownFocus(event: FocusEvent, value: string) {
  if ((event.target as HTMLElement).classList.contains('site-nav__mobile-toggle')) return
  activeDropdown.value = value
}

const updateScrollState = () => {
  scrolled.value = window.scrollY > 24
}

onMounted(() => {
  updateScrollState()
  window.addEventListener('scroll', updateScrollState, { passive: true })
  window.addEventListener('keydown', closeOverlaysOnEscape)
  window.addEventListener('pointerdown', closeSearchOnOutsidePointer)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollState)
  window.removeEventListener('keydown', closeOverlaysOnEscape)
  window.removeEventListener('pointerdown', closeSearchOnOutsidePointer)
})
watch(() => route.fullPath, () => {
  menuOpen.value = false
  searchOpen.value = false
  activeDropdown.value = null
  languageOpen.value = false
})
</script>

<template>
  <header
    class="site-nav"
    @click="languageOpen = false"
    :class="{
      'is-home': route.path === '/',
      'is-scrolled': scrolled,
      'is-open': menuOpen,
      'is-searching': searchOpen,
      'is-dropdown-open': activeDropdown,
      'is-language-open': languageOpen
    }"
  >
    <div class="site-nav__inner">
      <NuxtLink class="site-nav__brand" to="/" :aria-label="language === 'en' ? 'Hongcai Wanfu home' : '红财万富首页'">
        <img src="/assets/images/logo-transparent.png" width="702" height="180" :alt="language === 'en' ? 'Hongcai Wanfu' : '红财万富 HONGCAI WANFU'">
        <span>{{ t('专注卫浴五金产品供应') }}<br><small>{{ t('品质连接更多可能') }}</small></span>
      </NuxtLink>
      <nav class="site-nav__links" :aria-label="t('主导航')">
        <NuxtLink v-if="navigation[0]" class="site-nav__link" to="/" :class="{ 'is-active': route.path === '/' }">{{ t(navigation[0].label) }}</NuxtLink>
        <div
          v-for="item in navigationItems"
          :key="item.to"
          class="site-nav__item"
          :class="{ 'site-nav__item--has-dropdown': item.menu.items.length }"
          @mouseenter="item.menu.items.length && handleDropdownHover(item.to)"
          @mouseleave="handleDropdownHover(null)"
          @focusin="item.menu.items.length && handleDropdownFocus($event, item.to)"
          @focusout="closeDropdownOnFocusOut"
        >
          <NuxtLink
            class="site-nav__link"
            :to="item.to"
            :class="{ 'is-active': route.path === item.to }"
            :aria-controls="item.menu.items.length ? `${item.to.slice(1)}-navigation-dropdown` : undefined"
            :aria-expanded="item.menu.items.length ? activeDropdown === item.to : undefined"
          >
            {{ t(item.label) }}
            <Icon v-if="item.menu.items.length" class="site-nav__caret" name="lucide:chevron-down" />
          </NuxtLink>
          <button
            v-if="item.menu.items.length"
            class="site-nav__mobile-toggle"
            type="button"
            :aria-label="language === 'en' ? `Show ${t(item.label)} sections` : `展开${t(item.label)}子栏目`"
            :aria-expanded="activeDropdown === item.to"
            :aria-controls="`${item.to.slice(1)}-navigation-dropdown`"
            @click.stop="activeDropdown = activeDropdown === item.to ? null : item.to"
          >
            <Icon name="lucide:chevron-down" />
          </button>
          <div
            v-if="item.menu.items.length"
            :id="`${item.to.slice(1)}-navigation-dropdown`"
            class="product-dropdown"
            :class="{ 'is-open': activeDropdown === item.to, 'product-dropdown--compact': !item.menu.heading }"
            :aria-hidden="activeDropdown !== item.to"
          >
            <div v-if="item.menu.heading" class="product-dropdown__heading">
              <strong>{{ t(item.menu.heading) }}</strong>
              <small>{{ item.menu.meta }}</small>
            </div>
            <NuxtLink
              v-for="menuItem in item.menu.items"
              :key="menuItem.label"
              class="product-dropdown__link"
              :to="menuItem.to"
              @click="activeDropdown = null"
            >
              <span>{{ t(menuItem.label) }}</span>
              <Icon name="lucide:arrow-up-right" />
            </NuxtLink>
          </div>
        </div>
      </nav>
      <div class="site-nav__actions">
        <div ref="searchRoot" class="site-search" role="search">
          <form class="site-search__inner" @submit.prevent="submitSearch" @focusin="searchOpen = true" @focusout="closeSearchOnFocusOut">
            <div class="site-search__field">
              <input ref="searchInput" v-model="searchQuery" name="q" type="search" autocomplete="off" enterkeyhint="search" :placeholder="t('搜索产品型号、关键词…')" :aria-label="t('搜索产品型号、关键词…')">
              <button type="submit" :aria-label="t('搜索')"><Icon name="lucide:search" /></button>
            </div>
            <div v-show="searchOpen && searchQuery" class="site-search__results" aria-live="polite">
              <NuxtLink v-for="item in searchResults" :key="item.key" :to="item.to" @click="searchOpen = false">
                <span>{{ item.displayLabel }}</span><small>{{ item.displayMeta }}</small>
              </NuxtLink>
              <p v-if="!searchResults.length">{{ t('没有找到相关内容，请换一个关键词。') }}</p>
            </div>
          </form>
        </div>
        <div class="language-menu" :class="{ 'is-open': languageOpen }">
          <button type="button" class="lang-button" :aria-expanded="languageOpen" aria-haspopup="menu" :aria-label="language === 'en' ? t('切换到中文') : t('切换到英文')" @click.stop="languageOpen = !languageOpen"><Icon class="lang-button__globe" name="lucide:globe-2" /><span>{{ language === 'en' ? 'EN' : '中文' }}</span><Icon class="lang-button__chevron" name="lucide:chevron-down" /></button>
          <div v-show="languageOpen" class="language-menu__dropdown" role="menu">
            <button v-for="option in languageOptions" :key="option.code" type="button" role="menuitem" :data-language="option.code" :class="{ 'is-active': language === option.code }" @click="setLanguage(option.code); languageOpen = false"><span>{{ option.label }}</span><small>{{ option.nativeLabel }}</small></button>
          </div>
        </div>
        <button type="button" class="menu-button" :aria-expanded="menuOpen" :aria-label="menuOpen ? t('关闭导航') : t('打开导航')" @click="menuOpen = !menuOpen">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>
</template>
