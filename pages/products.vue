<script setup lang="ts">
import { products as staticProducts } from '~/data/site'
import { defaultProductCatalogueContent, type ProductCatalogueContent } from '~/data/site-content'

const { language, t } = useSiteLanguage()
useSeoMeta({
  title: () => language.value === 'en' ? 'Products | Hongcai Wanfu' : '产品中心｜红财万富',
  description: () => language.value === 'en' ? 'Hongcai Wanfu sanitaryware, bathroom hardware and installation parts sourcing catalogue.' : '红财万富卫浴产品、卫浴五金与安装及配件采购目录。'
})

type CatalogueSectionKey = 'all' | 'sanitaryware' | 'hardware' | 'installation'
type ProductSectionKey = Exclude<CatalogueSectionKey, 'all'>
type ProductViewItem = (typeof staticProducts)[number] & { id?: string; nameEn?: string; categoryEn?: string; materialEn?: string; model?: string }

const { data: publishedProducts } = await useFetch<ProductViewItem[]>('/api/content/products', { default: () => [] })
const products = computed<ProductViewItem[]>(() => {
  // The publication state is the source of truth. Product names and models
  // may legitimately contain digits such as 12312, so do not hide records
  // with content heuristics that make the frontend count differ from admin.
  return publishedProducts.value?.length ? publishedProducts.value : staticProducts
})
const { data: catalogueContent } = await useFetch<ProductCatalogueContent>('/api/content/product-catalogue', { default: () => defaultProductCatalogueContent })

const catalogueSections: Array<{ key: ProductSectionKey; label: string; icon: string; categories: string[] }> = [
  { key: 'sanitaryware', label: '卫浴产品', icon: 'lucide:bath', categories: ['面盆龙头', '花洒套装', '坐便器', '浴室柜', '厨房龙头'] },
  { key: 'hardware', label: '卫浴五金', icon: 'lucide:settings-2', categories: ['卫浴挂件', '阀门配件'] },
  { key: 'installation', label: '安装及配件', icon: 'lucide:wrench', categories: ['排水配件', '安装配件'] }
]
const filterCategories = computed(() => catalogueSections.flatMap(section => section.categories))
const materialOptions = ['全部材质', '不锈钢', '铜', '铝合金', '陶瓷', '待确认']

const route = useRoute()
const activeSection = ref<CatalogueSectionKey>(sectionFromQuery(route.query.group))
const activeCategory = ref(typeof route.query.category === 'string' && route.query.category ? route.query.category : '全部产品')
const activeModel = ref(typeof route.query.model === 'string' ? route.query.model : '')
const material = ref('全部材质')
const currentPage = ref(1)
const productsPerPage = 8
const expandedSections = reactive<Record<ProductSectionKey, boolean>>({ sanitaryware: true, hardware: true, installation: true })
const inquirySubmitted = ref(false)
const inquiryPromptVisible = ref(false)
const inquiryFieldErrors = reactive({ name: '', company: '', phone: '', product: '' })
const inquiry = reactive({ name: '', company: '', phone: '', product: '' })

function sectionFromQuery(value: unknown): CatalogueSectionKey {
  const group = Array.isArray(value) ? value[0] : value
  if (group === '卫浴五金') return 'hardware'
  if (group === '安装及配件') return 'installation'
  if (group === '卫浴产品') return 'sanitaryware'
  return 'all'
}

function sectionForProduct(item: ProductViewItem): ProductSectionKey {
  if (item.group === '卫浴产品') return 'sanitaryware'
  if (item.category === '排水配件' || item.category === '安装配件') return 'installation'
  return 'hardware'
}

function itemsForSection(key: CatalogueSectionKey) {
  return key === 'all' ? products.value : products.value.filter(item => sectionForProduct(item) === key)
}

function countForSection(key: CatalogueSectionKey) {
  return itemsForSection(key).length
}

const availableProducts = computed(() => {
  const source = activeSection.value === 'all' ? products.value : itemsForSection(activeSection.value)
  return source.filter(item => (activeCategory.value === '全部产品' || item.category === activeCategory.value) && (!activeModel.value || item.model === activeModel.value))
})
const filteredProducts = computed(() => availableProducts.value.filter(item => material.value === '全部材质' || item.material === material.value))
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / productsPerPage))
const pagedProducts = computed(() => {
  const start = (currentPage.value - 1) * productsPerPage
  return filteredProducts.value.slice(start, start + productsPerPage)
})
const productOptions = computed(() => products.value.map(item => item.model || t('示例款 / 待补型号')).filter(Boolean))

function productText(item: ProductViewItem, key: 'name' | 'category' | 'material') {
  if (language.value !== 'en') return item[key]
  const englishKey = `${key}En` as 'nameEn' | 'categoryEn' | 'materialEn'
  return item[englishKey] || t(item[key])
}

watch([activeSection, activeCategory, material], () => {
  currentPage.value = 1
})

watch(() => route.query, query => {
  activeSection.value = sectionFromQuery(query.group)
  activeCategory.value = typeof query.category === 'string' && query.category ? query.category : '全部产品'
  activeModel.value = typeof query.model === 'string' ? query.model : ''
  material.value = '全部材质'
}, { deep: true })

function selectSection(key: CatalogueSectionKey) {
  activeSection.value = key
  activeCategory.value = '全部产品'
  activeModel.value = ''
  material.value = '全部材质'
}

function selectCategory(category: string, key: CatalogueSectionKey) {
  activeSection.value = key
  activeCategory.value = category
  if (key !== 'all') expandedSections[key] = true
}

function toggleSection(key: ProductSectionKey) {
  expandedSections[key] = !expandedSections[key]
}

function selectQuickCategory(category: string) {
  if (category === '全部产品') {
    activeSection.value = 'all'
    activeCategory.value = '全部产品'
    activeModel.value = ''
    return
  }
  const matchedSection = catalogueSections.find(section => section.categories.includes(category))
  if (matchedSection) {
    activeSection.value = matchedSection.key
    expandedSections[matchedSection.key] = true
  }
  activeCategory.value = category
  activeModel.value = ''
}

async function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  currentPage.value = page
  await nextTick()
  if (import.meta.client) document.querySelector('.catalogue__results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function startInquiry(item?: ProductViewItem) {
  if (item) inquiry.product = item.model || t('示例款 / 待补型号')
  inquiryPromptVisible.value = true
  inquirySubmitted.value = false
  inquiryFieldErrors.name = ''
  inquiryFieldErrors.company = ''
  inquiryFieldErrors.phone = ''
  inquiryFieldErrors.product = ''
  if (import.meta.client) document.getElementById('product-inquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  void nextTick(() => document.getElementById('inquiry-name')?.focus())
}

function clearInquiryError(field: 'name' | 'company' | 'phone' | 'product') {
  inquiryFieldErrors[field] = ''
}

function validateInquiry() {
  const name = inquiry.name.trim()
  const company = inquiry.company.trim()
  const phone = inquiry.phone.trim()

  inquiryFieldErrors.name = !name
    ? t('请填写姓名。')
    : name.length < 2 || name.length > 30 || !/^[A-Za-z\u4e00-\u9fff·' .-]+$/u.test(name)
      ? t('姓名需填写 2–30 个中文或英文字符。')
      : ''
  inquiryFieldErrors.company = !company
    ? t('请填写公司名称。')
    : company.length < 2 || company.length > 80
      ? t('公司名称需填写 2–80 个字符。')
      : ''
  const phoneDigits = phone.replace(/\D/g, '')
  inquiryFieldErrors.phone = !phone
    ? t('请填写联系电话。')
    : !/^[\d\s()+-]+$/.test(phone) || phoneDigits.length < 7 || phoneDigits.length > 15
      ? t('联系电话需填写 7–15 位数字，可包含 +、空格、括号或短横线。')
      : ''
  inquiryFieldErrors.product = inquiry.product.trim() ? '' : t('请选择或填写感兴趣的产品。')

  return !Object.values(inquiryFieldErrors).some(Boolean)
}

function submitInquiry() {
  if (import.meta.client) {
    const existing = JSON.parse(localStorage.getItem('hongcai_inquiries') || '[]')
    existing.unshift({ ...inquiry, source: 'product-centre', createdAt: new Date().toISOString(), status: 'new' })
    localStorage.setItem('hongcai_inquiries', JSON.stringify(existing))
  }
  inquirySubmitted.value = true
  inquiryPromptVisible.value = false
}

function handleInquirySubmit() {
  if (!validateInquiry()) return
  submitInquiry()
}
</script>

<template>
  <div class="page page-products page-products-centre">
    <PageHero
      class="page-hero--inner"
      title="产品中心"
      subtitle="根据采购需求找到合适的商品"
      image="/assets/images/hero-products-water-ripple.webp"
      split-text
    />

    <section class="catalogue catalogue--three-col page-wrap">
      <aside class="catalogue__filters catalogue__filters--tree">
        <button class="catalogue__all" :class="{ 'is-active': activeSection === 'all' }" type="button" @click="selectSection('all')">
          <span>{{ t('所有产品') }}</span><b>{{ countForSection('all') }}</b>
        </button>
        <section v-for="section in catalogueSections" :key="section.key" class="catalogue__group">
          <div class="catalogue__group-row" :class="{ 'is-expanded': expandedSections[section.key] }">
            <button
              class="catalogue__group-button"
              :class="{ 'is-active': activeSection === section.key && activeCategory === '全部产品' }"
              type="button"
              @click="selectSection(section.key)"
            >
              <Icon :name="section.icon" class="catalogue__group-icon" />
              <span>{{ t(section.label) }}</span><b>{{ countForSection(section.key) }}</b>
            </button>
            <button
              class="catalogue__group-toggle"
              type="button"
              :aria-label="language === 'en' ? `${expandedSections[section.key] ? 'Collapse' : 'Expand'} ${t(section.label)}` : `${expandedSections[section.key] ? '收起' : '展开'}${t(section.label)}`"
              :aria-expanded="expandedSections[section.key]"
              :aria-controls="`catalogue-group-${section.key}`"
              @click="toggleSection(section.key)"
            >
              <Icon name="lucide:chevron-right" class="catalogue__group-caret" />
            </button>
          </div>
          <div :id="`catalogue-group-${section.key}`" class="catalogue__group-children" :class="{ 'is-open': expandedSections[section.key] }" :aria-hidden="!expandedSections[section.key]">
            <div class="catalogue__group-children-inner">
              <button v-for="category in section.categories" :key="category" :class="{ 'is-active': activeSection === section.key && activeCategory === category }" type="button" @click="selectCategory(category, section.key)">
                <span>{{ t(category) }}</span><b>{{ products.filter(item => sectionForProduct(item) === section.key && item.category === category).length }}</b>
              </button>
            </div>
          </div>
        </section>
      </aside>

      <div class="catalogue__main">
        <div class="catalogue-filter-bar" :aria-label="t('产品筛选条件')">
          <div class="catalogue-filter-bar__row">
            <strong>{{ t('产品类别') }}：</strong>
            <div class="catalogue-filter-bar__options">
              <button type="button" :class="{ 'is-active': activeCategory === '全部产品' }" @click="selectQuickCategory('全部产品')">{{ t('全部') }}</button>
              <button v-for="category in filterCategories" :key="category" type="button" :class="{ 'is-active': activeCategory === category }" @click="selectQuickCategory(category)">{{ t(category) }}</button>
            </div>
          </div>
          <div class="catalogue-filter-bar__row">
            <strong>{{ t('材质') }}：</strong>
            <div class="catalogue-filter-bar__options">
              <button v-for="item in materialOptions" :key="item" type="button" :class="{ 'is-active': material === item }" @click="material = item">{{ t(item === '全部材质' ? '全部' : item) }}</button>
            </div>
          </div>
          <span class="catalogue-filter-bar__count">{{ language === 'en' ? `${filteredProducts.length} products` : `共 ${filteredProducts.length} 个产品` }}</span>
        </div>

        <div class="catalogue__results">
          <div class="product-list product-list--centre">
            <article v-for="item in pagedProducts" :key="item.id || item.model || item.name" class="product-tile">
              <div class="product-tile__image"><img :src="item.image" :alt="item.model || t('产品图片')"></div>
              <div class="product-tile__body">
                <p class="product-tile__model">{{ item.model || t('示例款 / 待补型号') }}</p>
                <dl><div><dt>{{ t('材质') }}</dt><dd>{{ productText(item, 'material') }}</dd></div></dl>
                <button type="button" @click="startInquiry(item)"><Icon name="lucide:mail" />{{ t('询价') }}</button>
              </div>
            </article>
          </div>
          <div v-if="!filteredProducts.length" class="empty-state">{{ t('当前筛选暂无产品，请更换分类或材质。') }}</div>
          <nav v-if="totalPages > 1" class="catalogue-pagination" :aria-label="language === 'en' ? 'Product pagination' : '产品分页'">
            <button class="catalogue-pagination__arrow" type="button" :disabled="currentPage === 1" :aria-label="language === 'en' ? 'Previous page' : '上一页'" @click="goToPage(currentPage - 1)">
              <Icon name="lucide:chevron-left" />
            </button>
            <button v-for="page in totalPages" :key="page" type="button" :class="{ 'is-active': currentPage === page }" :aria-current="currentPage === page ? 'page' : undefined" @click="goToPage(page)">{{ page }}</button>
            <button class="catalogue-pagination__arrow" type="button" :disabled="currentPage === totalPages" :aria-label="language === 'en' ? 'Next page' : '下一页'" @click="goToPage(currentPage + 1)">
              <Icon name="lucide:chevron-right" />
            </button>
          </nav>
        </div>
      </div>

      <aside class="catalogue__aside" :class="{ 'has-pagination': totalPages > 1 }">
        <section class="catalogue-brochure">
          <div class="catalogue-brochure__cover"><img src="/assets/images/logo-transparent.png" width="702" height="180" :alt="t('红财万富 HONGCAI WANFU')"><span>PDF / CATALOGUE</span></div>
          <div><span class="catalogue-brochure__eyebrow">PRODUCT CATALOGUE</span><h2>{{ language === 'en' ? catalogueContent.titleEn : catalogueContent.titleZh }}</h2><a v-if="catalogueContent.fileUrl" class="catalogue-brochure__download" :href="catalogueContent.fileUrl" download="产品电子图册.pdf"><Icon name="lucide:download" />{{ t('下载图册（PDF）') }}</a><span v-else class="catalogue-brochure__pending"><Icon name="lucide:clock-3" />{{ t('图册待上传') }}</span></div>
        </section>
        <section id="product-inquiry" class="quick-inquiry">
          <div class="quick-inquiry__head"><Icon name="lucide:message-square-text" /><div><span>INQUIRY</span><h2>{{ t('快速询价') }}</h2></div></div>
          <p>{{ t('提交需求后，我们会根据产品方向与联系方式进一步沟通。') }}</p>
          <p v-if="inquiryPromptVisible" class="quick-inquiry__prompt" role="status"><Icon name="lucide:info" />{{ t('请先填写姓名、公司和联系电话，再提交询价。') }}</p>
          <p v-if="Object.values(inquiryFieldErrors).some(Boolean)" class="quick-inquiry__error" role="alert"><Icon name="lucide:triangle-alert" />{{ t('请按提示修改表单信息后再提交。') }}</p>
          <form novalidate @submit.prevent="handleInquirySubmit">
            <label for="inquiry-name">{{ t('姓名') }} *<input id="inquiry-name" name="name" v-model="inquiry.name" required minlength="2" maxlength="30" autocomplete="name" :aria-invalid="Boolean(inquiryFieldErrors.name)" :placeholder="t('请输入姓名')" @input="clearInquiryError('name')"><small class="quick-inquiry__hint">{{ t('姓名需填写 2–30 个中文或英文字符。') }}</small><small v-if="inquiryFieldErrors.name" class="quick-inquiry__field-error">{{ inquiryFieldErrors.name }}</small></label>
            <label for="inquiry-company">{{ t('公司') }} *<input id="inquiry-company" name="company" v-model="inquiry.company" required minlength="2" maxlength="80" autocomplete="organization" :aria-invalid="Boolean(inquiryFieldErrors.company)" :placeholder="t('请输入公司名称')" @input="clearInquiryError('company')"><small class="quick-inquiry__hint">{{ t('公司名称需填写 2–80 个字符。') }}</small><small v-if="inquiryFieldErrors.company" class="quick-inquiry__field-error">{{ inquiryFieldErrors.company }}</small></label>
            <label for="inquiry-phone">{{ t('联系电话') }} *<input id="inquiry-phone" name="phone" v-model="inquiry.phone" required maxlength="20" inputmode="tel" autocomplete="tel" :aria-invalid="Boolean(inquiryFieldErrors.phone)" :placeholder="t('请输入联系电话')" @input="clearInquiryError('phone')"><small class="quick-inquiry__hint">{{ t('联系电话需填写 7–15 位数字，可包含 +、空格、括号或短横线。') }}</small><small v-if="inquiryFieldErrors.phone" class="quick-inquiry__field-error">{{ inquiryFieldErrors.phone }}</small></label>
            <label for="inquiry-product">{{ t('感兴趣的产品') }} *<input id="inquiry-product" name="product" v-model="inquiry.product" list="inquiry-products" required :aria-invalid="Boolean(inquiryFieldErrors.product)" :placeholder="t('搜索或选择产品')" @input="clearInquiryError('product')"><small v-if="inquiryFieldErrors.product" class="quick-inquiry__field-error">{{ inquiryFieldErrors.product }}</small></label>
            <datalist id="inquiry-products"><option v-for="option in productOptions" :key="option" :value="option"></option></datalist>
            <button type="submit"><Icon name="lucide:send" />{{ t('提交询价') }}</button>
            <small v-if="inquirySubmitted" class="quick-inquiry__success">{{ t('询价已提交，我们会尽快与您联系。') }}</small>
          </form>
          <section class="catalogue-service-points" :aria-label="t('服务支持')">
            <div>
              <Icon name="lucide:users-round" />
              <strong>{{ t('专业团队') }}</strong>
              <span>{{ t('一对一服务') }}</span>
            </div>
            <div>
              <Icon name="lucide:timer" />
              <strong>{{ t('快速响应') }}</strong>
              <span>{{ t('24小时内回复') }}</span>
            </div>
            <div>
              <Icon name="lucide:clipboard-check" />
              <strong>{{ t('项目支持') }}</strong>
              <span>{{ t('提供定制方案') }}</span>
            </div>
          </section>
        </section>
      </aside>
    </section>
  </div>
</template>
