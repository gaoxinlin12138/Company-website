<script setup lang="ts">
type Resource = 'products' | 'articles' | 'cases'
const props = defineProps<{ resource: Resource; title: string; description: string; categoryNames?: string[] }>()
const route = useRoute()
type ResourceItem = Record<string, any> & { id: string; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; sortOrder: number }
const items = ref<ResourceItem[]>([])
const statusFilter = ref('')
const categoryFilter = ref('')
const categories = ref<any[]>([])
const search = ref('')
const loading = ref(true)
const savingId = ref('')
const errorMessage = ref('')
const showProductCreate = ref(false)
const productModal = ref<HTMLElement | null>(null)
let previousBodyOverflow = ''
const statusOptions = [{ value: 'DRAFT', label: '草稿' }, { value: 'PUBLISHED', label: '已发布' }, { value: 'ARCHIVED', label: '已归档' }]

const endpoint = computed(() => `/api/admin/${props.resource}`)
const listAnchor = computed(() => props.resource === 'articles' ? 'article-list' : props.resource === 'products' ? 'product-list' : 'resource-list')
const activeArticleCategory = computed(() => String(route.query.category || '公司新闻'))
const newTarget = computed(() => {
  if (props.resource === 'articles') return { path: '/admin/articles/new', query: { category: activeArticleCategory.value } }
  if (props.resource === 'products' && props.categoryNames?.length) {
    return { path: '/admin/products/new', query: { category: props.categoryNames[0] } }
  }
  return `/admin/${props.resource}/new`
})
const editTarget = (item: ResourceItem) => props.resource === 'articles'
  ? { path: `/admin/articles/${item.id}`, query: { category: item.categoryZh || activeArticleCategory.value } }
  : `/admin/${props.resource}/${item.id}`
const fixedCategoryIds = computed(() => {
  if (props.resource !== 'products' || !props.categoryNames?.length) return []
  return categories.value.filter(item => props.categoryNames?.includes(item.nameZh)).map(item => item.id)
})

onMounted(async () => {
  try {
    const auth = await $fetch<{ authenticated: boolean }>('/api/admin/auth/status')
    if (!auth.authenticated) return navigateTo('/admin/login', { replace: true })
    if (props.resource === 'products') categories.value = await $fetch<any[]>('/api/admin/categories')
    await load()
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '无法连接后台服务。'
    loading.value = false
  }
})

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
  items.value = await $fetch<ResourceItem[]>(endpoint.value, { query: { status: statusFilter.value || undefined, categoryId: !props.categoryNames?.length ? (categoryFilter.value || undefined) : undefined, categoryIds: fixedCategoryIds.value.length ? fixedCategoryIds.value.join(',') : props.categoryNames?.length ? '__missing_category__' : undefined, category: props.resource === 'articles' ? String(route.query.category || '') || undefined : undefined, search: search.value || undefined } })
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '读取内容失败。'
  } finally {
    loading.value = false
  }
}

async function update(item: ResourceItem) {
  savingId.value = item.id
  try {
    await $fetch(`${endpoint.value}/${item.id}`, { method: 'PATCH', body: { status: item.status, sortOrder: Number(item.sortOrder) || 0 } })
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '保存失败。'
  } finally {
    savingId.value = ''
  }
}

async function publish(item: ResourceItem) {
  savingId.value = item.id
  errorMessage.value = ''
  try {
    await $fetch(`${endpoint.value}/${item.id}`, { method: 'PATCH', body: { status: 'PUBLISHED' } })
    item.status = 'PUBLISHED'
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '发布失败。'
  } finally {
    savingId.value = ''
  }
}

async function remove(item: ResourceItem) {
  if (!window.confirm(`确定删除“${displayLabel(item)}”吗？删除后无法恢复。`)) return
  try {
    await $fetch(`${endpoint.value}/${item.id}`, { method: 'DELETE' })
    await load()
  } catch (error: any) { errorMessage.value = error?.data?.statusMessage || '删除失败。' }
}

function displayLabel(item: ResourceItem) {
  return props.resource === 'products' ? (item.model || '未填写型号') : (item.titleZh || '未命名内容')
}

function statusLabel(value: string) { return statusOptions.find(item => item.value === value)?.label || value }
const productCategories = computed(() => categories.value.filter(item => item.parentId))

async function openProductCreate() {
  showProductCreate.value = true
  await nextTick()
  productModal.value?.focus()
}

function closeProductCreate() {
  showProductCreate.value = false
}

async function handleProductCreated() {
  closeProductCreate()
  await load()
}

watch(showProductCreate, (open) => {
  if (!import.meta.client) return
  if (open) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = previousBodyOverflow
  }
})

onBeforeUnmount(() => {
  if (import.meta.client && showProductCreate.value) document.body.style.overflow = previousBodyOverflow
})

watch(() => route.query.category, () => {
  if (props.resource === 'articles' && !loading.value) load()
})
</script>

<template>
  <div class="admin-resource">
    <header class="admin-resource__head"><div><p class="admin-resource__eyebrow">CONTENT MANAGEMENT</p><h1>{{ title }}</h1><p>{{ description }}</p></div><button v-if="resource === 'products'" class="admin-resource__new" type="button" @click="openProductCreate"><Icon name="lucide:plus" />新建产品</button><NuxtLink v-else class="admin-resource__new" :to="newTarget"><Icon name="lucide:plus" />新建{{ title }}</NuxtLink></header>
    <main :id="listAnchor" class="admin-resource__content">
      <slot name="before-list" />
      <section class="admin-resource__toolbar"><strong>{{ items.length }}</strong><span>条记录</span><select v-if="resource !== 'articles'" v-model="statusFilter" aria-label="状态筛选" @change="load"><option value="">全部状态</option><option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option></select><form :class="{ 'admin-resource__search--article': resource === 'articles' }" @submit.prevent="load"><Icon name="lucide:search" /><input v-model="search" name="content-search" placeholder="搜索内容…" aria-label="搜索内容" autocomplete="off"></form><button type="button" class="admin-resource__refresh" aria-label="刷新内容列表" title="刷新内容列表" @click="load"><Icon name="lucide:refresh-cw" /></button></section>
      <nav v-if="resource === 'products' && productCategories.length && !categoryNames?.length" class="admin-resource__categories" aria-label="产品分类"><button type="button" :class="{ 'is-active': !categoryFilter }" @click="categoryFilter = ''; load()">全部产品</button><button v-for="category in productCategories" :key="category.id" type="button" :class="{ 'is-active': categoryFilter === category.id }" @click="categoryFilter = category.id; load()">{{ category.nameZh }}</button></nav>
      <p v-if="errorMessage" class="admin-resource__error" role="alert">{{ errorMessage }}</p>
      <section class="admin-resource__table-wrap">
        <div v-if="loading" class="admin-resource__empty">正在读取数据…</div>
        <div v-else-if="!items.length" class="admin-resource__empty"><Icon name="lucide:folder-open" /><strong>暂无{{ title }}内容</strong><span>当前数据库没有匹配记录。</span></div>
        <table v-else class="admin-resource__table">
          <thead><tr><th>内容</th><th v-if="resource === 'products'">分类 / 材质</th><th v-if="resource === 'cases'">项目资料</th><th v-if="resource !== 'articles'">状态</th><th v-if="resource === 'cases'">排序</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td><NuxtLink class="resource-title" :to="editTarget(item)" :aria-label="displayLabel(item)"><img v-if="item.coverImage" :src="item.coverImage" alt="" width="52" height="52" loading="lazy"><div><strong>{{ displayLabel(item) }}</strong><small v-if="resource !== 'products'">{{ item.titleEn }}</small></div></NuxtLink></td>
              <td v-if="resource === 'products'"><div class="resource-product-meta"><span>{{ item.categoryZh || '未分类' }}</span><small>{{ item.materialZh || '待确认' }}</small></div></td>
              <td v-if="resource === 'cases'"><span>{{ item.projectTypeZh || '待填写' }}</span><small>{{ item.locationZh || '地点待填写' }}</small></td>
              <td v-if="resource !== 'articles'"><span class="resource-status" :class="`resource-status--${item.status.toLowerCase()}`">{{ statusLabel(item.status) }}</span></td>
              <td v-if="resource === 'cases'"><input v-model.number="item.sortOrder" class="resource-sort" type="number" min="0" :aria-label="`${item.titleZh || '内容'}的排序`"></td>
              <td v-if="resource === 'products'" class="resource-actions resource-actions--product"><NuxtLink class="resource-edit" :to="`/admin/${resource}/${item.id}`">编辑</NuxtLink><button v-if="item.status !== 'PUBLISHED'" class="resource-publish" type="button" :disabled="savingId === item.id" @click="publish(item)">{{ savingId === item.id ? '发布中' : '发布' }}</button><button class="resource-delete" type="button" @click="remove(item)">删除</button></td>
              <td v-else-if="resource === 'articles'" class="resource-actions"><NuxtLink class="resource-edit" :to="editTarget(item)" :aria-label="`编辑${item.titleZh}`">编辑文章</NuxtLink><button class="resource-delete" type="button" :aria-label="`删除${item.titleZh}`" @click="remove(item)">删除</button></td>
              <td v-else class="resource-actions"><button class="resource-save" type="button" :disabled="savingId === item.id" @click="update(item)">{{ savingId === item.id ? '保存中' : '保存' }}</button><NuxtLink class="resource-edit" :to="`/admin/${resource}/${item.id}`">编辑</NuxtLink><button class="resource-delete" type="button" @click="remove(item)">删除</button></td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
    <Teleport to="body">
      <div
        v-if="showProductCreate"
        ref="productModal"
        class="admin-product-modal"
        role="dialog"
        aria-modal="true"
        aria-label="新建产品"
        tabindex="-1"
        @click.self="closeProductCreate"
        @keydown.esc.prevent="closeProductCreate"
      >
        <div class="admin-product-modal__panel">
          <AdminEditor
            resource="products"
            embedded
            :initial-product-category="categoryNames?.[0]"
            @close="closeProductCreate"
            @saved="handleProductCreated"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.admin-resource { min-height: calc(100vh - 64px); background: #f3f7f4; color: #17343a; }
.admin-resource__head { display: flex; align-items: end; justify-content: space-between; gap: 2rem; padding: 2rem clamp(1.25rem, 5vw, 5rem); background: #17343a; color: #fff; }
.admin-resource__eyebrow { margin: 0 0 .45rem; color: #37675d; font-size: .65rem; font-weight: 800; letter-spacing: .16em; }
.admin-resource__head h1 { margin: 0; font-family: var(--serif); font-size: clamp(1.5rem, 4vw, 2.2rem); font-weight: 600; }
.admin-resource__head p:last-child { margin: .45rem 0 0; color: rgba(255,255,255,.72); font-size: .76rem; }
.admin-resource__new { display: inline-flex; align-items: center; gap: .4rem; border: 1px solid #37675d; padding: .6rem .75rem; background:transparent; color: #fff; font:inherit; font-size: .72rem; cursor:pointer; }.admin-resource__new:hover { background:#37675d; border-color:#37675d; }.admin-resource__new:focus-visible{outline:2px solid #37675d;outline-offset:3px}.admin-resource__new svg { width:14px; }
.admin-resource__content { width: min(1400px, calc(100% - 2.5rem)); margin: 0 auto; padding: 2rem 0 4rem; }
.admin-resource__toolbar { display: flex; align-items: center; gap: .45rem; margin-bottom: 1rem; color: #526d65; font-size: .76rem; }
.admin-resource__toolbar > strong { color: #17343a; font-size: 1.35rem; }
.admin-resource__toolbar select { height: 36px; margin-left: auto; border: 1px solid rgba(23,52,58,.15); padding: 0 .65rem; background: #ffffff; color: #17343a; font-size: .72rem; }
.admin-resource__toolbar form { display: flex; align-items: center; gap: .4rem; height: 36px; border: 1px solid rgba(23,52,58,.15); padding: 0 .6rem; background: #ffffff; }
.admin-resource__toolbar .admin-resource__search--article { margin-left:auto; }
.admin-resource__toolbar form svg { width: 14px; }
.admin-resource__toolbar input { width: 190px; border: 0; outline: 0; background: transparent; font-size: .72rem; }
.admin-resource__categories { display: flex; flex-wrap: wrap; gap: .45rem; margin-bottom: 1rem; }
.admin-resource__categories button { border: 1px solid rgba(23,52,58,.15); padding: .5rem .75rem; background: #ffffff; color: #526d65; font-size: .7rem; cursor: pointer; }
.admin-resource__categories button:hover, .admin-resource__categories button.is-active { border-color: #37675d; background: #37675d; color: #fff; }
.admin-resource__refresh { width: 36px; height: 36px; display: grid; place-items: center; border: 1px solid rgba(23,52,58,.15); background: #ffffff; cursor: pointer; }
.admin-resource__refresh svg { width: 14px; }
.admin-resource__refresh:hover { border-color:#37675d; color:#285147; }
.admin-resource__refresh:focus-visible { outline:2px solid rgba(55,103,93,.35); outline-offset:2px; }
.admin-resource__error { padding: .7rem .85rem; background: #f9e9e7; color: #285147; font-size: .76rem; }
.admin-resource__table-wrap { overflow: auto; background: #ffffff; border: 1px solid rgba(23,52,58,.1); }
.admin-resource__table { width: 100%; min-width: 720px; border-collapse: collapse; font-size: .75rem; }
.admin-resource__table th { padding: .8rem .9rem; background: #eaf2ed; color: #526d65; font-size: .65rem; text-align: left; white-space: nowrap; }
.admin-resource__table td { padding: .85rem .9rem; border-top: 1px solid rgba(12,28,35,.09); vertical-align: middle; }
.admin-resource__table td > span, .admin-resource__table td > small, .resource-title small { display: block; }
.admin-resource__table td > small, .resource-title small { margin-top: .22rem; color: #526d65; font-size: .67rem; }
.resource-product-meta { display:flex; align-items:center; gap:.55rem; white-space:nowrap; }
.resource-product-meta span { color:#17343a; font-weight:700; }
.resource-product-meta small { margin:0; color:#526d65; font-size:.67rem; }
.resource-title { display: flex; align-items: center; gap: .7rem; min-width: 250px; }
.resource-title:hover strong { color:#37675d; }
.resource-title img { width: 50px; height: 42px; object-fit: contain; padding: 2px; background: #eaf2ed; }
.resource-title strong { font-size: .8rem; }
.resource-status { display:inline-flex !important; align-items:center; width:max-content; border:1px solid transparent; border-radius:999px; padding:.35rem .65rem; font-size:.68rem; font-weight:700; line-height:1; }
.resource-status--draft { background: #fff4df; color: #8a6b32; }.resource-status--published { background: #e1efe9; color: #326b57; }.resource-status--archived { background: #e7ece9; color: #526d65; }
.resource-sort { width: 55px; border: 1px solid rgba(23,52,58,.14); padding: .35rem; background: #fff; font-size: .72rem; }
.resource-actions { display:flex; align-items:center; gap:.4rem; white-space:nowrap; }.resource-save, .resource-edit, .resource-publish, .resource-delete { display:inline-flex; align-items:center; justify-content:center; min-height:32px; border:1px solid transparent; border-radius:999px; padding:.42rem .68rem; background:#17343a; color:#fff; font-size:.68rem; line-height:1; cursor:pointer; }.resource-save:hover, .resource-edit:hover, .resource-publish:hover { background:#37675d; color:#fff; }.resource-save:disabled, .resource-publish:disabled { opacity:.5; cursor:wait; }.resource-edit { border-color:rgba(55,103,93,.18); background:#eaf2ed; color:#17343a; }.resource-publish { background:#37675d; }.resource-delete { border-color:rgba(142,45,39,.15); background:#fff; color:#8e2d27; }.resource-delete:hover { background:#f9e9e7; }.resource-save:focus-visible, .resource-edit:focus-visible, .resource-publish:focus-visible, .resource-delete:focus-visible { outline:3px solid rgba(55,103,93,.3); outline-offset:2px; }
.admin-resource__empty { min-height: 260px; display: grid; place-items: center; align-content: center; gap: .45rem; color: #526d65; font-size: .78rem; }.admin-resource__empty svg { width: 28px; color: #37675d; }.admin-resource__empty strong { color: #17343a; font-size: .9rem; }
.admin-product-modal{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;overflow:auto;padding:clamp(.75rem,3vw,2rem);background:rgba(23,52,58,.68)}.admin-product-modal:focus{outline:none}.admin-product-modal__panel{width:min(960px,100%);max-height:calc(100vh - clamp(1.5rem,6vw,4rem));overflow:auto;background:#f3f7f4;box-shadow:0 24px 70px rgba(23,52,58,.28)}
@media (max-width: 680px) { .admin-resource__head { align-items: start; flex-direction: column; gap: 1rem; } .admin-resource__content { width: min(100% - 1.5rem, 1400px); padding-top: 1.25rem; } .admin-resource__toolbar { flex-wrap: wrap; } .admin-resource__toolbar select { margin-left: 0; } .admin-resource__toolbar form { flex: 1 1 160px; } .admin-resource__toolbar input { width: 100%; } }
@media (max-width:680px){.admin-product-modal{place-items:stretch;padding:0}.admin-product-modal__panel{width:100%;max-height:100vh}}
</style>
