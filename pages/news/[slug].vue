<script setup lang="ts">
import type { NewsCategory, SampleNewsArticle } from '~/data/news'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const { language, t } = useSiteLanguage()
const { data: article, error } = await useFetch<SampleNewsArticle>(() => `/api/content/articles/${encodeURIComponent(slug.value)}`)

if (error.value || !article.value) {
  throw createError({ statusCode: 404, statusMessage: language.value === 'en' ? 'Article not found' : '未找到这篇文章' })
}

const localize = (key: 'category' | 'title' | 'summary' | 'content') => {
  const item = article.value
  if (!item) return ''
  if (language.value === 'en') return item[`${key}En` as 'categoryEn' | 'titleEn' | 'summaryEn' | 'contentEn'] || item[key]
  return item[key]
}
const paragraphs = computed(() => localize('content').split(/\n\s*\n/).map(item => item.trim()).filter(Boolean))
const formatDate = (date: string) => new Intl.DateTimeFormat(language.value === 'en' ? 'en-GB' : 'zh-CN', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
const categoryQuery = computed(() => ({ path: '/news', query: { category: article.value?.category as NewsCategory }, hash: '#news-list' }))

useSeoMeta({
  title: () => `${localize('title')}｜${language.value === 'en' ? 'Hongcai Wanfu News' : '红财万富新闻动态'}`,
  description: () => localize('summary')
})
</script>

<template>
  <div v-if="article" class="page page-news-article">
    <PageHero class="page-hero--inner" title="新闻动态" subtitle="记录公司进展，也关注行业变化" image="/assets/images/hero-basin-concept.webp" split-text />
    <main class="news-article section-space">
      <article class="page-wrap news-article__paper">
        <nav class="news-article__trail" :aria-label="language === 'en' ? 'Breadcrumb' : '面包屑导航'">
          <NuxtLink to="/">{{ language === 'en' ? 'Home' : '首页' }}</NuxtLink>
          <Icon name="lucide:chevron-right" aria-hidden="true" />
          <NuxtLink :to="categoryQuery">{{ language === 'en' ? 'News' : '新闻动态' }}</NuxtLink>
          <Icon name="lucide:chevron-right" aria-hidden="true" />
          <span>{{ localize('category') }}</span>
        </nav>

        <header class="news-article__header">
          <p><time :datetime="article.date">{{ formatDate(article.date) }}</time><span>/</span><b>{{ localize('category') }}</b></p>
          <h1>{{ localize('title') }}</h1>
          <div>{{ localize('summary') }}</div>
        </header>

        <div class="news-article__body">
          <p v-for="(paragraph, index) in paragraphs" :key="index">{{ paragraph }}</p>
        </div>

        <footer class="news-article__footer">
          <NuxtLink :to="categoryQuery"><Icon name="lucide:arrow-left" aria-hidden="true" />{{ language === 'en' ? `Back to ${localize('category')}` : `返回${localize('category')}` }}</NuxtLink>
          <NuxtLink to="/contact#inquiry">{{ language === 'en' ? 'Send a sourcing request' : '提交采购需求' }}<Icon name="lucide:arrow-up-right" aria-hidden="true" /></NuxtLink>
        </footer>
      </article>
    </main>
  </div>
</template>

<style scoped>
.news-article{background:#e4efe9}.news-article__paper{max-width:1040px;background:#fffefa;box-shadow:0 18px 45px rgba(23,52,58,.08);padding:clamp(1.25rem,4vw,3.5rem) clamp(1.25rem,6vw,5.5rem) clamp(2rem,6vw,5rem)}.news-article__trail{display:flex;align-items:center;gap:.55rem;border-bottom:1px solid var(--line);padding-bottom:1rem;color:var(--muted);font-size:.7rem}.news-article__trail a:hover{color:var(--red)}.news-article__trail .iconify{width:13px;height:13px}.news-article__trail span{color:var(--red)}.news-article__header{max-width:820px;padding:clamp(2.5rem,6vw,5rem) 0 clamp(1.75rem,4vw,3rem)}.news-article__header p{display:flex;align-items:center;gap:.7rem;margin:0 0 1rem;color:var(--muted);font-size:.8rem}.news-article__header p b{color:var(--red)}.news-article__header h1{max-width:18em;margin:0;font-family:var(--serif);font-size:clamp(2rem,5vw,4.2rem);line-height:1.08;letter-spacing:-.03em;text-wrap:balance}.news-article__header>div{max-width:68ch;margin-top:1.2rem;color:var(--muted);font-size:clamp(.88rem,1.4vw,1rem);line-height:1.8;text-wrap:pretty}.news-article__body{max-width:72ch;margin:0 auto;border-top:1px solid var(--line);padding-top:clamp(2rem,4vw,3rem)}.news-article__body p{margin:0;color:#334248;font-size:clamp(.96rem,1.5vw,1.08rem);line-height:2;text-wrap:pretty}.news-article__body p+p{margin-top:1.4rem}.news-article__footer{display:flex;align-items:center;justify-content:space-between;gap:1rem;border-top:1px solid var(--line);margin-top:clamp(2.5rem,6vw,5rem);padding-top:1.4rem}.news-article__footer a{display:inline-flex;align-items:center;gap:.45rem;font-size:.75rem;font-weight:800}.news-article__footer a:last-child{color:var(--red)}.news-article__footer a:hover{text-decoration:underline;text-underline-offset:4px}.news-article__footer .iconify{width:16px;height:16px}@media(max-width:600px){.news-article{padding-block:1rem 2rem}.news-article__paper{width:min(100% - 1rem,1040px)}.news-article__header h1{font-size:2rem}.news-article__footer{align-items:flex-start;flex-direction:column}}
.news-article { padding-block: clamp(3rem,5vw,5rem) clamp(4rem,6vw,6rem); }
</style>


