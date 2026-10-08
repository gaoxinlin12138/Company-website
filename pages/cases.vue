<script setup lang="ts">
import { caseStudies, getCaseImageDimensions } from '~/data/case-studies'
import type { CaseItem } from '~/data/case-studies'

const { language, t } = useSiteLanguage()
useSeoMeta({
  title: () => language.value === 'en' ? 'Cases | Hongcai Wanfu' : '案例展示｜红财万富',
  description: () => language.value === 'en' ? 'Explore Hongcai Wanfu bathroom sourcing directions for hospitality, public, residential and workplace projects.' : '了解红财万富面向酒店、公共空间、住宅精装与商务办公项目的卫浴采购方案。'
})

const categories = ['全部案例', '客户案例', '项目案例', '落地效果']
type LocalizedValue = { zh: string; en: string }
type Scenario = {
  category: LocalizedValue
  title: LocalizedValue
  summary: LocalizedValue
  image: string
  imageAlt: LocalizedValue
  details: Array<{ label: LocalizedValue; value: LocalizedValue }>
}
const scenarios: Scenario[] = [
  {
    category: { zh: '酒店卫浴配套', en: 'Hospitality bathrooms' },
    title: { zh: '让不同房型拥有一致体验，也让后期维护更简单', en: 'A consistent guest experience across room types, with easier long-term maintenance' },
    summary: {
      zh: '酒店项目需要同时平衡空间气质、使用舒适度、批量采购效率与长期维护。我们从标准客房、套房和公共区域的差异出发，梳理统一的表面处理与产品语言，再根据房型调整功能组合，让整体效果保持一致。',
      en: 'Hospitality projects must balance atmosphere, comfort, procurement efficiency and long-term maintenance. We align finishes and product language across standard rooms, suites and shared areas, then adapt the functional mix to each room type.'
    },
    image: '/uploads/cases/concept-hospitality.webp',
    imageAlt: { zh: '酒店卫浴空间应用方案示意', en: 'Illustrative hospitality bathroom sourcing direction' },
    details: [
      { label: { zh: '核心需求', en: 'Project need' }, value: { zh: '多房型统一、舒适体验、易清洁维护', en: 'Consistency across room types, guest comfort and easy maintenance' } },
      { label: { zh: '配置思路', en: 'Solution approach' }, value: { zh: '用同系列龙头与淋浴五金建立统一视觉，按房型增减功能', en: 'Create a shared visual language with coordinated faucets and shower hardware, then scale features by room type' } },
      { label: { zh: '重点产品', en: 'Product focus' }, value: { zh: '面盆龙头、花洒套装、地漏、卫浴挂件', en: 'Basin faucets, shower sets, drains and bathroom accessories' } },
      { label: { zh: '交付关注', en: 'Delivery focus' }, value: { zh: '样品确认、批次色差、备件清单与补货衔接', en: 'Sample approval, finish consistency, spare-parts lists and replenishment continuity' } }
    ]
  },
  {
    category: { zh: '商业与公共空间', en: 'Commercial & public spaces' },
    title: { zh: '面对高频使用，把耐用、易维护与空间秩序放在一起', en: 'Designed around durability, maintainability and a clear public-space experience' },
    summary: {
      zh: '商业综合体、展厅和公共卫生间的使用频次更高，产品选型不能只看外观。方案会优先核对使用强度、清洁方式、安装条件与后续检修路径，再统一龙头、阀门和配件的规格关系，减少现场临时调整。',
      en: 'Retail, showroom and public washroom environments demand more than visual appeal. Selection starts with usage intensity, cleaning routines, installation conditions and service access, followed by coordinated faucet, valve and accessory specifications.'
    },
    image: '/uploads/cases/concept-commercial.webp',
    imageAlt: { zh: '商业公共空间龙头应用方案示意', en: 'Illustrative faucet direction for commercial public spaces' },
    details: [
      { label: { zh: '核心需求', en: 'Project need' }, value: { zh: '高频使用、快速清洁、稳定补货', en: 'High-frequency use, efficient cleaning and reliable replenishment' } },
      { label: { zh: '配置思路', en: 'Solution approach' }, value: { zh: '围绕耐用结构、简洁表面和可替换部件组织产品组合', en: 'Build the package around durable structures, cleanable finishes and replaceable components' } },
      { label: { zh: '重点产品', en: 'Product focus' }, value: { zh: '面盆龙头、感应类选型、角阀、排水与安装配件', en: 'Basin faucets, sensor-ready options, angle valves, drainage and installation parts' } },
      { label: { zh: '交付关注', en: 'Delivery focus' }, value: { zh: '安装接口复核、分区打包、易损件预留', en: 'Connection checks, zone-based packing and allowance for service parts' } }
    ]
  },
  {
    category: { zh: '住宅精装配套', en: 'Residential fit-out' },
    title: { zh: '从户型与使用习惯出发，建立可复制的卫浴配置', en: 'A repeatable bathroom specification built around layouts and everyday routines' },
    summary: {
      zh: '住宅精装更关注成套感、空间适配与日常使用的细节。我们按主卫、客卫、厨房等不同区域拆分需求，通过统一材质和表面处理控制整体观感，同时为台面开孔、墙内预埋和收口尺寸保留充分核对时间。',
      en: 'Residential fit-out places greater emphasis on coordinated aesthetics, spatial fit and everyday details. Requirements are separated by master bath, guest bath and kitchen, while finishes stay consistent and installation dimensions are checked early.'
    },
    image: '/uploads/cases/concept-residential.webp',
    imageAlt: { zh: '住宅精装面盆龙头应用方案示意', en: 'Illustrative basin-faucet direction for residential fit-out' },
    details: [
      { label: { zh: '核心需求', en: 'Project need' }, value: { zh: '风格统一、户型适配、使用顺手', en: 'A consistent look, layout compatibility and intuitive daily use' } },
      { label: { zh: '配置思路', en: 'Solution approach' }, value: { zh: '按空间分级配置，用统一材质与表面处理串联整套产品', en: 'Tier products by room while linking the full package through shared materials and finishes' } },
      { label: { zh: '重点产品', en: 'Product focus' }, value: { zh: '面盆龙头、淋浴花洒、厨房龙头、卫浴挂件', en: 'Basin faucets, shower systems, kitchen faucets and bathroom accessories' } },
      { label: { zh: '交付关注', en: 'Delivery focus' }, value: { zh: '开孔尺寸、预埋条件、安装顺序与成品保护', en: 'Cut-out dimensions, concealed installation conditions, installation sequence and finish protection' } }
    ]
  },
  {
    category: { zh: '商务办公空间', en: 'Workplace amenities' },
    title: { zh: '用克制、可靠的配置，支撑长期稳定的日常使用', en: 'A restrained, dependable specification for stable everyday operation' },
    summary: {
      zh: '办公空间的卫浴配置需要融入整体室内语言，也要控制维护复杂度。选型以简洁耐看的外观、清晰的功能和常用规格为主，重点处理公共区域与管理层空间之间的配置差异，避免不必要的型号分散。',
      en: 'Workplace bathrooms should support the interior language without adding maintenance complexity. Selection favours restrained forms, clear functionality and common specifications, with controlled upgrades for executive or client-facing areas.'
    },
    image: '/uploads/cases/concept-workplace.webp',
    imageAlt: { zh: '商务办公卫浴五金材质方案示意', en: 'Illustrative bathroom hardware and material direction for workplaces' },
    details: [
      { label: { zh: '核心需求', en: 'Project need' }, value: { zh: '简洁耐看、维护可控、不同区域协调', en: 'Timeless appearance, manageable maintenance and coordination across zones' } },
      { label: { zh: '配置思路', en: 'Solution approach' }, value: { zh: '以通用规格为基础，为重点区域配置更完整的产品组合', en: 'Use common specifications as the base and add a fuller package only where the space requires it' } },
      { label: { zh: '重点产品', en: 'Product focus' }, value: { zh: '水龙头、角阀、地漏、挂件与安装配件', en: 'Faucets, angle valves, drains, accessories and installation parts' } },
      { label: { zh: '交付关注', en: 'Delivery focus' }, value: { zh: '型号归并、区域标识、安装核对与后续替换', en: 'SKU consolidation, zone labelling, installation checks and future replacement' } }
    ]
  }
]

const allCases = caseStudies
const imageDimensions = getCaseImageDimensions
const route = useRoute()
const categoryFromQuery = (value: unknown) => {
  const category = Array.isArray(value) ? value[0] : value
  return typeof category === 'string' && categories.includes(category) ? category : '全部案例'
}
const active = ref(categoryFromQuery(route.query.category))
const filtered = computed(() => active.value === '全部案例' ? allCases : allCases.filter(item => item.category === active.value))
const featured = computed(() => filtered.value[0])
const rest = computed(() => filtered.value.slice(1))
const archiveLayout = computed(() => ({
  全部案例: 'all',
  客户案例: 'customer',
  项目案例: 'project',
  落地效果: 'result'
}[active.value] || 'all'))
const localize = (item: CaseItem, key: 'category' | 'title' | 'summary' | 'type' | 'location' | 'products') => {
  const value = item[key] || ''
  if (language.value !== 'en') return value
  const translated = item[`${key}En` as keyof CaseItem]
  return typeof translated === 'string' && translated ? translated : t(value)
}
const copy = (value: LocalizedValue) => language.value === 'en' ? value.en : value.zh

const scenarioSection = ref<HTMLElement | null>(null)
const scenarioViewport = ref<HTMLElement | null>(null)
const scenarioProgress = ref(0)
const scenarioActiveIndex = ref(0)
const scenarioPreviousIndex = ref<number | null>(null)
const scenarioIsPinned = ref(false)
let scenarioMedia: MediaQueryList | null = null
let scenarioModeChange: (() => void) | null = null
let scenarioFrame = 0
let scenarioSnapFrame = 0
let scenarioWheelLocked = false
let scenarioWheelUnlockTimer = 0

const scenarioPanelStyle = (index: number) => {
  const isActive = index === scenarioActiveIndex.value
  const isPrevious = index === scenarioPreviousIndex.value
  const relativePosition = Math.sign(index - scenarioActiveIndex.value)
  const previousDirection = scenarioPreviousIndex.value === null
    ? relativePosition
    : Math.sign(scenarioPreviousIndex.value - scenarioActiveIndex.value)
  const lift = isActive ? 0 : (isPrevious ? previousDirection : relativePosition) * 56
  const pointerEvents: 'auto' | 'none' = isActive ? 'auto' : 'none'
  return {
    '--scenario-panel-opacity': isActive ? '1' : '0',
    '--scenario-panel-lift': `${lift}px`,
    '--scenario-panel-depth': isActive ? '10' : (isPrevious ? '5' : '0'),
    '--scenario-panel-transition': isActive
      ? 'opacity 430ms cubic-bezier(.16,1,.3,1) 70ms, transform 560ms cubic-bezier(.16,1,.3,1)'
      : (isPrevious ? 'opacity 180ms ease-out, transform 300ms ease-out' : 'none'),
    pointerEvents
  }
}

const activateScenario = (index: number) => {
  const nextIndex = Math.min(Math.max(index, 0), scenarios.length - 1)
  if (nextIndex === scenarioActiveIndex.value) return
  scenarioPreviousIndex.value = scenarioActiveIndex.value
  scenarioActiveIndex.value = nextIndex
}

const updateScenarioProgress = () => {
  if (!scenarioSection.value || !scenarioIsPinned.value) return
  const rect = scenarioSection.value.getBoundingClientRect()
  const travel = Math.max(scenarioSection.value.offsetHeight - window.innerHeight, 1)
  const measuredProgress = Math.min(Math.max(-rect.top / travel, 0), 1)
  const measuredPosition = measuredProgress * (scenarios.length - 1)
  const nearestPosition = Math.round(measuredPosition)
  const rawProgress = Math.abs(measuredPosition - nearestPosition) < .03
    ? nearestPosition / (scenarios.length - 1)
    : measuredProgress
  scenarioProgress.value = rawProgress
  if (!scenarioWheelLocked) activateScenario(nearestPosition)
}

const requestScenarioUpdate = () => {
  if (scenarioFrame) return
  scenarioFrame = window.requestAnimationFrame(() => {
    scenarioFrame = 0
    updateScenarioProgress()
  })
}

const syncScenarioRail = () => {
  if (!scenarioViewport.value || scenarioIsPinned.value) return
  const available = scenarioViewport.value.scrollWidth - scenarioViewport.value.clientWidth
  const railProgress = available > 0 ? scenarioViewport.value.scrollLeft / available : 0
  scenarioProgress.value = railProgress
  activateScenario(Math.round(railProgress * (scenarios.length - 1)))
}

const snapToScenario = (index: number) => {
  if (!scenarioSection.value) return
  const travel = Math.max(scenarioSection.value.offsetHeight - window.innerHeight, 1)
  const targetY = scenarioSection.value.offsetTop + (index / (scenarios.length - 1)) * travel
  const startY = window.scrollY
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const duration = reduceMotion ? 220 : 560
  scenarioWheelLocked = true
  activateScenario(index)

  if (!duration) {
    window.scrollTo({ top: targetY, behavior: 'auto' })
    scenarioProgress.value = index / (scenarios.length - 1)
    scenarioWheelUnlockTimer = window.setTimeout(() => { scenarioWheelLocked = false }, 280)
    return
  }

  const startedAt = performance.now()
  const animate = (now: number) => {
    const elapsed = Math.min((now - startedAt) / duration, 1)
    const eased = 1 - Math.pow(1 - elapsed, 4)
    window.scrollTo({ top: startY + (targetY - startY) * eased, behavior: 'auto' })
    if (elapsed < 1) {
      scenarioSnapFrame = window.requestAnimationFrame(animate)
      return
    }
    window.scrollTo({ top: targetY, behavior: 'auto' })
    updateScenarioProgress()
    scenarioSnapFrame = 0
    scenarioWheelUnlockTimer = window.setTimeout(() => { scenarioWheelLocked = false }, 140)
  }
  scenarioSnapFrame = window.requestAnimationFrame(animate)
}

const handleScenarioWheel = (event: WheelEvent) => {
  if (!scenarioSection.value || !scenarioIsPinned.value || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
  const rect = scenarioSection.value.getBoundingClientRect()
  const isPinnedInView = rect.top <= 1 && rect.bottom >= window.innerHeight - 1
  if (!isPinnedInView) return

  if (scenarioWheelLocked) {
    event.preventDefault()
    return
  }

  const position = scenarioProgress.value * (scenarios.length - 1)
  const nextIndex = event.deltaY > 0
    ? Math.floor(position + .001) + 1
    : Math.ceil(position - .001) - 1

  if (nextIndex < 0 || nextIndex >= scenarios.length) return
  event.preventDefault()
  snapToScenario(nextIndex)
}

onMounted(() => {
  scenarioMedia = window.matchMedia('(min-width: 1024px)')
  scenarioModeChange = () => {
    scenarioIsPinned.value = Boolean(scenarioMedia?.matches)
    if (!scenarioIsPinned.value) {
      scenarioProgress.value = 0
      scenarioPreviousIndex.value = null
      scenarioActiveIndex.value = 0
    }
    nextTick(requestScenarioUpdate)
  }
  scenarioMedia.addEventListener('change', scenarioModeChange)
  scenarioModeChange()
  window.addEventListener('scroll', requestScenarioUpdate, { passive: true })
  window.addEventListener('resize', requestScenarioUpdate, { passive: true })
  window.addEventListener('wheel', handleScenarioWheel, { passive: false })
})

onBeforeUnmount(() => {
  if (scenarioModeChange) scenarioMedia?.removeEventListener('change', scenarioModeChange)
  window.removeEventListener('scroll', requestScenarioUpdate)
  window.removeEventListener('resize', requestScenarioUpdate)
  window.removeEventListener('wheel', handleScenarioWheel)
  if (scenarioFrame) window.cancelAnimationFrame(scenarioFrame)
  if (scenarioSnapFrame) window.cancelAnimationFrame(scenarioSnapFrame)
  if (scenarioWheelUnlockTimer) window.clearTimeout(scenarioWheelUnlockTimer)
})

watch(() => route.query.category, value => {
  active.value = categoryFromQuery(value)
})
</script>

<template>
  <div class="page page-cases">
    <PageHero class="page-hero--inner" title="案例展示" subtitle="从产品选择，到最终落地" image="/assets/images/hero-cases-architecture.webp" split-text />
    <section class="cases-overview page-wrap section-space">
      <div class="cases-overview__statement">
        <h2>{{ language === 'en' ? 'A strong bathroom project begins before a product is ordered.' : '一个好的卫浴项目，在产品下单之前就已经开始。' }}</h2>
        <p>{{ language === 'en' ? 'It starts by understanding the space, the people who will use it, installation conditions and long-term maintenance. We turn those requirements into a clear product package that is easier to compare, confirm and deliver.' : '它始于对空间、使用人群、安装条件和长期维护的理解。我们把这些要求整理为清晰的产品组合，让选型更容易比较、确认与落地。' }}</p>
      </div>
      <div class="cases-overview__principles" :aria-label="language === 'en' ? 'Our case-study principles' : '案例展示原则'">
        <p><strong>{{ language === 'en' ? 'Start with the use case' : '先看使用场景' }}</strong><span>{{ language === 'en' ? 'Room type, usage frequency and maintenance determine the selection.' : '空间类型、使用频次和维护方式共同决定选型。' }}</span></p>
        <p><strong>{{ language === 'en' ? 'Coordinate the full package' : '再看整套配置' }}</strong><span>{{ language === 'en' ? 'Products, finishes, connections and accessories need to work together.' : '产品、表面处理、安装接口与配件需要彼此匹配。' }}</span></p>
        <p><strong>{{ language === 'en' ? 'Make delivery verifiable' : '最后核对交付' }}</strong><span>{{ language === 'en' ? 'Samples, lists and installation details turn a concept into an executable plan.' : '通过样品、清单和安装细节，把方案变成可执行的计划。' }}</span></p>
      </div>
    </section>

    <section ref="scenarioSection" class="scenario-section" :style="{ '--scenario-height': `${scenarios.length * 100}svh` }" aria-labelledby="scenario-heading">
      <div class="scenario-pin">
        <header class="scenario-section__head page-wrap">
          <h2 id="scenario-heading">{{ language === 'en' ? 'Four spaces, four sourcing priorities' : '四类空间，四种采购重点' }}</h2>
          <p>{{ language === 'en' ? 'The following directions are application references rather than completed-project claims. Each one shows how we organise requirements into an actionable bathroom package.' : '以下内容为应用方案参考，不作为已交付项目声明；每个场景都展示我们如何把需求整理为可执行的卫浴配置。' }}</p>
        </header>
        <div ref="scenarioViewport" class="scenario-viewport" @scroll.passive="syncScenarioRail">
          <div class="scenario-list">
            <article v-for="(scenario, index) in scenarios" :key="scenario.category.zh" class="scenario-story" :class="{ 'scenario-story--reverse': index % 2 }" :style="scenarioPanelStyle(index)">
              <div class="scenario-story__inner page-wrap">
                <figure class="scenario-story__visual">
                  <img :src="scenario.image" :alt="copy(scenario.imageAlt)" width="960" height="720" loading="lazy">
                </figure>
                <div class="scenario-story__content">
                  <div class="scenario-story__category"><Icon name="lucide:scan-line" />{{ copy(scenario.category) }}</div>
                  <h3>{{ copy(scenario.title) }}</h3>
                  <p class="scenario-story__summary">{{ copy(scenario.summary) }}</p>
                  <dl class="scenario-story__details">
                    <div v-for="detail in scenario.details" :key="detail.label.zh">
                      <dt>{{ copy(detail.label) }}</dt>
                      <dd>{{ copy(detail.value) }}</dd>
                    </div>
                  </dl>
                  <NuxtLink to="/contact#inquiry">{{ language === 'en' ? 'Discuss this sourcing direction' : '沟通这一类采购需求' }} <Icon name="lucide:arrow-up-right" /></NuxtLink>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section id="case-list" class="cases-section cases-archive page-wrap section-space" :class="`cases-archive--${archiveLayout}`">
      <header class="cases-archive__head">
        <div><h2>{{ language === 'en' ? 'Selected application cases' : '精选应用案例' }}</h2><p>{{ language === 'en' ? 'These fixed concept cases are based on common sourcing requirements and are shown independently of the management console.' : '以下固定案例根据常见采购需求整理，直接在前台展示，不再通过管理台维护。' }}</p></div>
        <span>{{ language === 'en' ? `${allCases.length} cases` : `共 ${allCases.length} 项案例` }}</span>
      </header>
      <nav class="case-tabs" :aria-label="t('案例分类')">
        <button v-for="category in categories" :key="category" :class="{ 'is-active': active === category }" @click="active = category">{{ t(category) }}</button>
      </nav>
      <article v-if="featured" class="featured-case">
        <div class="case-image"><img :src="featured.image" :alt="localize(featured, 'title')" :width="imageDimensions(featured.image).width" :height="imageDimensions(featured.image).height"></div>
        <div><p>{{ localize(featured, 'category') }}</p><h2>{{ localize(featured, 'title') }}</h2><div v-if="featured.summary" class="featured-case__summary">{{ localize(featured, 'summary') }}</div><dl><div><dt>{{ t('项目类型') }}</dt><dd>{{ localize(featured, 'type') }}</dd></div><div><dt>{{ language === 'en' ? 'Application' : '应用空间' }}</dt><dd>{{ localize(featured, 'location') }}</dd></div><div><dt>{{ t('供应产品') }}</dt><dd>{{ localize(featured, 'products') }}</dd></div></dl><NuxtLink to="/contact#inquiry">{{ language === 'en' ? 'Discuss a similar requirement' : '沟通类似采购需求' }} <Icon name="lucide:arrow-right" /></NuxtLink></div>
      </article>
      <div class="case-grid">
        <article v-for="(item, index) in rest" :key="item.title" :class="`case-card--${index + 1}`">
          <div class="case-image"><img :src="item.image" :alt="localize(item, 'title')" :width="imageDimensions(item.image).width" :height="imageDimensions(item.image).height" loading="lazy"></div>
          <div class="case-card__content">
            <h3>{{ localize(item, 'title') }}</h3>
            <p v-if="item.summary" class="case-grid__summary">{{ localize(item, 'summary') }}</p>
            <div class="case-card__meta">
              <p>{{ t('项目类型') }}　|　{{ localize(item, 'type') }}</p>
              <p v-if="item.location">{{ language === 'en' ? 'Application' : '应用空间' }}　|　{{ localize(item, 'location') }}</p>
              <p>{{ t('供应产品') }}　|　{{ localize(item, 'products') }}</p>
            </div>
          </div>
        </article>
      </div>
      <div v-if="!filtered.length" class="case-empty">
        <Icon name="lucide:folder-search" />
        <div><h3>{{ language === 'en' ? 'No case in this category yet.' : '当前分类暂无案例内容' }}</h3><p>{{ language === 'en' ? 'Choose another category or contact us with the space and products you need to match.' : '可以切换其他分类，或告诉我们需要匹配的空间与产品。' }}</p></div>
        <NuxtLink to="/contact#inquiry">{{ language === 'en' ? 'Send requirements' : '提交采购需求' }} <Icon name="lucide:arrow-right" /></NuxtLink>
      </div>
    </section>
    <section class="case-cta">
      <div class="page-wrap"><div><h2>{{ language === 'en' ? 'Bring us the space, quantity and schedule. We will start with the right questions.' : '告诉我们空间、数量与时间计划，从正确的问题开始推进。' }}</h2><p>{{ language === 'en' ? 'Product selection, finish coordination, installation checks and delivery lists can all be discussed in one sourcing conversation.' : '产品选型、表面处理、安装核对与交付清单，可以在一次采购沟通中逐步确认。' }}</p></div><NuxtLink to="/contact#inquiry">{{ language === 'en' ? 'Start a project conversation' : '开始项目沟通' }} <Icon name="lucide:arrow-right" /></NuxtLink></div>
    </section>
  </div>
</template>

<style scoped>
.cases-overview { width:min(1180px,calc(100% - 2.5rem)); max-width:none; display:grid; grid-template-columns:minmax(0,1.3fr) minmax(360px,.7fr); gap:clamp(2.5rem,5vw,5rem); align-items:center; padding-block:clamp(2.75rem,4.5vw,4.5rem); }
.cases-overview__statement h2 { max-width:11.5em; margin:0; font-size:clamp(2.2rem,3.5vw,3.5rem); line-height:1.08; letter-spacing:-.035em; text-wrap:balance; }
.cases-overview__statement > p { max-width:58ch; margin:1.15rem 0 0; color:var(--muted); font-size:clamp(.86rem,1vw,.96rem); line-height:1.8; }
.cases-overview__principles { border-top:1px solid var(--ink); }
.cases-overview__principles p { display:grid; grid-template-columns:7.5rem 1fr; gap:1rem; margin:0; padding:1rem 0; border-bottom:1px solid var(--line); }
.cases-overview__principles strong { color:var(--ink); font-size:.76rem; }
.cases-overview__principles span { color:var(--muted); font-size:.72rem; line-height:1.75; }

.scenario-section { --scenario-height:400svh; position:relative; height:var(--scenario-height); background:#17343a; color:#fff; }
.scenario-pin { position:sticky; top:0; height:100svh; display:grid; grid-template-rows:auto minmax(0,1fr); overflow:hidden; padding:clamp(5.5rem,8vh,7rem) 0 clamp(1.5rem,3vh,2.5rem); }
.scenario-section__head { display:flex; align-items:end; justify-content:space-between; gap:3rem; margin-bottom:clamp(1rem,2vh,1.75rem); }
.scenario-section__head h2 { max-width:13ch; margin:0; scroll-margin-top:6rem; font-size:clamp(2rem,3.5vw,3.35rem); line-height:1.04; letter-spacing:-.035em; text-wrap:balance; }
.scenario-section__head p { max-width:58ch; margin:0; color:rgba(255,255,255,.78); font-size:.82rem; line-height:1.8; }
.scenario-viewport { min-height:0; overflow:hidden; }
.scenario-list { position:relative; width:100%; height:100%; contain:layout paint style; }
.scenario-story { position:absolute; z-index:var(--scenario-panel-depth,0); inset:0; width:100%; min-width:0; }
.scenario-story__inner { height:100%; display:grid; grid-template-columns:minmax(0,1.08fr) minmax(380px,.92fr); gap:clamp(2rem,5vw,5rem); align-items:center; opacity:var(--scenario-panel-opacity,1); transform:translateY(var(--scenario-panel-lift,0)); transition:var(--scenario-panel-transition,none); }
.scenario-story--reverse .scenario-story__visual { order:2; }
.scenario-story__visual { position:relative; height:min(50vh,540px); min-height:330px; margin:0; overflow:hidden; background:#162b33; }
.scenario-story__visual::after { content:""; position:absolute; inset:0; background:linear-gradient(180deg,transparent 58%,rgba(6,18,23,.68)); pointer-events:none; }
.scenario-story__visual img { width:100%; height:100%; display:block; object-fit:cover; filter:saturate(.72) contrast(1.03); }
.scenario-story__category { display:flex; align-items:center; gap:.5rem; margin-bottom:.8rem; color:#a5c8b8; font-size:.8rem; font-weight:800; letter-spacing:.01em; }
.scenario-story__category svg { width:16px; height:16px; }
.scenario-story__content h3 { max-width:18ch; margin:0; font-size:clamp(1.65rem,2.8vw,2.75rem); line-height:1.08; letter-spacing:-.03em; text-wrap:balance; }
.scenario-story__summary { max-width:66ch; margin:1rem 0 1.35rem; color:rgba(255,255,255,.86); font-size:.94rem; line-height:1.8; }
.scenario-story__details { margin:0; border-top:1px solid rgba(255,255,255,.2); }
.scenario-story__details > div { display:grid; grid-template-columns:7.25rem 1fr; gap:1rem; padding:.76rem 0; border-bottom:1px solid rgba(255,255,255,.18); }
.scenario-story__details dt { color:rgba(255,255,255,.72); font-size:.76rem; font-weight:700; }
.scenario-story__details dd { margin:0; color:rgba(255,255,255,.98); font-size:.82rem; line-height:1.65; }
.scenario-story__content > a { width:fit-content; display:inline-flex; align-items:center; gap:.55rem; margin-top:1.25rem; color:#fff; font-size:.8rem; font-weight:800; text-decoration:underline; text-decoration-color:#5e9a84; text-decoration-thickness:2px; text-underline-offset:6px; }
.scenario-story__content > a svg { width:14px; transition:transform .25s ease; }
.scenario-story__content > a:hover svg { transform:translate(2px,-2px); }
.scenario-story__content > a:focus-visible { outline:2px solid #a5c8b8; outline-offset:5px; }
@media (max-height: 820px) and (min-width: 1024px) {
  .scenario-pin { padding-top:5.25rem; padding-bottom:.75rem; }
  .scenario-section__head { margin-bottom:.75rem; }
  .scenario-section__head h2 { font-size:clamp(1.85rem,3vw,2.65rem); }
  .scenario-story__visual { height:min(45vh,440px); min-height:300px; }
  .scenario-story__content h3 { font-size:clamp(1.55rem,2.5vw,2.25rem); }
  .scenario-story__summary { margin:.75rem 0 1rem; line-height:1.65; }
  .scenario-story__details > div { padding:.5rem 0; }
  .scenario-story__content > a { margin-top:.85rem; }
}

@media (max-width: 1023px) {
  .scenario-section { height:auto; padding:clamp(6rem,14vw,7rem) 0 clamp(3.5rem,8vw,5rem); }
  .scenario-pin { position:relative; top:auto; height:auto; display:block; overflow:visible; padding:0; }
  .scenario-section__head { align-items:start; flex-direction:column; gap:1rem; margin-bottom:2rem; }
  .scenario-section__head p { max-width:68ch; }
  .scenario-viewport { overflow-x:auto; overflow-y:hidden; padding-inline:max(1.25rem,calc((100vw - 1180px) / 2)); scroll-padding-inline:max(1.25rem,calc((100vw - 1180px) / 2)); scroll-snap-type:x mandatory; overscroll-behavior-inline:contain; scrollbar-width:thin; scrollbar-color:#37675d rgba(255,255,255,.12); }
  .scenario-list { position:static; width:max-content; height:auto; display:flex; gap:1rem; contain:none; }
  .scenario-story { position:relative; z-index:auto; inset:auto; width:min(84vw,760px); flex:0 0 min(84vw,760px); scroll-snap-align:center; scroll-snap-stop:always; }
  .scenario-story__inner { width:100%; height:auto; display:block; opacity:1 !important; transform:none; filter:none; clip-path:none; transition:none; will-change:auto; }
  .scenario-story--reverse .scenario-story__visual { order:initial; }
  .scenario-story__visual { width:100%; height:auto; min-height:0; aspect-ratio:4 / 3; margin-bottom:1.5rem; }
  .scenario-story__content { padding-right:clamp(.5rem,3vw,1.5rem); }
  .scenario-story__content h3 { font-size:clamp(1.7rem,5vw,2.5rem); }
}

.cases-archive__head { display:flex; align-items:end; justify-content:space-between; gap:2rem; margin-bottom:2rem; padding-bottom:1.25rem; border-bottom:1px solid var(--ink); }
.cases-archive__head h2 { margin:0; font-size:clamp(1.8rem,3.5vw,3rem); letter-spacing:-.03em; }
.cases-archive__head p { max-width:62ch; margin:.75rem 0 0; color:var(--muted); font-size:.76rem; line-height:1.75; }
.cases-archive__head > span { flex:0 0 auto; color:var(--red); font-size:.72rem; font-weight:800; }
.cases-archive .featured-case { grid-template-columns:minmax(0,1.35fr) minmax(360px,.65fr); overflow:hidden; border:0; background:#f7f7f4; }
.cases-archive .featured-case > .case-image { min-height:0; display:grid; place-items:center; background:transparent; }
.cases-archive .featured-case > .case-image img { display:block; width:100%; height:auto; max-height:none; object-fit:contain; }
.cases-archive .featured-case:hover .case-image img,
.cases-archive .case-grid article:hover .case-image img { transform:none; }

/* 图片墙采用真实图片比例，避免把横幅图与 3:2 场景图裁成同一个尺寸。 */
.cases-archive .case-grid { display:block; columns:3 300px; column-gap:clamp(1.25rem,2.5vw,2.25rem); margin-top:clamp(2rem,4vw,3.5rem); }
.cases-archive .case-grid > article { width:100%; display:inline-block; break-inside:avoid; margin:0 0 clamp(2.5rem,4vw,4rem); border-top:1px solid var(--ink); padding-top:.75rem; vertical-align:top; }
.cases-archive .case-grid .case-image { aspect-ratio:auto; display:block; background:#e3e5e1; }
.cases-archive .case-grid .case-image img { width:100%; height:auto; display:block; object-fit:contain; }
.case-card__content { min-width:0; }
.cases-archive .case-card__content h3 { margin:1rem 0 .65rem; font-size:clamp(1.05rem,1.35vw,1.28rem); line-height:1.35; letter-spacing:-.02em; text-wrap:balance; }
.case-grid__summary { max-width:62ch; margin:0 0 .9rem !important; color:#4f5a5d !important; font-size:.72rem !important; line-height:1.72; }
.case-card__meta { border-top:1px solid var(--line); padding-top:.6rem; }
.cases-archive .case-card__meta p { margin:.28rem 0; line-height:1.65; }

.cases-archive--customer .featured-case { grid-template-columns:minmax(0,1.08fr) minmax(360px,.92fr); }
.cases-archive--customer .case-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); columns:auto; gap:clamp(1.5rem,3vw,3rem); }
.cases-archive--customer .case-grid > article { display:block; margin:0; }
.cases-archive--project .featured-case { grid-template-columns:minmax(360px,.9fr) minmax(0,1.1fr); border-color:#193038; background:#17343a; color:#fff; }
.cases-archive--project .featured-case > .case-image { order:2; aspect-ratio:1; background:transparent; }
.cases-archive--project .featured-case > div:last-child { order:1; }
.cases-archive--project .featured-case h2 { color:#fff; font-size:clamp(1.55rem,2.2vw,2.15rem); }
.cases-archive--project .featured-case__summary,
.cases-archive--project .featured-case dl div { color:rgba(255,255,255,.68); }
.cases-archive--project .featured-case dt::after { color:rgba(255,255,255,.35); }
.cases-archive--project .featured-case > div:last-child > a { border-color:rgba(255,255,255,.22); color:#fff; }
.cases-archive--project .case-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); columns:auto; gap:clamp(1.2rem,2.5vw,2.25rem); }
.cases-archive--project .case-grid > article { display:block; margin:0; }
.cases-archive--result .featured-case { grid-template-columns:1fr; border:0; background:transparent; }
.cases-archive--result .featured-case > .case-image { display:grid; place-items:center; background:transparent; }
.cases-archive--result .featured-case > .case-image img { width:min(100%,640px); height:auto; max-height:none; }
.cases-archive--result .featured-case > div:last-child { display:grid; grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr); column-gap:clamp(1.5rem,3vw,3rem); align-items:start; padding:clamp(1.5rem,2.5vw,2.5rem) 0; }
.cases-archive--result .featured-case > div:last-child > p,
.cases-archive--result .featured-case h2,
.cases-archive--result .featured-case__summary,
.cases-archive--result .featured-case > div:last-child > a { grid-column:1; }
.cases-archive--result .featured-case dl { grid-column:2; grid-row:1 / span 5; align-self:center; }
.cases-archive--result .case-grid { display:grid; grid-template-columns:1fr; columns:auto; gap:clamp(1rem,2vw,1.5rem); margin-top:clamp(.75rem,1.5vw,1.25rem); }
.cases-archive--result .case-grid > article { display:grid; grid-template-columns:minmax(280px,.72fr) minmax(0,1.28fr); gap:clamp(1rem,2vw,1.75rem); align-items:start; margin:0; border-top:0; padding-top:0; }
.cases-archive--result .case-grid > article:nth-child(even) { grid-template-columns:minmax(0,1.28fr) minmax(280px,.72fr); }
.cases-archive--result .case-grid > article:nth-child(even) .case-image { order:2; }
.cases-archive--result .case-grid > article:nth-child(even) .case-card__content { order:1; padding-left:0; }
.case-empty { min-height:260px; display:grid; grid-template-columns:auto minmax(0,1fr) auto; gap:1.25rem; align-items:center; border-top:1px solid var(--line); border-bottom:1px solid var(--line); padding:2rem; background:#f0efea; }
.case-empty > svg { width:34px; height:34px; color:var(--red); stroke-width:1.5; }
.case-empty h3 { margin:0; font-size:1.1rem; }
.case-empty p { max-width:70ch; margin:.55rem 0 0; color:var(--muted); font-size:.74rem; line-height:1.75; }
.case-empty > a { display:inline-flex; align-items:center; gap:.55rem; border:1px solid var(--ink); padding:.75rem 1rem; color:var(--ink); font-size:.72rem; font-weight:800; white-space:nowrap; }
.case-empty > a:hover { border-color:var(--red); color:var(--red); }
.case-empty > a:focus-visible { outline:2px solid rgba(189,56,51,.4); outline-offset:3px; }

@media (max-width: 900px) {
  .cases-overview { grid-template-columns:1fr; gap:2rem; padding-block:3rem; }
  .cases-archive .featured-case,
  .cases-archive--customer .featured-case,
  .cases-archive--project .featured-case { grid-template-columns:1fr; }
  .cases-archive--project .featured-case > .case-image,
  .cases-archive--project .featured-case > div:last-child { order:initial; }
  .cases-archive--result .featured-case > div:last-child { grid-template-columns:1fr; }
  .cases-archive--result .featured-case dl { grid-column:1; grid-row:auto; }
  .cases-archive .case-grid { columns:2 260px; }
  .cases-archive--customer .case-grid,
  .cases-archive--project .case-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); columns:auto; }
  .cases-archive--result .case-grid { display:grid; grid-template-columns:1fr; columns:auto; }
  .cases-archive--result .case-grid > article,
  .cases-archive--result .case-grid > article:nth-child(even) { display:block; grid-template-columns:1fr; }
  .cases-archive--result .case-grid > article:nth-child(even) .case-image,
  .cases-archive--result .case-grid > article:nth-child(even) .case-card__content { order:initial; padding-left:0; }
}

@media (max-width: 620px) {
  .cases-overview__statement h2, .scenario-section__head h2 { font-size:2.1rem; }
  .cases-overview__principles p { grid-template-columns:1fr; gap:.35rem; }
  .scenario-story__content h3 { font-size:1.75rem; }
  .scenario-story__details > div { grid-template-columns:1fr; gap:.3rem; }
  .cases-archive__head { align-items:start; flex-direction:column; gap:.75rem; }
  .cases-archive .featured-case > .case-image,
  .cases-archive--customer .featured-case > .case-image,
  .cases-archive--project .featured-case > .case-image,
  .cases-archive--result .featured-case > .case-image { min-height:0; aspect-ratio:auto; }
  .cases-archive .case-grid { columns:1; }
  .cases-archive--customer .case-grid,
  .cases-archive--project .case-grid,
  .cases-archive--result .case-grid { grid-template-columns:1fr; columns:auto; }
  .case-empty { grid-template-columns:auto 1fr; padding:1.4rem; }
  .case-empty > a { grid-column:1 / -1; justify-content:center; }
}

@media (prefers-reduced-motion: reduce) {
  .scenario-story__inner { transform:none; filter:none; clip-path:none; transition:opacity 160ms ease; }
  .scenario-story__content > a svg { transition:none; }
}

/* Unified archive presentation: keep all four case categories on one clear visual system. */
.cases-archive { width:min(1180px,calc(100% - 2rem)); max-width:none; margin-inline:auto; }
.cases-archive__head { margin-bottom:1.5rem; padding-bottom:1rem; }
.case-tabs { width:fit-content; max-width:100%; margin:0 auto 2.25rem; gap:.25rem; border:1px solid var(--line); border-radius:999px; padding:.3rem; background:#f1f6f2; }
.case-tabs button { min-width:7.5rem; border:0; border-radius:999px; padding:.7rem 1.15rem; color:var(--muted); font-family:var(--sans); font-size:.78rem; font-weight:700; transition:background .2s ease,color .2s ease,box-shadow .2s ease; }
.case-tabs button:hover { color:var(--ink); background:#e2efe8; }
.case-tabs button.is-active { color:#fff; background:var(--red); text-decoration:none; box-shadow:0 5px 14px rgba(189,56,51,.18); }

.cases-archive .featured-case,
.cases-archive--customer .featured-case,
.cases-archive--project .featured-case,
.cases-archive--result .featured-case { grid-template-columns:minmax(0,1fr) minmax(0,1fr); overflow:hidden; border:0; border-radius:24px; background:#f1f6f2; box-shadow:0 18px 42px rgba(23,52,58,.08); }
.cases-archive .featured-case > .case-image,
.cases-archive--customer .featured-case > .case-image,
.cases-archive--project .featured-case > .case-image,
.cases-archive--result .featured-case > .case-image { order:initial; min-height:0; aspect-ratio:1; display:block; background:#e5f0eb; }
.cases-archive .featured-case > .case-image img,
.cases-archive--customer .featured-case > .case-image img,
.cases-archive--project .featured-case > .case-image img,
.cases-archive--result .featured-case > .case-image img { width:100%; height:100%; max-width:none; max-height:none; display:block; object-fit:cover; filter:none; }
.cases-archive .featured-case > div:last-child,
.cases-archive--customer .featured-case > div:last-child,
.cases-archive--project .featured-case > div:last-child,
.cases-archive--result .featured-case > div:last-child { order:initial; display:flex; flex-direction:column; justify-content:center; min-width:0; padding:clamp(2rem,5vw,4.5rem); }
.cases-archive .featured-case h2 { max-width:18ch; margin-bottom:1.15rem; font-size:clamp(1.65rem,2.35vw,2.45rem); line-height:1.12; }
.cases-archive .featured-case__summary { max-width:60ch; margin:-.35rem 0 1.35rem; font-size:.8rem; line-height:1.8; }
.cases-archive .featured-case dl div { margin:.55rem 0; font-size:.78rem; }
.cases-archive .featured-case > div:last-child > a { margin-top:1.25rem; }

.cases-archive .case-grid,
.cases-archive--customer .case-grid,
.cases-archive--project .case-grid,
.cases-archive--result .case-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); columns:auto; gap:clamp(1.75rem,3vw,3rem) clamp(1rem,2.5vw,2rem); margin-top:clamp(2.25rem,4vw,3.5rem); }
.cases-archive .case-grid > article,
.cases-archive--customer .case-grid > article,
.cases-archive--project .case-grid > article,
.cases-archive--result .case-grid > article { display:block; width:auto; margin:0; border:0; padding:0; }
.cases-archive .case-grid .case-image,
.cases-archive--customer .case-grid .case-image,
.cases-archive--project .case-grid .case-image,
.cases-archive--result .case-grid .case-image { aspect-ratio:1; border-radius:16px; background:#e5f0eb; overflow:hidden; }
.cases-archive .case-grid .case-image img,
.cases-archive--customer .case-grid .case-image img,
.cases-archive--project .case-grid .case-image img,
.cases-archive--result .case-grid .case-image img { width:100%; height:100%; display:block; object-fit:cover; filter:none; }
.cases-archive .case-card__content h3 { margin:1rem 0 .55rem; font-size:clamp(1.05rem,1.4vw,1.3rem); line-height:1.3; }
.cases-archive .case-grid__summary { max-width:62ch; margin:0 0 .85rem !important; color:var(--muted) !important; font-size:.76rem !important; line-height:1.75; }
.cases-archive .case-card__meta { border-top:1px solid var(--line); padding-top:.65rem; }
.cases-archive .case-card__meta p { margin:.3rem 0; color:var(--muted); font-size:.72rem; line-height:1.6; }

@media (max-width: 900px) {
  .cases-archive .featured-case,
  .cases-archive--customer .featured-case,
  .cases-archive--project .featured-case,
  .cases-archive--result .featured-case { grid-template-columns:1fr; }
  .cases-archive .case-grid,
  .cases-archive--customer .case-grid,
  .cases-archive--project .case-grid,
  .cases-archive--result .case-grid { grid-template-columns:repeat(2,minmax(0,1fr)); columns:auto; }
}

@media (max-width: 620px) {
  .case-tabs { width:100%; justify-content:flex-start; overflow-x:auto; margin-bottom:1.75rem; }
  .case-tabs button { flex:1 0 6rem; min-width:6rem; padding-inline:.65rem; }
  .cases-archive .featured-case > div:last-child,
  .cases-archive--customer .featured-case > div:last-child,
  .cases-archive--project .featured-case > div:last-child,
  .cases-archive--result .featured-case > div:last-child { padding:1.5rem; }
  .cases-archive .case-grid,
  .cases-archive--customer .case-grid,
  .cases-archive--project .case-grid,
  .cases-archive--result .case-grid { grid-template-columns:1fr; columns:auto; gap:2rem; }
}
</style>
