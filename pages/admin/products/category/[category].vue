<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const categoryConfig: Record<string, { title: string; names: string[] }> = {
  'basin-faucets': { title: '面盆龙头', names: ['面盆龙头'] },
  'shower-sets': { title: '花洒套装', names: ['花洒套装'] },
  toilets: { title: '坐便器', names: ['坐便器'] },
  'bathroom-cabinets': { title: '浴室柜', names: ['浴室柜'] },
  'kitchen-faucets': { title: '厨房龙头', names: ['厨房龙头'] },
  'bathroom-accessories': { title: '卫浴挂件', names: ['卫浴挂件'] },
  'valve-parts': { title: '阀门配件', names: ['阀门配件'] },
  'drainage-parts': { title: '排水配件', names: ['排水配件'] },
  'installation-parts': { title: '安装配件', names: ['安装配件'] },
}
const key = String(route.params.category || '')
const config = categoryConfig[key]
if (!config) await navigateTo('/admin/products', { replace: true })
useHead({ title: `${config?.title || '产品分类'}｜管理后台` })
</script>

<template>
  <AdminResourceList
    v-if="config"
    resource="products"
    :title="config.title"
    :category-names="config.names"
    :description="`独立维护${config.title}分类下的产品，从此页新增时会自动归入该分类。`"
  />
</template>
