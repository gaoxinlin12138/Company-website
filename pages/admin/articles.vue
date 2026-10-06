<script setup lang="ts">
import { NEWS_CATEGORIES, type NewsCategory } from '~/data/news'

definePageMeta({ layout: 'admin' })
const route = useRoute()
const requestedCategory = computed(() => Array.isArray(route.query.category) ? route.query.category[0] : route.query.category)
const activeCategory = computed<NewsCategory>(() => NEWS_CATEGORIES.includes(requestedCategory.value as NewsCategory) ? requestedCategory.value as NewsCategory : NEWS_CATEGORIES[0])

if (!NEWS_CATEGORIES.includes(requestedCategory.value as NewsCategory)) {
  await navigateTo({ path: '/admin/articles', query: { category: NEWS_CATEGORIES[0] }, hash: '#article-list' }, { replace: true })
}

useHead({ title: () => `${activeCategory.value}｜管理后台` })
</script>

<template><AdminResourceList resource="articles" :title="activeCategory" description="维护封面、中文标题、摘要、正文及对应英文译文；保存后自动发布。" /></template>
