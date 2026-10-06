<script setup lang="ts">
import { NEWS_CATEGORIES, type NewsCategory } from '~/data/news'

type Resource = 'products' | 'articles' | 'cases' | 'home'
const props = defineProps<{ resource: Resource; id?: string; embedded?: boolean; initialProductCategory?: string }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const route = useRoute()
const isNew = computed(() => !props.id)
const labels: Record<Resource, string> = { products: '产品', articles: '新闻', cases: '案例', home: '首页轮播' }
const title = computed(() => `${isNew.value ? '新建' : '编辑'}${labels[props.resource]}`)
const loading = ref(!isNew.value)
const saving = ref(false)
const uploading = ref(false)
const errorMessage = ref('')
const homeImageWarning = ref('')
const categories = ref<any[]>([])
const { translating, captureTranslationBaseline, translateChangedFields } = useAdminAutoTranslation()
const form = reactive<Record<string, any>>({ nameZh:'', nameEn:'', titleZh:'', titleEn:'', slug:'', categoryId:'', model:'待补型号', materialZh:'', materialEn:'', finishZh:'', finishEn:'', summaryZh:'', summaryEn:'', contentZh:'', contentEn:'', coverImage:'/assets/images/hero-sanitaryware.webp', publishedAt:new Date().toISOString().slice(0, 10), projectTypeZh:'', projectTypeEn:'', locationZh:'', locationEn:'', suppliedProductsZh:'', suppliedProductsEn:'', categoryZh:'', categoryEn:'', titleLeadZh:'', titleLeadEn:'', titleEmphasisZh:'', titleEmphasisEn:'', image:'/assets/images/hero-sanitaryware.webp', primaryLabelZh:'查看产品系列', primaryLabelEn:'Explore products', primaryTo:'/products', secondaryLabelZh:'提交采购需求', secondaryLabelEn:'Send sourcing needs', status:'DRAFT', sortOrder:0 })
if (props.resource === 'products' && !props.id) { form.coverImage = ''; form.model = '' }
if (props.resource === 'articles' && !props.id) { form.coverImage = ''; form.status = 'PUBLISHED' }

const requestedArticleCategory = computed<NewsCategory>(() => {
  const value = Array.isArray(route.query.category) ? route.query.category[0] : route.query.category
  return NEWS_CATEGORIES.includes(value as NewsCategory) ? value as NewsCategory : NEWS_CATEGORIES[0]
})
const requestedProductCategory = computed(() => {
  if (props.initialProductCategory) return props.initialProductCategory
  const value = Array.isArray(route.query.category) ? route.query.category[0] : route.query.category
  return String(value || '')
})

onMounted(async () => {
  try {
    const auth = await $fetch<{ authenticated: boolean }>('/api/admin/auth/status')
    if (!auth.authenticated) return navigateTo('/admin/login', { replace: true })
    if (props.resource !== 'home') categories.value = await $fetch<any[]>('/api/admin/categories', { query: props.resource === 'articles' ? { scope: 'articles' } : undefined })
    if (props.id) {
      const editorEndpoint: string = `/api/admin/${props.resource}/${props.id}`
      Object.assign(form, await $fetch<any>(editorEndpoint))
      if (props.resource === 'articles' && !form.publishedAt) form.publishedAt = new Date().toISOString().slice(0, 10)
    }
    if (props.resource === 'articles' && !props.id) {
      form.categoryId = categories.value.find(item => item.nameZh === requestedArticleCategory.value)?.id || ''
    }
    if (props.resource === 'products' && !props.id && requestedProductCategory.value) {
      form.categoryId = categories.value.find(item => item.nameZh === requestedProductCategory.value)?.id || ''
    }
    captureTranslationBaseline(form)
  } catch (error: any) { errorMessage.value = error?.data?.statusMessage || '无法读取编辑内容。' } finally { loading.value = false }
})

const categoryOptions = computed(() => {
  if (props.resource === 'products') return categories.value.filter(item => item.parentId)
  if (props.resource === 'articles') return categories.value.filter(item => NEWS_CATEGORIES.includes(item.nameZh as NewsCategory))
  return categories.value
})
const apiResource = computed(() => props.resource === 'home' ? 'home' : props.resource)
const articleCategoryName = computed<NewsCategory>(() => categories.value.find(item => item.id === form.categoryId)?.nameZh || requestedArticleCategory.value)
const productCategoryRoutes: Record<string, string> = {
  面盆龙头: 'basin-faucets', 花洒套装: 'shower-sets', 坐便器: 'toilets', 浴室柜: 'bathroom-cabinets',
  厨房龙头: 'kitchen-faucets', 卫浴挂件: 'bathroom-accessories', 阀门配件: 'valve-parts',
  排水配件: 'drainage-parts', 安装配件: 'installation-parts'
}
const editorListTarget = computed(() => {
  if (props.resource === 'articles') return { path: '/admin/articles', query: { category: articleCategoryName.value }, hash: '#article-list' }
  if (props.resource === 'products' && requestedProductCategory.value && productCategoryRoutes[requestedProductCategory.value]) {
    return `/admin/products/category/${productCategoryRoutes[requestedProductCategory.value]}`
  }
  return `/admin/${props.resource === 'home' ? 'home' : props.resource}`
})

const homeLimits = {
  titleZh: { min: 12, recommendedMax: 24, max: 30 },
  titleEn: { min: 25, recommendedMax: 60, max: 75 },
  summaryZh: { min: 30, recommendedMax: 65, max: 80 },
  summaryEn: { min: 70, recommendedMax: 150, max: 180 }
}

function charCount(value: unknown) { return String(value || '').trim().length }
function lengthHint(value: unknown, limits: { min: number; recommendedMax: number; max: number }) {
  const count = charCount(value)
  const suffix = count > 0 && count < limits.min ? '，内容可能偏短' : count > limits.recommendedMax ? '，已超过建议长度' : ''
  return `当前 ${count} / ${limits.max}，建议 ${limits.min}–${limits.recommendedMax}${suffix}`
}
function isShort(value: unknown, min: number) { const count = charCount(value); return count > 0 && count < min }

function removeHomeImage() {
  form.image = ''
  homeImageWarning.value = ''
}

function removeProductImage() {
  form.coverImage = ''
}

function removeEditorialImage() {
  form.coverImage = ''
}

function validateHomeContent() {
  const fields = [
    ['中文标题', form.titleZh, homeLimits.titleZh.max],
    ['英文标题', form.titleEn, homeLimits.titleEn.max],
    ['中文摘要', form.summaryZh, homeLimits.summaryZh.max],
    ['英文摘要', form.summaryEn, homeLimits.summaryEn.max]
  ] as const
  const exceeded = fields.find(([, value, max]) => charCount(value) > max)
  return exceeded ? `${exceeded[0]}不能超过 ${exceeded[2]} 个字符。` : ''
}

async function submit() {
  saving.value = true; errorMessage.value = ''
  try {
    if (props.resource === 'products') {
      if (isNew.value) form.status = 'DRAFT'
      // The product centre is identified by model and material; keep the
      // legacy name columns synced internally without asking editors for a name.
      form.nameZh = String(form.model || '').trim()
      form.nameEn = form.nameZh
      form.finishZh = form.finishZh || '—'
      form.summaryZh = form.summaryZh || form.model
      form.summaryEn = form.summaryEn || form.model
    }
    if (props.resource === 'articles') {
      if (!form.categoryId) throw new Error('无法确定新闻分类，请返回栏目后重试。')
      if (isNew.value && !form.slug) form.slug = `news-${Date.now().toString(36)}`
      form.publishedAt = form.publishedAt || new Date().toISOString().slice(0, 10)
      form.status = 'PUBLISHED'
      form.sortOrder = Number.isInteger(Number(form.sortOrder)) ? Number(form.sortOrder) : 0
    }
    await translateChangedFields(form)
    if (props.resource === 'home') {
      const validationMessage = validateHomeContent()
      if (validationMessage) throw new Error(validationMessage)
    }
    const saveEndpoint: string = props.id ? `/api/admin/${apiResource.value}/${props.id}` : `/api/admin/${apiResource.value}`
    await $fetch<any>(saveEndpoint, { method: props.id ? 'PATCH' : 'POST', body: form })
    if (props.embedded) {
      emit('saved')
      return
    }
    await navigateTo(editorListTarget.value)
  } catch (error: any) { errorMessage.value = error?.data?.statusMessage || error?.message || '保存失败，请检查必填项。' } finally { saving.value = false }
}

async function uploadProductImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploading.value = true
  errorMessage.value = ''
  try {
    const preparedFile = await trimImageWhitespace(file)
    const body = new FormData()
    body.append('file', preparedFile)
    const result = await $fetch<{ url: string }>('/api/admin/media/upload', { method: 'POST', body })
    form.coverImage = result.url
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '图片上传失败，请重试。'
  } finally {
    uploading.value = false
    input.value = ''
  }
}

async function uploadHomeImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploading.value = true
  errorMessage.value = ''
  homeImageWarning.value = ''
  try {
    const bitmap = await createImageBitmap(file)
    const ratio = bitmap.width / bitmap.height
    const notices: string[] = []
    if (bitmap.width < 1600) notices.push(`当前宽度 ${bitmap.width}px，建议至少 1600px`)
    if (Math.abs(ratio - (16 / 9)) > 0.18) notices.push(`当前比例约 ${ratio.toFixed(2)}:1，建议使用 16:9 横图`)
    bitmap.close()
    homeImageWarning.value = notices.join('；')
    const body = new FormData()
    body.append('file', file)
    body.append('kind', 'home')
    const result = await $fetch<{ url: string }>('/api/admin/media/upload', { method: 'POST', body })
    form.image = result.url
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '图片上传失败，请重试。'
  } finally {
    uploading.value = false
    input.value = ''
  }
}

async function uploadEditorialImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploading.value = true
  errorMessage.value = ''
  try {
    const body = new FormData()
    body.append('file', file)
    body.append('kind', props.resource === 'articles' ? 'articles' : props.resource === 'cases' ? 'cases' : 'about')
    const result = await $fetch<{ url: string }>('/api/admin/media/upload', { method: 'POST', body })
    form.coverImage = result.url
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '图片上传失败，请重试。'
  } finally {
    uploading.value = false
    input.value = ''
  }
}

async function trimImageWhitespace(file: File): Promise<File> {
  if (!import.meta.client || !file.type.startsWith('image/')) return file
  try {
    const bitmap = await createImageBitmap(file)
    const maxSide = 1800
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const source = document.createElement('canvas')
    source.width = width
    source.height = height
    const sourceContext = source.getContext('2d', { willReadFrequently: true })
    if (!sourceContext) return file
    sourceContext.drawImage(bitmap, 0, 0, width, height)
    const pixels = sourceContext.getImageData(0, 0, width, height).data
    let minX = width; let minY = height; let maxX = -1; let maxY = -1
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const index = (y * width + x) * 4
        const alpha = pixels[index + 3]
        const red = pixels[index]; const green = pixels[index + 1]; const blue = pixels[index + 2]
        const isBackground = alpha < 12 || (red > 246 && green > 246 && blue > 246)
        if (isBackground) continue
        minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y)
      }
    }
    bitmap.close()
    if (maxX < 0 || maxY < 0) return file
    const padding = Math.max(6, Math.round(Math.min(width, height) * .035))
    minX = Math.max(0, minX - padding); minY = Math.max(0, minY - padding)
    maxX = Math.min(width - 1, maxX + padding); maxY = Math.min(height - 1, maxY + padding)
    const cropWidth = maxX - minX + 1; const cropHeight = maxY - minY + 1
    if (cropWidth >= width * .96 && cropHeight >= height * .96) return file
    const cropped = document.createElement('canvas')
    cropped.width = cropWidth; cropped.height = cropHeight
    const croppedContext = cropped.getContext('2d')
    if (!croppedContext) return file
    croppedContext.drawImage(source, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)
    const blob = await new Promise<Blob | null>((resolve) => cropped.toBlob(resolve, file.type === 'image/png' ? 'image/png' : 'image/jpeg', .92))
    return blob ? new File([blob], file.name, { type: blob.type }) : file
  } catch {
    return file
  }
}
</script>

<template>
  <div class="admin-editor" :class="{ 'admin-editor--embedded': embedded }">
    <header class="admin-editor__head"><div><button v-if="embedded" class="admin-editor__back" type="button" @click="emit('close')"><Icon name="lucide:x" />关闭窗口</button><NuxtLink v-else class="admin-editor__back" :to="editorListTarget"><Icon name="lucide:arrow-left" />返回列表</NuxtLink><h1>{{ title }}</h1><p>{{ resource === 'articles' ? `当前栏目：${articleCategoryName}。填写中文内容后自动生成英文，保存后直接发布。` : '带 * 的中文字段为必填；保存时自动生成英文，内容仍可保持为草稿。' }}</p></div></header>
    <main v-if="!loading" class="admin-editor__content">
      <p v-if="errorMessage" class="admin-editor__error" role="alert">{{ errorMessage }}</p>
      <form class="admin-editor__form" novalidate @submit.prevent="submit">
        <AdminTranslationNotice :translating="translating" />
        <section v-if="resource === 'products'" class="editor-section">
          <div class="editor-section__intro"><div><h2>产品信息</h2><p>只填写采购人员需要确认的产品型号和材质，保存后默认为草稿。</p></div><span class="editor-section__required">* 必填</span></div>
          <div class="editor-grid editor-grid--product">
            <label>产品型号 *<input v-model="form.model" placeholder="例如：HC-1201" required></label>
            <label>材质 *<input v-model="form.materialZh" placeholder="例如：黄铜" required></label>
            <label>产品分类 *<select v-model="form.categoryId" required><option value="" disabled>选择产品分类</option><option v-for="category in categoryOptions" :key="category.id" :value="category.id">{{ category.nameZh }} / {{ category.nameEn }}</option></select></label>
            <div class="editor-span product-image-card">
              <label v-if="!form.coverImage">产品图片 *<input type="file" accept="image/jpeg,image/png,image/webp" :disabled="uploading" @change="uploadProductImage"><small class="field-help">推荐 1200×1200（1:1 正方形，主体居中）；支持 JPG、PNG、WebP，单张不超过 5MB；上传时会自动去掉四周纯白留白。{{ uploading ? '正在上传…' : '请选择图片。' }}</small></label>
              <figure v-if="form.coverImage" class="product-image-card__preview">
                <button class="home-image-card__remove" type="button" aria-label="删除当前产品图片并重新选择" title="删除并更换图片" @click="removeProductImage"><Icon name="lucide:x" /></button>
                <img class="product-image-preview" :src="form.coverImage" alt="产品图片预览" width="520" height="520" loading="lazy">
                <figcaption>当前产品图片预览；点击右上角叉号可删除并重新选择。</figcaption>
              </figure>
            </div>
          </div>
        </section>
        <section v-else-if="resource === 'articles'" class="editor-section editor-section--article">
          <h2>新闻信息</h2>
          <div class="editor-grid editor-grid--article">
            <div class="editor-span editorial-image-card">
              <label v-if="!form.coverImage">封面图片 *<input name="coverUpload" type="file" accept="image/jpeg,image/png,image/webp" required :disabled="uploading" @change="uploadEditorialImage"><small class="field-help">推荐 1600×900（16:9 横图）；支持 JPG、PNG、WebP，单张不超过 5MB。{{ uploading ? '正在上传…' : '请上传文章封面。' }}</small></label>
              <figure v-else class="editorial-image-card__preview">
                <button class="home-image-card__remove" type="button" aria-label="删除当前新闻封面并重新选择" title="删除并更换图片" @click="removeEditorialImage"><Icon name="lucide:x" /></button>
                <img class="editorial-image-preview" :src="form.coverImage" alt="新闻封面预览" width="520" height="180">
                <figcaption>当前新闻封面预览；点击右上角叉号可删除并重新选择。</figcaption>
              </figure>
            </div>
            <label>中文标题 *<input v-model="form.titleZh" name="titleZh" autocomplete="off" required></label>
            <label>英文标题<input v-model="form.titleEn" name="titleEn" autocomplete="off"></label>
            <label>中文摘要 *<textarea v-model="form.summaryZh" name="summaryZh" autocomplete="off" required rows="4"></textarea></label>
            <label>英文摘要<textarea v-model="form.summaryEn" name="summaryEn" autocomplete="off" rows="4"></textarea></label>
            <label>中文正文 *<textarea v-model="form.contentZh" name="contentZh" autocomplete="off" required rows="12"></textarea></label>
            <label>英文正文<textarea v-model="form.contentEn" name="contentEn" autocomplete="off" rows="12"></textarea></label>
          </div>
        </section>
        <section v-else-if="resource === 'cases'" class="editor-section">
          <h2>案例信息</h2>
          <div class="editor-grid">
            <label>中文标题 *<input v-model="form.titleZh" required></label><label>Slug *<input v-model="form.slug" required></label>
            <label>案例分类 *<select v-model="form.categoryId" required><option value="" disabled>选择分类</option><option v-for="category in categoryOptions" :key="category.id" :value="category.id">{{ category.nameZh }} / {{ category.nameEn }}</option></select></label><label>排序<input v-model.number="form.sortOrder" min="0" type="number"></label>
            <label>中文项目类型 *<input v-model="form.projectTypeZh" required></label><label>中文地点 *<input v-model="form.locationZh" required></label>
            <label class="editor-span">中文供应产品 *<input v-model="form.suppliedProductsZh" required></label>
            <label class="editor-span">封面图片 *<input v-model="form.coverImage" required><input type="file" accept="image/jpeg,image/png,image/webp" :disabled="uploading" @change="uploadEditorialImage"><small class="field-help">推荐 1600×900（16:9 横图）；支持 JPG、PNG、WebP，单张不超过 5MB。{{ uploading ? '正在上传…' : form.coverImage ? '已设置封面，可在上方替换。' : '' }}</small><img v-if="form.coverImage" class="editorial-image-preview" :src="form.coverImage" alt="案例封面预览" width="520" height="180" loading="lazy"></label>
            <label class="editor-span">中文摘要 *<textarea v-model="form.summaryZh" required rows="3"></textarea></label><label class="editor-span">中文正文 *<textarea v-model="form.contentZh" required rows="5"></textarea></label>
            <details class="editor-language-review editor-span"><summary><span>查看或修改英文译文</span><small>选填</small></summary><div class="editor-language-review__fields"><label>英文标题<input v-model="form.titleEn"></label><label>英文项目类型<input v-model="form.projectTypeEn"></label><label>英文地点<input v-model="form.locationEn"></label><label class="editor-span">英文供应产品<input v-model="form.suppliedProductsEn"></label><label class="editor-span">英文摘要<textarea v-model="form.summaryEn" rows="3"></textarea></label><label class="editor-span">英文正文<textarea v-model="form.contentEn" rows="5"></textarea></label></div></details>
          </div>
        </section>
        <section v-else class="editor-section editor-section--home">
          <div class="editor-section__intro"><div><h2>首屏轮播内容</h2><p>中英文内容并排填写；英文留空时会在保存时自动生成。</p></div></div>
          <div class="editor-grid editor-grid--home">
            <label>中文标题 *<textarea v-model="form.titleZh" required rows="2" maxlength="30" placeholder="例如：花洒系统产品系列"></textarea><small class="field-counter" :class="{ 'is-warning': isShort(form.titleZh, homeLimits.titleZh.min) }">{{ lengthHint(form.titleZh, homeLimits.titleZh) }}</small></label>
            <label>英文标题<textarea v-model="form.titleEn" rows="2" maxlength="75" placeholder="English title"></textarea><small class="field-counter">{{ lengthHint(form.titleEn, homeLimits.titleEn) }}</small></label>
            <label>中文摘要 *<textarea v-model="form.summaryZh" required rows="4" maxlength="80" placeholder="说明这一张轮播图展示的产品或采购信息"></textarea><small class="field-counter" :class="{ 'is-warning': isShort(form.summaryZh, homeLimits.summaryZh.min) }">{{ lengthHint(form.summaryZh, homeLimits.summaryZh) }}</small></label>
            <label>英文摘要<textarea v-model="form.summaryEn" rows="4" maxlength="180" placeholder="English summary"></textarea><small class="field-counter">{{ lengthHint(form.summaryEn, homeLimits.summaryEn) }}</small></label>
            <div class="editor-span home-image-card">
              <label v-if="!form.image">背景图片 *<input type="file" accept="image/jpeg,image/png,image/webp" :disabled="uploading" @change="uploadHomeImage"><small class="field-help">推荐 1920×1080（16:9 横图），最小宽度 1600px；支持 JPG、PNG、WebP，单张不超过 5MB。{{ uploading ? '正在上传…' : '请选择图片。' }}</small></label>
              <small v-if="homeImageWarning" class="field-image-warning">{{ homeImageWarning }}。图片已上传，但建议更换以获得更稳定的展示效果。</small>
              <figure v-if="form.image" class="home-image-card__preview">
                <button class="home-image-card__remove" type="button" aria-label="删除当前背景图片并重新选择" title="删除并更换图片" @click="removeHomeImage"><Icon name="lucide:x" /></button>
                <img class="home-image-preview" :src="form.image" alt="首页轮播图片预览" width="720" height="405" loading="lazy">
                <figcaption>当前背景图片预览；点击右上角叉号可删除并重新选择。</figcaption>
              </figure>
            </div>
            <div class="editor-span editor-fixed-copy"><strong>系统固定内容</strong><span>按钮、按钮链接、分类标识和轮播位置不会在这里修改。</span></div>
          </div>
        </section>
        <section v-if="resource === 'cases'" class="editor-section editor-section--publish"><div><h2>发布设置</h2><p>只有状态为“已发布”的内容会显示在前台页面。</p></div><label>状态<select v-model="form.status" name="status"><option value="DRAFT">草稿</option><option value="PUBLISHED">已发布</option><option value="ARCHIVED">已归档</option></select></label></section>
        <div class="editor-actions"><button v-if="embedded" class="editor-actions__cancel" type="button" @click="emit('close')">取消</button><NuxtLink v-else :to="editorListTarget">取消</NuxtLink><button type="submit" :disabled="saving || translating">{{ translating ? '翻译中…' : saving ? '保存中…' : resource === 'products' ? '翻译并保存草稿' : resource === 'articles' ? (isNew ? '翻译并发布' : '翻译并更新') : '翻译并保存' }}</button></div>
      </form>
    </main>
  </div>
</template>

<style scoped>
.admin-editor { min-height: 100vh; background:#f3f7f4; color:#17343a; }.admin-editor__head { padding:2rem clamp(1.25rem,5vw,5rem); background:#17343a; color:#fff; }.admin-editor__back { display:inline-flex; align-items:center; gap:.35rem; border:0;padding:0;margin-bottom:1rem;background:transparent;color:rgba(255,255,255,.72);font:inherit;font-size:.72rem;cursor:pointer}.admin-editor__back:hover { color:#fff; }.admin-editor__back svg { width:14px; }.admin-editor__head h1 { margin:0; font-family:var(--serif); font-size:clamp(1.5rem,4vw,2.2rem); font-weight:600; }.admin-editor__head p { margin:.45rem 0 0; color:rgba(255,255,255,.7); font-size:.76rem; }.admin-editor__content { width:min(1100px,calc(100% - 2.5rem)); margin:auto; padding:2rem 0 4rem; }.admin-editor__error { padding:.7rem .85rem; background:#f9e9e7; color:#285147; font-size:.76rem; }.admin-editor__form { display:grid; gap:1rem; }.editor-section { padding:1.4rem; background:#ffffff; border:1px solid rgba(23,52,58,.1); }.editor-section h2 { margin:0 0 1.2rem; font-size:1rem; }.editor-section__intro { display:flex; align-items:start; justify-content:space-between; gap:1rem; margin-bottom:1.2rem; }.editor-section__intro h2 { margin:0; }.editor-section__intro p { margin:.4rem 0 0; color:#526d65; font-size:.72rem; font-weight:400; }.editor-section__required { color:#285147; font-size:.68rem; font-weight:700; }.editor-section--publish h2 { margin-bottom:.25rem; }.editor-section--publish p { margin:0; color:#526d65; font-size:.72rem; font-weight:400; }.editor-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }.editor-grid label, .editor-section--publish label { display:grid; gap:.35rem; color:#526d65; font-size:.72rem; font-weight:700; }.editor-grid .editor-span { grid-column:1 / -1; }.editor-grid input, .editor-grid textarea, .editor-grid select, .editor-section--publish select { width:100%; border:1px solid rgba(23,52,58,.16); padding:.7rem .75rem; background:#fff; color:#17343a; font-size:.78rem; font-weight:400; }.editor-grid input[type=file] { padding:.55rem .65rem; }.editor-grid textarea { resize:vertical; line-height:1.6; }.editor-grid input:focus-visible, .editor-grid textarea:focus-visible, .editor-grid select:focus-visible, .editor-section--publish select:focus-visible { outline:2px solid rgba(55,103,93,.25); border-color:#37675d; }.field-help { color:#526d65; font-size:.68rem;font-weight:400; }.field-counter { color:#526d65; font-size:.67rem; font-weight:400; text-align:right; }.field-counter.is-warning, .field-image-warning { color:#8a6b32; }.field-image-warning { padding:.55rem .65rem; background:#fff4df; font-size:.68rem; font-weight:600; line-height:1.6; }.product-image-preview { width:180px; height:120px; margin-top:.25rem; object-fit:cover; border:1px solid rgba(23,52,58,.12); background:#f3f7f4; }.editor-section--publish { display:flex; align-items:center; justify-content:space-between; gap:1.2rem; }.editor-section--publish label { width:180px; }.editor-actions { display:flex; justify-content:flex-end; gap:.7rem; }.editor-actions a, .editor-actions button { display:inline-flex; align-items:center; justify-content:center; min-height:40px; border:1px solid rgba(23,52,58,.18); padding:.6rem 1rem; background:#ffffff; color:#17343a; font-size:.74rem; font-weight:800; }.editor-actions button { border-color:#37675d; background:#37675d; color:#fff; cursor:pointer; }.editor-actions button:hover { background:#285147; }.editor-actions button.editor-actions__cancel{border-color:rgba(23,52,58,.18);background:#ffffff;color:#17343a}.editor-actions button.editor-actions__cancel:hover{border-color:#37675d;color:#285147}.editor-actions button:disabled { opacity:.55; cursor:wait; }.editor-actions a:focus-visible, .editor-actions button:focus-visible, .admin-editor__back:focus-visible { outline:2px solid rgba(55,103,93,.35); outline-offset:2px; }.admin-editor--embedded{min-height:0}.admin-editor--embedded .admin-editor__head{padding:1.25rem 1.5rem}.admin-editor--embedded .admin-editor__head h1{font-size:1.6rem}.admin-editor--embedded .admin-editor__content{width:100%;padding:1.25rem 1.5rem 1.5rem}
@media(max-width:640px){.admin-editor__content{width:min(100% - 1.5rem,1100px);padding-top:1.25rem}.editor-grid{grid-template-columns:1fr}.editor-grid .editor-span{grid-column:auto}.editor-section{padding:1rem}.editor-section--publish{align-items:start;flex-direction:column}.editor-section--publish label{width:100%}}
.product-image-preview { display:block; width:min(100%,520px); height:auto; max-height:420px; margin-top:.25rem; object-fit:contain; object-position:center; }
.editorial-image-preview { display:block; width:min(100%,520px); height:180px; margin-top:.25rem; object-fit:cover; border:1px solid rgba(23,52,58,.12); background:#f3f7f4; }
.home-image-preview { display:block; width:min(100%,720px); height:240px; margin-top:.25rem; object-fit:cover; object-position:center; border:1px solid rgba(23,52,58,.12); background:#f3f7f4; }
.editor-section--home { border-radius:16px; }
.editor-grid--home { align-items:start; }
.editor-grid--product { grid-template-columns:repeat(3,minmax(0,1fr)); align-items:start; }
.editor-grid--home > label { min-width:0; padding:1rem; border:1px solid rgba(23,52,58,.1); border-radius:14px; background:#f8fbf9; }
.editor-grid--home textarea { min-height:76px; border-radius:10px; resize:none; }
.editor-grid--home > label:nth-child(n+3) textarea { min-height:116px; }
.home-image-card,.product-image-card { display:grid; gap:.8rem; padding:1rem; border:1px solid rgba(23,52,58,.1); border-radius:14px; background:#f8fbf9; }
.home-image-card > label,.product-image-card > label { display:grid; gap:.45rem; }
.home-image-card input[type=file],.product-image-card input[type=file] { border-radius:10px; background:#fff; }
.home-image-card__preview { position:relative; width:min(100%,760px); margin:0; overflow:hidden; border:1px solid rgba(23,52,58,.12); border-radius:12px; background:#fff; }
.home-image-card__preview .home-image-preview { width:100%; height:auto; aspect-ratio:16/9; margin:0; border:0; object-fit:cover; }
.home-image-card__preview figcaption { padding:.55rem .7rem; border-top:1px solid rgba(23,52,58,.1); color:#526d65; font-size:.66rem; font-weight:600; }
.product-image-card__preview { position:relative; width:min(100%,520px); margin:0; overflow:hidden; border:1px solid rgba(23,52,58,.12); border-radius:12px; background:#fff; }
.product-image-card__preview .product-image-preview { width:100%; height:auto; max-height:none; aspect-ratio:1; margin:0; border:0; object-fit:contain; background:#f3f7f4; }
.product-image-card__preview figcaption { padding:.55rem .7rem; border-top:1px solid rgba(23,52,58,.1); color:#526d65; font-size:.66rem; font-weight:600; }
.home-image-card__remove { position:absolute; top:.7rem; right:.7rem; z-index:1; width:40px; height:40px; display:grid; place-items:center; border:1px solid rgba(23,52,58,.14); border-radius:50%; background:rgba(255,255,255,.94); color:#17343a; box-shadow:0 8px 20px rgba(23,52,58,.14); cursor:pointer; transition:background .2s ease, color .2s ease, transform .2s ease; }
.home-image-card__remove:hover { background:#37675d; color:#fff; transform:scale(1.04); }
.home-image-card__remove .iconify { width:18px; height:18px; }
.home-image-card__remove:focus-visible { outline:3px solid rgba(55,103,93,.4); outline-offset:3px; }
.editor-section--article { border-radius:16px; }
.editor-grid--article { grid-template-columns:repeat(2,minmax(0,1fr)); align-items:start; }
.editor-grid--article > label { min-width:0; }
.editor-grid--article input,.editor-grid--article textarea { border-radius:10px; }
.editorial-image-card { display:grid; gap:.8rem; padding:1rem; border:1px solid rgba(23,52,58,.1); border-radius:14px; background:#f8fbf9; }
.editorial-image-card > label { display:grid; gap:.45rem; }
.editorial-image-card input[type=file] { border-radius:10px; background:#fff; }
.editorial-image-card__preview { position:relative; width:min(100%,520px); margin:0; overflow:hidden; border:1px solid rgba(23,52,58,.12); border-radius:12px; background:#fff; }
.editorial-image-card__preview .editorial-image-preview { width:100%; height:180px; margin:0; border:0; object-fit:cover; }
.editorial-image-card__preview figcaption { padding:.55rem .7rem; border-top:1px solid rgba(23,52,58,.1); color:#526d65; font-size:.66rem; font-weight:600; }
.editor-fixed-copy { display:grid; gap:.25rem; padding:.75rem .9rem; border-radius:12px; background:#f3f7f4; color:#526d65; font-size:.72rem; font-weight:400; }
.editor-fixed-copy strong { color:#17343a; font-size:.74rem; }
.editor-language-review{border-top:1px solid rgba(23,52,58,.12);border-bottom:1px solid rgba(23,52,58,.12);background:#f7f6f1}.editor-language-review summary{min-height:46px;display:flex;align-items:center;gap:1rem;padding:.7rem .85rem;color:#17343a;font-size:.74rem;font-weight:800;cursor:pointer;list-style:none}.editor-language-review summary::-webkit-details-marker{display:none}.editor-language-review summary::after{content:'＋';margin-left:auto;color:#526d65;font-size:.9rem;font-weight:400}.editor-language-review[open] summary::after{content:'－'}.editor-language-review summary small{order:2;color:#526d65;font-size:.64rem;font-weight:500}.editor-language-review__fields{display:grid;grid-template-columns:1fr 1fr;gap:1rem;border-top:1px solid rgba(23,52,58,.1);padding:1rem}.editor-language-review summary:focus-visible{outline:2px solid rgba(55,103,93,.3);outline-offset:-2px}@media(max-width:640px){.editor-language-review__fields{grid-template-columns:1fr}.editor-language-review__fields .editor-span{grid-column:auto}}
@media(max-width:860px){.editor-grid--product{grid-template-columns:1fr 1fr}.editor-grid--product>label:nth-child(3){grid-column:1/-1}}
@media(max-width:640px){.editor-grid--product,.editor-grid--article{grid-template-columns:1fr}.editor-grid--product>label:nth-child(3){grid-column:auto}}
</style>

