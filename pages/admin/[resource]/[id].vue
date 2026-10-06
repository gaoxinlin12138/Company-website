<script setup lang="ts">
const route = useRoute()
const resource = computed(() => String(route.params.resource) as 'products' | 'articles' | 'cases' | 'home')
const id = computed(() => String(route.params.id))
definePageMeta({ layout: 'admin' })
</script>
<template><AdminEditor v-if="['products','articles','cases','home'].includes(resource)" :resource="resource" :id="id" /></template>
