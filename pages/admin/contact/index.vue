<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const route = useRoute()
const legacyTarget: Record<string, string> = {
  '#contact-channels': '/admin/contact/channels',
  '#contact-location': '/admin/contact/location',
  '#contact-inquiry': '/admin/contact/inquiry',
}
await navigateTo(legacyTarget[route.hash] || '/admin/contact/channels', { replace: true })
</script>

<template></template>
