<script setup lang="ts">
import { NEWS_CATEGORIES, type NewsCategory } from '~/data/news'

const { language, t } = useSiteLanguage()
useSeoMeta({
  title: () => language.value === 'en' ? 'News | Hongcai Wanfu' : '新闻动态｜红财万富',
  description: () => language.value === 'en' ? 'Company updates and practical bathroom hardware sourcing insights from Hongcai Wanfu.' : '红财万富公司新闻与卫浴五金行业资讯。'
})

const categories = NEWS_CATEGORIES
type NewsItem = {
  id?: string
  slug: string
  date: string
  category: string
  categoryEn?: string
  title: string
  titleEn?: string
  summary: string
  summaryEn?: string
  image: string
}
const { data: managedNews } = await useFetch<NewsItem[]>('/api/content/articles', { default: () => [] })
const allNews = computed(() => managedNews.value.filter(item => categories.includes(item.category as typeof categories[number])))
const route = useRoute()
const router = useRouter()
const categoryFromQuery = (value: unknown) => {
  const category = Array.isArray(value) ? value[0] : value
  return typeof category === 'string' && categories.includes(category as NewsCategory) ? category as NewsCategory : categories[0]
}
const active = ref(categoryFromQuery(route.query.category))
const filtered = computed(() => allNews.value.filter(item => item.category === active.value))
const localize = (item: NewsItem, key: 'category' | 'title' | 'summary') => language.value === 'en' ? (item[`${key}En` as keyof NewsItem] || t(item[key])) : item[key]
const formatDate = (date: string) => new Intl.DateTimeFormat(language.value === 'en' ? 'en-GB' : 'zh-CN', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
const categoryCaption = (category: NewsCategory) => {
  const captions = {
    公司新闻: language.value === 'en' ? 'Company updates' : '企业动态与进展',
    行业资讯: language.value === 'en' ? 'Industry insights' : '行业观察与知识'
  }
  return captions[category]
}
const selectCategory = async (category: NewsCategory) => {
  active.value = category
  await router.replace({ path: '/news', query: { category } })
}

watch(() => route.query.category, value => {
  active.value = categoryFromQuery(value)
})
</script>

<template>
  <div class="page page-news">
    <PageHero class="page-hero--inner" title="新闻动态" subtitle="记录公司进展，也关注行业变化" image="/assets/images/hero-news-bamboo-wash.webp" split-text />
    <section id="news-list" class="news-directory section-space">
      <div class="page-wrap news-directory__layout">
        <aside class="news-directory__aside" :aria-label="t('新闻分类')">
          <div class="news-directory__brand">
            <span>NEWS</span>
            <strong>{{ language === 'en' ? 'News centre' : '新闻动态' }}</strong>
          </div>
          <div class="news-directory__tabs" role="tablist" :aria-label="t('新闻分类')">
            <button
              v-for="category in categories"
              :key="category"
              type="button"
              role="tab"
              :aria-selected="active === category"
              @click="selectCategory(category)"
            >
              <span><strong>{{ t(category) }}</strong><small>{{ categoryCaption(category) }}</small></span>
              <Icon name="lucide:arrow-right" />
            </button>
          </div>
          <NuxtLink class="news-directory__contact" to="/contact#inquiry">
            <span>{{ language === 'en' ? 'Need more information?' : '需要更多资料？' }}</span>
            <strong>{{ language === 'en' ? 'Send your sourcing request' : '提交您的采购需求' }}</strong>
            <Icon name="lucide:arrow-up-right" />
          </NuxtLink>
        </aside>

        <main class="news-directory__content">
          <div class="news-directory__trail">
            <span>{{ language === 'en' ? 'Home' : '首页' }}</span>
            <Icon name="lucide:chevron-right" />
            <span>{{ language === 'en' ? 'News' : '新闻动态' }}</span>
            <Icon name="lucide:chevron-right" />
            <strong>{{ t(active) }}</strong>
          </div>
          <header class="news-directory__header">
            <div><h2>{{ language === 'en' ? 'Information that supports better sourcing decisions.' : '让信息成为采购判断的依据。' }}</h2><p>{{ language === 'en' ? 'Company updates, product knowledge and sourcing notes are organised here. Published content from the management console appears automatically.' : '这里集中整理公司动态、产品知识与采购信息。管理台发布后的新闻内容会自动同步到前台。' }}</p></div>
            <span>{{ String(filtered.length).padStart(2, '0') }} {{ language === 'en' ? 'published items' : '条已展示内容' }}</span>
          </header>
          <div class="news-feed">
            <NuxtLink v-for="(item, index) in filtered" :key="item.slug" class="news-feed__link" :to="`/news/${item.slug}`" :aria-label="localize(item, 'title')">
              <article :class="{ 'news-lead': index === 0 }">
                <img :src="item.image" :alt="localize(item, 'title')" width="960" height="640" loading="lazy">
                <div class="news-copy"><p><time :datetime="item.date">{{ formatDate(item.date) }}</time> <span>|</span> <b>{{ localize(item, 'category') }}</b></p><h2>{{ localize(item, 'title') }}</h2><div>{{ localize(item, 'summary') }}</div></div>
                <Icon name="lucide:arrow-up-right" aria-hidden="true" />
                <small v-if="!item.id">{{ t('示意素材 / 待替换') }}</small>
              </article>
            </NuxtLink>
            <div v-if="!filtered.length" class="empty-state">{{ language === 'en' ? 'No published content in this category yet.' : '该分类暂无已发布内容。' }}</div>
          </div>
        </main>
      </div>
    </section>
  </div>
</template>
