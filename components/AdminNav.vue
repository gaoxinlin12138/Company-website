<script setup lang="ts">
type NavChild = { to: string; label: string }
type NavGroup = { to: string; label: string; icon: string; children: NavChild[] }

const route = useRoute()
const groups: NavGroup[] = [
  { to: '/admin/home', label: '首页', icon: 'lucide:panels-top-left', children: [
    { to: '/admin/home', label: '首屏轮播图' },
    { to: '/admin/home-products', label: '推荐产品轮播' },
  ] },
  { to: '/admin/products', label: '产品中心', icon: 'lucide:package', children: [
    { to: '/admin/products', label: '全部产品' },
    { to: '/admin/products/category/basin-faucets', label: '面盆龙头' },
    { to: '/admin/products/category/shower-sets', label: '花洒套装' },
    { to: '/admin/products/category/toilets', label: '坐便器' },
    { to: '/admin/products/category/bathroom-cabinets', label: '浴室柜' },
    { to: '/admin/products/category/kitchen-faucets', label: '厨房龙头' },
    { to: '/admin/products/category/bathroom-accessories', label: '卫浴挂件' },
    { to: '/admin/products/category/valve-parts', label: '阀门配件' },
    { to: '/admin/products/category/drainage-parts', label: '排水配件' },
    { to: '/admin/products/category/installation-parts', label: '安装配件' },
  ] },
  { to: '/admin/about', label: '关于我们', icon: 'lucide:landmark', children: [
    { to: '/admin/about/company-profile', label: '公司简介' },
    { to: '/admin/about/brand-culture', label: '品牌文化' },
    { to: '/admin/about/qualifications', label: '荣誉资质' },
    { to: '/admin/about/brand-vi', label: '企业 VI' },
  ] },
  { to: '/admin/articles', label: '新闻动态', icon: 'lucide:newspaper', children: [
    { to: '/admin/articles?category=公司新闻#article-list', label: '公司新闻' },
    { to: '/admin/articles?category=行业资讯#article-list', label: '行业资讯' },
  ] },
  { to: '/admin/cases', label: '案例展示', icon: 'lucide:building-2', children: [
    { to: '/admin/cases', label: '暂定 · 暂无修改' },
  ] },
  { to: '/admin/contact', label: '联系我们', icon: 'lucide:phone-call', children: [
    { to: '/admin/contact/channels', label: '联系方式' },
    { to: '/admin/contact/location', label: '地理位置' },
    { to: '/admin/contact/inquiry', label: '采购需求说明' },
    { to: '/admin/inquiries', label: '询价记录' },
  ] },
  { to: '/admin/social-contact', label: '社交联系', icon: 'lucide:qr-code', children: [] },
]

const expanded = reactive<Record<string, boolean>>({})

function isActive(to: string) {
  if (to === '/admin/home' && route.path === '/admin/home-products') return true
  if (to === '/admin/contact' && route.path === '/admin/inquiries') return true
  return route.path === to || route.path.startsWith(`${to}/`)
}

function toggleGroup(to: string) {
  expanded[to] = !expanded[to]
}

function normaliseTarget(to: string) {
  const url = new URL(to, 'http://admin.local')
  return { path: url.pathname, hash: url.hash, category: url.searchParams.get('category') || '' }
}

function isChildActive(group: NavGroup, child: NavChild, index: number) {
  const target = normaliseTarget(child.to)
  if (route.path !== target.path) return false
  if (target.category !== String(route.query.category || '')) return false
  if (route.hash) return route.hash === target.hash
  return target.category === String(route.query.category || '')
}

watch(() => route.path, () => {
  const active = groups.find(group => isActive(group.to))
  if (active) expanded[active.to] = true
}, { immediate: true })

async function logout() {
  await $fetch('/api/admin/auth/logout', { method: 'POST' })
  await navigateTo('/admin/login', { replace: true })
}
</script>

<template>
  <nav class="admin-nav" aria-label="管理后台导航">
    <NuxtLink class="admin-nav__brand" to="/admin/home"><span>HWF</span><div><strong>红财万富</strong><small>网站内容管理</small></div></NuxtLink>
    <div class="admin-nav__section">CONTENT CONTROL</div>
    <div class="admin-nav__links">
      <div v-for="group in groups" :key="group.to" class="admin-nav__group" :class="{ 'is-active': isActive(group.to), 'is-expanded': expanded[group.to] }">
        <NuxtLink v-if="!group.children.length" class="admin-nav__parent" :to="group.to">
          <Icon :name="group.icon" /><span>{{ group.label }}</span>
        </NuxtLink>
        <button v-else class="admin-nav__parent" type="button" :aria-expanded="Boolean(expanded[group.to])" :aria-controls="`admin-subnav-${group.to.split('/').pop()}`" @pointerup.prevent="toggleGroup(group.to)" @keydown.enter.prevent="toggleGroup(group.to)" @keydown.space.prevent="toggleGroup(group.to)">
          <Icon :name="group.icon" /><span>{{ group.label }}</span><Icon class="admin-nav__arrow" name="lucide:chevron-down" />
        </button>
        <div v-if="group.children.length" v-show="expanded[group.to]" :id="`admin-subnav-${group.to.split('/').pop()}`" class="admin-nav__children">
          <NuxtLink v-for="(child, index) in group.children" :key="child.to" :to="child.to" :class="{ 'is-current': isChildActive(group, child, Number(index)) }"><span>{{ child.label }}</span><Icon name="lucide:arrow-up-right" /></NuxtLink>
        </div>
      </div>
    </div>
    <div class="admin-nav__foot"><NuxtLink class="admin-nav__site" to="/" target="_blank"><Icon name="lucide:external-link" /><span>查看网站</span></NuxtLink><button class="admin-nav__logout" type="button" @click="logout"><Icon name="lucide:log-out" /><span>退出登录</span></button><span class="admin-nav__version">LOCAL CONSOLE · v1</span></div>
  </nav>
</template>



