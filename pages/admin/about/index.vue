<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const route = useRoute()
const legacyTarget: Record<string, string> = {
  '#company-profile': '/admin/about/company-profile',
  '#brand-culture': '/admin/about/brand-culture',
  '#qualifications': '/admin/about/qualifications',
  '#brand-vi': '/admin/about/brand-vi',
}
await navigateTo(legacyTarget[route.hash] || '/admin/about/company-profile', { replace: true })
</script>

<template></template>
