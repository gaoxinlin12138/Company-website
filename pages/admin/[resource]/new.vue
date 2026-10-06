<script setup lang="ts">
const route = useRoute()
const resource = computed(() => String(route.params.resource) as 'products' | 'articles' | 'cases' | 'home')
definePageMeta({ layout: 'admin' })
if (route.params.resource === 'home') await navigateTo('/admin/home', { replace: true })
</script>
<template><AdminEditor v-if="['products','articles','cases','home'].includes(resource)" :resource="resource" /></template>
