<script setup lang="ts">
type HomeProduct = {
  id: string
  nameZh: string
  nameEn: string
  model: string
  materialZh: string
  categoryZh: string
  image: string
}

const products = ref<HomeProduct[]>([])
const selectedIds = ref<string[]>([])
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const selectedProducts = computed(() => selectedIds.value
  .map(id => products.value.find(product => product.id === id))
  .filter(Boolean) as HomeProduct[])

const availableProducts = computed(() => products.value)

onMounted(load)

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await $fetch<{ productIds: string[]; products: HomeProduct[] }>('/api/admin/home-products')
    products.value = result.products || []
    const savedIds = (result.productIds || []).filter(id => products.value.some(product => product.id === id))
    selectedIds.value = savedIds.length ? savedIds : products.value.slice(0, 6).map(product => product.id)
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '无法读取首页推荐产品。'
  } finally {
    loading.value = false
  }
}

function toggleProduct(id: string) {
  errorMessage.value = ''
  successMessage.value = ''
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter(item => item !== id)
    return
  }
  if (selectedIds.value.length >= 8) {
    errorMessage.value = '首页推荐产品最多选择 8 项。'
    return
  }
  selectedIds.value = [...selectedIds.value, id]
}

function moveProduct(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= selectedIds.value.length) return
  const next = [...selectedIds.value]
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item)
  selectedIds.value = next
}

async function save() {
  errorMessage.value = ''
  successMessage.value = ''
  saving.value = true
  try {
    await $fetch('/api/admin/home-products', { method: 'PATCH', body: { productIds: selectedIds.value } })
    successMessage.value = '首页推荐产品已保存，前台轮播将按当前顺序展示。'
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '保存推荐产品失败，请重试。'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section id="home-product-carousel" class="admin-home-products">
    <header class="admin-home-products__head">
      <div>
        <p>PRODUCT CAROUSEL</p>
        <h2>首页推荐产品轮播</h2>
        <span>选择并排序首页“近期推荐产品”中的产品，前台会按当前顺序自动旋转展示。</span>
      </div>
      <strong>{{ selectedIds.length }} / 8 项</strong>
    </header>

    <p v-if="errorMessage" class="admin-home-products__message admin-home-products__message--error" role="alert">{{ errorMessage }}</p>
    <p v-if="successMessage" class="admin-home-products__message admin-home-products__message--success" role="status">{{ successMessage }}</p>

    <div v-if="loading" class="admin-home-products__empty">正在读取产品…</div>
    <template v-else>
      <div class="admin-home-products__selected">
        <div class="admin-home-products__section-title">
          <div><h3>当前轮播顺序</h3><span>使用上下箭头调整旋转顺序。</span></div>
          <button type="button" :disabled="saving" @click="save">{{ saving ? '保存中…' : '保存选择' }} <Icon name="lucide:save" /></button>
        </div>
        <div v-if="!selectedProducts.length" class="admin-home-products__empty admin-home-products__empty--small">尚未选择产品；有已发布产品时，前台会按发布顺序显示。</div>
        <ol v-else class="admin-home-products__order">
          <li v-for="(product, index) in selectedProducts" :key="product.id">
            <span class="admin-home-products__number">{{ String(index + 1).padStart(2, '0') }}</span>
            <img :src="product.image" :alt="product.nameZh" width="78" height="56" loading="lazy">
            <div><strong>{{ product.nameZh }}</strong><span>{{ product.model || '待补型号' }} · {{ product.categoryZh || '未分类' }}</span></div>
            <div class="admin-home-products__move">
              <button type="button" :disabled="index === 0" :aria-label="`将${product.nameZh}上移`" @click="moveProduct(index, -1)"><Icon name="lucide:arrow-up" /></button>
              <button type="button" :disabled="index === selectedProducts.length - 1" :aria-label="`将${product.nameZh}下移`" @click="moveProduct(index, 1)"><Icon name="lucide:arrow-down" /></button>
            </div>
          </li>
        </ol>
      </div>

      <div class="admin-home-products__library">
        <div class="admin-home-products__section-title"><div><h3>可选产品</h3><span>点击产品卡片加入或移出首页轮播，最多选择 8 项。</span></div></div>
        <div v-if="!availableProducts.length" class="admin-home-products__empty admin-home-products__empty--small">暂无已发布产品，请先在产品中心发布内容。</div>
        <div v-else class="admin-home-products__grid">
          <label v-for="product in availableProducts" :key="product.id" class="admin-home-products__card" :class="{ 'is-selected': selectedIds.includes(product.id) }">
            <input type="checkbox" :checked="selectedIds.includes(product.id)" @change="toggleProduct(product.id)">
            <img :src="product.image" :alt="product.nameZh" width="180" height="120" loading="lazy">
            <span><strong>{{ product.nameZh }}</strong><small>{{ product.model || '待补型号' }}</small></span>
            <Icon :name="selectedIds.includes(product.id) ? 'lucide:check-circle-2' : 'lucide:plus-circle'" />
          </label>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.admin-home-products { margin-top: 1.15rem; border: 1px solid rgba(23,52,58,.1); background: #fff; }
.admin-home-products__head { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; padding:1.15rem; border-bottom:1px solid rgba(23,52,58,.1); }
.admin-home-products__head p { margin:0 0 .3rem; color:#37675d; font-size:.6rem; font-weight:800; letter-spacing:.14em; }
.admin-home-products__head h2 { margin:0; color:#17343a; font-size:1.12rem; }
.admin-home-products__head span { display:block; margin-top:.35rem; color:#526d65; font-size:.72rem; line-height:1.6; }
.admin-home-products__head > strong { flex:0 0 auto; padding:.4rem .6rem; background:#e5f0eb; color:#326b57; font-size:.7rem; }
.admin-home-products__message { margin:.9rem 1.15rem 0; padding:.65rem .75rem; font-size:.72rem; }
.admin-home-products__message--error { background:#f8e5e2; color:#8e2d27; }
.admin-home-products__message--success { background:#e1efe9; color:#326b57; }
.admin-home-products__selected, .admin-home-products__library { padding:1.15rem; }
.admin-home-products__library { border-top:1px solid rgba(23,52,58,.1); background:#f8fbf9; }
.admin-home-products__section-title { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; margin-bottom:.8rem; }
.admin-home-products__section-title h3 { margin:0; color:#17343a; font-size:.9rem; }
.admin-home-products__section-title span { display:block; margin-top:.28rem; color:#526d65; font-size:.7rem; }
.admin-home-products__section-title button { display:inline-flex; align-items:center; gap:.35rem; border:1px solid #37675d; padding:.55rem .72rem; background:#37675d; color:#fff; font:inherit; font-size:.7rem; font-weight:800; cursor:pointer; }
.admin-home-products__section-title button:hover { background:#285147; }
.admin-home-products__section-title button:disabled { opacity:.6; cursor:wait; }
.admin-home-products__section-title button svg { width:14px; }
.admin-home-products__order { display:grid; gap:.45rem; margin:0; padding:0; list-style:none; }
.admin-home-products__order li { display:grid; grid-template-columns:2rem 78px minmax(0,1fr) auto; align-items:center; gap:.75rem; padding:.55rem .65rem; border:1px solid rgba(23,52,58,.1); background:#f8fbf9; }
.admin-home-products__number { color:#37675d; font-size:.72rem; font-weight:800; }
.admin-home-products__order img { width:78px; height:56px; object-fit:contain; background:#eaf2ed; }
.admin-home-products__order li > div:not(.admin-home-products__move) { display:grid; gap:.2rem; min-width:0; }
.admin-home-products__order strong { overflow:hidden; color:#17343a; font-size:.76rem; text-overflow:ellipsis; white-space:nowrap; }
.admin-home-products__order li > div span { overflow:hidden; color:#526d65; font-size:.65rem; text-overflow:ellipsis; white-space:nowrap; }
.admin-home-products__move { display:flex; gap:.25rem; }
.admin-home-products__move button { display:grid; place-items:center; width:30px; height:30px; border:1px solid rgba(23,52,58,.14); background:#fff; color:#285147; cursor:pointer; }
.admin-home-products__move button:hover:not(:disabled) { border-color:#37675d; background:#e5f0eb; }
.admin-home-products__move button:disabled { opacity:.35; cursor:not-allowed; }
.admin-home-products__move svg { width:14px; }
.admin-home-products__grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:.65rem; }
.admin-home-products__card { position:relative; display:grid; grid-template-rows:110px auto; gap:.55rem; min-width:0; border:1px solid rgba(23,52,58,.1); padding:.55rem; background:#fff; cursor:pointer; transition:border-color .2s ease, box-shadow .2s ease, transform .2s ease; }
.admin-home-products__card:hover { border-color:#9bb9aa; transform:translateY(-2px); }
.admin-home-products__card.is-selected { border-color:#37675d; box-shadow:0 0 0 2px rgba(55,103,93,.12); }
.admin-home-products__card input { position:absolute; width:1px; height:1px; opacity:0; }
.admin-home-products__card input:focus-visible + img { outline:2px solid #37675d; outline-offset:2px; }
.admin-home-products__card img { width:100%; height:110px; object-fit:contain; background:#eaf2ed; }
.admin-home-products__card > span { display:grid; gap:.2rem; min-width:0; }
.admin-home-products__card strong { overflow:hidden; color:#17343a; font-size:.75rem; text-overflow:ellipsis; white-space:nowrap; }
.admin-home-products__card small { color:#526d65; font-size:.64rem; }
.admin-home-products__card > svg { position:absolute; top:.75rem; right:.75rem; width:18px; height:18px; color:#37675d; background:#fff; border-radius:50%; }
.admin-home-products__empty { min-height:180px; display:grid; place-items:center; color:#526d65; font-size:.78rem; }
.admin-home-products__empty--small { min-height:80px; border:1px dashed rgba(23,52,58,.15); }
@media (max-width:680px) {
  .admin-home-products__head, .admin-home-products__section-title { flex-direction:column; }
  .admin-home-products__head > strong { align-self:flex-start; }
  .admin-home-products__section-title button { align-self:flex-start; }
  .admin-home-products__order li { grid-template-columns:1.7rem 60px minmax(0,1fr) auto; gap:.5rem; }
  .admin-home-products__order img { width:60px; height:48px; }
  .admin-home-products__move { flex-direction:column; }
  .admin-home-products__grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
</style>
