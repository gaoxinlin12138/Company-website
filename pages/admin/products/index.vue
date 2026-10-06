<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: '产品管理｜管理后台' })
</script>

<template>
  <AdminResourceList resource="products" title="产品中心" description="维护产品型号、材质、分类和图片；新建后先保存为草稿，确认无误再发布到前台。">
    <template #before-list>
      <AdminProductCatalogueEditor />
    </template>
  </AdminResourceList>
</template>
