<script setup lang="ts">
import { buildProfileContentBlocks, defaultAboutContent, defaultContactContent, type AboutProfileBlock, type AboutProfileBlockType } from '~/data/site-content'

type SettingsResource = 'about' | 'contact'
type SettingsSection = 'company-profile' | 'brand-culture' | 'qualifications' | 'brand-vi' | 'contact-channels' | 'contact-location' | 'contact-inquiry'
const props = defineProps<{ resource: SettingsResource; section?: SettingsSection }>()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const hasAmap = computed(() => Boolean(runtimeConfig.public.amapKey))
const isAbout = computed(() => props.resource === 'about')
const sectionTitles: Record<SettingsSection, string> = {
  'company-profile': '公司简介',
  'brand-culture': '品牌文化',
  qualifications: '荣誉资质',
  'brand-vi': '企业 VI',
  'contact-channels': '联系方式',
  'contact-location': '地理位置',
  'contact-inquiry': '采购需求说明',
}
const title = computed(() => props.section ? sectionTitles[props.section] : isAbout.value ? '关于我们' : '联系我们')
const endpoint = computed(() => `/api/admin/${props.resource}`)
const source = computed(() => isAbout.value ? defaultAboutContent : defaultContactContent)
const form = ref<any>(clone(source.value))
const loading = ref(true)
const saving = ref(false)
const uploadingQualifications = ref(false)
const uploadingBrandVi = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const { translating, translatedCount, captureTranslationBaseline, translateChangedFields } = useAdminAutoTranslation()

const sectionOrder: Record<SettingsResource, string[]> = {
  about: ['company-profile', 'brand-culture', 'qualifications', 'brand-vi'],
  contact: ['contact-channels', 'contact-location', 'contact-inquiry'],
}

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) }

onMounted(async () => {
  try {
    const auth = await $fetch<{ authenticated: boolean }>('/api/admin/auth/status')
    if (!auth.authenticated) return navigateTo('/admin/login', { replace: true })
    form.value = await $fetch(endpoint.value)
    normalizeAboutForm()
    normalizeContactForm()
    captureTranslationBaseline(form.value)
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '无法读取模块内容。'
  } finally { loading.value = false }
})

async function submit() {
  saving.value = true; errorMessage.value = ''; successMessage.value = ''
  try {
    await translateChangedFields(form.value)
    form.value = await $fetch(endpoint.value, { method: 'PATCH', body: form.value })
    captureTranslationBaseline(form.value)
    successMessage.value = translatedCount.value ? `已生成并保存 ${translatedCount.value} 项英文译文，前台会使用最新内容。` : '已保存，现有英文译文保持不变。'
  } catch (error: any) { errorMessage.value = error?.data?.statusMessage || '保存失败，请重试。' }
  finally { saving.value = false }
}

async function uploadFile(event: Event, target: { object: Record<string, any>; key: string }) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  errorMessage.value = ''
  try {
    const body = new FormData()
    body.append('file', file)
    body.append('kind', 'about')
    const result = await $fetch<{ url: string }>('/api/admin/media/upload', { method: 'POST', body })
    target.object[target.key] = result.url
  } catch (error: any) { errorMessage.value = error?.data?.statusMessage || '文件上传失败，请重试。' }
  finally { input.value = '' }
}

async function uploadMediaFile(file: File) {
  const body = new FormData()
  body.append('file', file)
  body.append('kind', 'about')
  return await $fetch<{ url: string }>('/api/admin/media/upload', { method: 'POST', body })
}

function fileTitle(file: File) {
  return file.name.replace(/\.[^.]+$/, '').trim()
}

async function uploadGalleryFiles(event: Event, gallery: 'qualifications' | 'brandVi') {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (!files.length) return
  const uploading = gallery === 'qualifications' ? uploadingQualifications : uploadingBrandVi
  uploading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  let uploadedCount = 0
  const failures: string[] = []
  try {
    for (const file of files) {
      try {
        const result = await uploadMediaFile(file)
        if (gallery === 'qualifications') {
          if (!Array.isArray(form.value.qualifications.items)) form.value.qualifications.items = []
          form.value.qualifications.items.push({
            titleZh: fileTitle(file), titleEn: '', detailZh: '', detailEn: '',
            statusLabelZh: '', statusLabelEn: '', fileUrl: result.url,
          })
        } else {
          ensureBrandViItems().push({ image: result.url, titleZh: fileTitle(file), titleEn: '' })
        }
        uploadedCount += 1
      } catch (error: any) {
        failures.push(`${file.name}：${error?.data?.statusMessage || '上传失败'}`)
      }
    }
    if (uploadedCount) successMessage.value = `已上传 ${uploadedCount} 张图片，确认名称后请点击“翻译并保存”。`
    if (failures.length) errorMessage.value = failures.join('；')
  } finally {
    uploading.value = false
    input.value = ''
  }
}

function resetDefaults() {
  if (!window.confirm('确定恢复为当前安全默认文案吗？尚未保存的修改会被覆盖。')) return
  form.value = clone(source.value)
  normalizeAboutForm()
  normalizeContactForm()
  successMessage.value = '已恢复默认值，点击保存后才会写入数据库。'
}

function normalizeContactForm() {
  if (isAbout.value || !form.value?.location) return
  const defaults = defaultContactContent.location as typeof defaultContactContent.location & { mapLink?: string; latitude?: number; longitude?: number; zoom?: number }
  const location = form.value.location
  const latitude = Number(location.latitude)
  const longitude = Number(location.longitude)
  const zoom = Number(location.zoom)
  location.latitude = Number.isFinite(latitude) ? latitude : defaults.latitude
  location.longitude = Number.isFinite(longitude) ? longitude : defaults.longitude
  location.zoom = Number.isFinite(zoom) ? Math.min(18, Math.max(4, Math.round(zoom))) : defaults.zoom
  location.mapLink = String(location.mapLink || '').trim()
}

function onMapLocationChange() {
  if (!isAbout.value && form.value?.location) form.value.location.mapLink = ''
}

type ContentFlowSection = 'companyProfile' | 'brandCulture'

function newContentBlock(type: AboutProfileBlockType, section: ContentFlowSection): AboutProfileBlock {
  const id = globalThis.crypto?.randomUUID?.() || `${section}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return { id, type, bodyZh: '', bodyEn: '', image: '', titleZh: '', titleEn: '', captionZh: '', captionEn: '', altZh: '', altEn: '' }
}

function normalizeAboutForm() {
  if (!isAbout.value || !form.value?.companyProfile) return
  form.value.companyProfile.contentBlocks = buildProfileContentBlocks(form.value.companyProfile)
  if (form.value.brandCulture) form.value.brandCulture.contentBlocks = buildProfileContentBlocks(form.value.brandCulture, 'legacy-culture')
  if (form.value.brandVi) {
    if (!Array.isArray(form.value.brandVi.items)) form.value.brandVi.items = []
    for (const key of ['introZh', 'introEn', 'logo', 'copyZh', 'copyEn', 'gallery', 'colours']) delete form.value.brandVi[key]
  }
}

function contentBlocks(section: ContentFlowSection) {
  const target = form.value[section]
  if (!Array.isArray(target.contentBlocks)) target.contentBlocks = []
  return target.contentBlocks as AboutProfileBlock[]
}

function addContentBlock(section: ContentFlowSection, type: AboutProfileBlockType) {
  contentBlocks(section).push(newContentBlock(type, section))
}

function moveContentBlock(section: ContentFlowSection, index: number, offset: -1 | 1) {
  const blocks = contentBlocks(section)
  const targetIndex = index + offset
  if (targetIndex < 0 || targetIndex >= blocks.length) return
  const [block] = blocks.splice(index, 1)
  blocks.splice(targetIndex, 0, block)
}

function removeContentBlock(section: ContentFlowSection, index: number) {
  contentBlocks(section).splice(index, 1)
}

function removeContentBlockImage(block: AboutProfileBlock) {
  block.image = ''
}

function splitLines(event: Event) {
  return (event.target as HTMLTextAreaElement).value.split('\n').map(item => item.trim()).filter(Boolean)
}

function ensureBrandViItems() {
  if (!Array.isArray(form.value.brandVi.items)) form.value.brandVi.items = []
  return form.value.brandVi.items
}

function removeBrandViItem(index: number) {
  ensureBrandViItems().splice(index, 1)
}

function removeQualification(index: number) {
  form.value.qualifications.items.splice(index, 1)
}

function isImageUrl(value: string) {
  return /\.(?:jpe?g|png|webp|gif)(?:\?.*)?$/i.test(value || '')
}

async function scrollToManagedSection() {
  if (loading.value || !route.hash) return
  const index = sectionOrder[props.resource].indexOf(route.hash.slice(1))
  if (index < 0) return
  await nextTick()
  document.querySelectorAll<HTMLElement>('.admin-settings__form .settings-section')[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch([loading, () => route.hash], scrollToManagedSection, { immediate: true })
</script>

<template>
  <div class="admin-settings">
    <header class="admin-settings__head"><div><p class="admin-settings__eyebrow">{{ isAbout ? 'ABOUT US' : 'CONTACT US' }}</p><h1>{{ title }}</h1><span>{{ props.section ? `独立维护“${title}”栏目内容，保存后同步到前台。` : isAbout ? '维护前台四个关于我们栏目，只编辑内容与真实资料。' : '维护联系方式、地理位置、采购需求说明，并集中查看客户询价。' }}</span></div><div class="admin-settings__head-actions"><NuxtLink class="admin-settings__view" :to="isAbout ? '/about' : '/contact'" target="_blank">查看前台 <Icon name="lucide:arrow-up-right" /></NuxtLink></div></header>
    <main v-if="!loading" class="admin-settings__content">
      <p v-if="errorMessage" class="admin-settings__alert">{{ errorMessage }}</p>
      <p v-if="successMessage" class="admin-settings__success">{{ successMessage }}</p>
      <form class="admin-settings__form" :class="props.section ? `settings-form--${props.section}` : ''" novalidate @submit.prevent="submit">
        <AdminTranslationNotice :translating="translating" />
        <template v-if="isAbout">
          <section v-if="!props.section || props.section === 'company-profile'" class="settings-section">
            <div class="settings-section__intro">
              <div>
                <h2>公司简介</h2>
                <p>导语固定显示在标题下方；正文与图片在同一列表中编排。图片推荐 1600×1000（约 8:5 横图），单张不超过 5MB。</p>
              </div>
            </div>
            <div class="settings-grid">
              <label>中文导语<input v-model="form.companyProfile.introZh"></label>
              <label>English intro<input v-model="form.companyProfile.introEn"></label>
            </div>
            <AdminProfileFlowEditor
              :blocks="form.companyProfile.contentBlocks"
              preview-alt="公司简介图片预览"
              @add="addContentBlock('companyProfile', $event)"
              @move="(index, offset) => moveContentBlock('companyProfile', index, offset)"
              @remove="removeContentBlock('companyProfile', $event)"
              @remove-image="removeContentBlockImage"
              @upload="(payload) => uploadFile(payload[0], { object: payload[1], key: 'image' })"
            />
          </section>
          <section v-if="!props.section || props.section === 'brand-culture'" class="settings-section">
            <div class="settings-section__intro">
              <div>
                <h2>品牌文化</h2>
                <p>导语固定显示在标题下方；正文与图片在同一列表中编排。图片推荐 1600×1000（约 8:5 横图），单张不超过 5MB。</p>
              </div>
            </div>
            <div class="settings-grid">
              <label>中文导语<input v-model="form.brandCulture.introZh"></label>
              <label>English intro<input v-model="form.brandCulture.introEn"></label>
            </div>
            <AdminProfileFlowEditor
              :blocks="form.brandCulture.contentBlocks"
              preview-alt="品牌文化图片预览"
              @add="addContentBlock('brandCulture', $event)"
              @move="(index, offset) => moveContentBlock('brandCulture', index, offset)"
              @remove="removeContentBlock('brandCulture', $event)"
              @remove-image="removeContentBlockImage"
              @upload="(payload) => uploadFile(payload[0], { object: payload[1], key: 'image' })"
            />
            <div class="settings-repeat settings-culture-principles">
              <div class="settings-repeat__head"><strong>品牌原则</strong></div>
              <article v-for="(item, index) in form.brandCulture.principles" :key="`${item.icon}-${index}`" class="settings-culture-principle">
                <strong>原则 {{ Number(index) + 1 }}</strong>
                <div class="settings-grid">
                  <label>中文标题<input v-model="item.titleZh"></label>
                  <label>English title<input v-model="item.titleEn"></label>
                  <label>中文说明<textarea v-model="item.detailZh" rows="3"></textarea></label>
                  <label>English detail<textarea v-model="item.detailEn" rows="3"></textarea></label>
                </div>
              </article>
            </div>
          </section>
          <section v-if="!props.section || props.section === 'qualifications'" class="settings-section settings-section--qualifications">
            <div class="settings-section__intro">
              <div><h2>荣誉资质</h2><p>可一次选择多张图片，上传后在同一图片框内编辑名称。推荐 1200×850 横图，单张不超过 5MB。</p></div>
            </div>
            <div class="settings-gallery">
              <div class="settings-gallery__toolbar">
                <div><strong>已上传图片</strong><span>{{ form.qualifications.items.filter((item: any) => isImageUrl(item.fileUrl)).length }} 张</span></div>
                <label class="settings-gallery__upload" :class="{ 'is-uploading': uploadingQualifications }" for="qualification-images">
                  <Icon :name="uploadingQualifications ? 'lucide:loader-circle' : 'lucide:images'" />
                  {{ uploadingQualifications ? '正在上传…' : '批量上传图片' }}
                  <input id="qualification-images" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple :disabled="uploadingQualifications" @change="uploadGalleryFiles($event, 'qualifications')">
                </label>
              </div>
              <div v-if="form.qualifications.items.some((item: any) => isImageUrl(item.fileUrl))" class="settings-gallery__grid">
                <article v-for="(item, index) in form.qualifications.items" v-show="isImageUrl(item.fileUrl)" :key="`${item.fileUrl}-${index}`" class="settings-gallery__item">
                  <label>图片名称<input v-model="item.titleZh" placeholder="例如：国家高新技术企业"></label>
                  <figure>
                    <img :src="item.fileUrl" :alt="item.titleZh || '荣誉资质图片预览'">
                    <button type="button" aria-label="删除这张荣誉资质图片" title="删除图片" @click="removeQualification(Number(index))"><Icon name="lucide:x" /></button>
                  </figure>
                </article>
              </div>
              <div v-else class="settings-gallery__empty">
                <Icon name="lucide:image-plus" />
                <strong>还没有上传荣誉资质图片</strong>
                <span>点击右上角“批量上传图片”，可一次选择多张。</span>
              </div>
            </div>
          </section>
          <section v-if="!props.section || props.section === 'brand-vi'" class="settings-section settings-section--brand-vi">
            <div class="settings-section__intro">
              <div><h2>企业 VI</h2><p>可一次选择多张图片，上传后在同一图片框内编辑名称。推荐 1600×1000 横图，单张不超过 5MB。</p></div>
            </div>
            <div class="settings-gallery">
              <div class="settings-gallery__toolbar">
                <div><strong>已上传图片</strong><span>{{ ensureBrandViItems().filter((item: any) => isImageUrl(item.image)).length }} 张</span></div>
                <label class="settings-gallery__upload" :class="{ 'is-uploading': uploadingBrandVi }" for="brand-vi-images">
                  <Icon :name="uploadingBrandVi ? 'lucide:loader-circle' : 'lucide:images'" />
                  {{ uploadingBrandVi ? '正在上传…' : '批量上传图片' }}
                  <input id="brand-vi-images" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple :disabled="uploadingBrandVi" @change="uploadGalleryFiles($event, 'brandVi')">
                </label>
              </div>
              <div v-if="ensureBrandViItems().some((item: any) => isImageUrl(item.image))" class="settings-gallery__grid">
                <article v-for="(item, index) in ensureBrandViItems()" v-show="isImageUrl(item.image)" :key="`${item.image}-${index}`" class="settings-gallery__item">
                  <label>图片名称<input v-model="item.titleZh" placeholder="例如：品牌标志"></label>
                  <figure>
                    <img :src="item.image" :alt="item.titleZh || '企业 VI 图片预览'">
                    <button type="button" aria-label="删除这张企业 VI 图片" title="删除图片" @click="removeBrandViItem(Number(index))"><Icon name="lucide:x" /></button>
                  </figure>
                </article>
              </div>
              <div v-else class="settings-gallery__empty">
                <Icon name="lucide:image-plus" />
                <strong>还没有上传企业 VI 图片</strong>
                <span>点击右上角“批量上传图片”，可一次选择多张。</span>
              </div>
            </div>
          </section>
        </template>
        <template v-else>
          <section v-if="!props.section || props.section === 'contact-channels'" class="settings-section settings-section--contact-channels">
            <div class="settings-section__intro">
              <div><h2>联系方式</h2><p>左侧填写中文内容，右侧填写对应英文；电话、邮箱和微信账号会在两侧同步。</p></div>
            </div>
            <div class="settings-grid settings-contact-grid">
              <label>电话（中文）<input v-model="form.channels.phone"></label>
              <label>Phone (English)<input v-model="form.channels.phone"></label>
              <label>工作时间（中文）<input v-model="form.channels.phoneHoursZh"></label>
              <label>Working hours (English)<input v-model="form.channels.phoneHoursEn"></label>
              <label>邮箱（中文）<input v-model="form.channels.email" type="email"></label>
              <label>Email (English)<input v-model="form.channels.email" type="email"></label>
              <label>邮箱说明（中文）<input v-model="form.channels.emailNoteZh"></label>
              <label>Email note (English)<input v-model="form.channels.emailNoteEn"></label>
              <label>微信 / WhatsApp（中文）<input v-model="form.channels.social"></label>
              <label>WeChat / WhatsApp (English)<input v-model="form.channels.social"></label>
              <label>社交账号说明（中文）<input v-model="form.channels.socialNoteZh"></label>
              <label>Social note (English)<input v-model="form.channels.socialNoteEn"></label>
              <label>服务时间（中文）<input v-model="form.channels.serviceHoursZh"></label>
              <label>Service hours (English)<input v-model="form.channels.serviceHoursEn"></label>
              <label>服务时间说明（中文）<input v-model="form.channels.serviceNoteZh"></label>
              <label>Service note (English)<input v-model="form.channels.serviceNoteEn"></label>
            </div>
          </section>
          <section v-if="!props.section || props.section === 'contact-location'" class="settings-section"><div class="settings-section__intro"><div><h2>地理位置</h2><p>{{ hasAmap ? '前台和管理台使用高德地图 JS API，支持地址搜索、拖动选点和缩放。点击地图会在新窗口打开高德详情页。' : '前台显示地图瓦片和公司定位点。配置高德 Key 后，管理台会启用地址搜索和高德地图选点。' }}</p></div></div><div class="settings-grid"><label>中文地址<input v-model="form.location.addressZh" placeholder="例如：浙江省温州市……"></label><label>English address<input v-model="form.location.addressEn" placeholder="For example: Wenzhou, Zhejiang, China"></label><label>中文提示<input v-model="form.location.noteZh" placeholder="例如：欢迎预约到访"></label><label>English note<input v-model="form.location.noteEn" placeholder="Visits are welcome by appointment."></label><label>地图纬度<input v-model.number="form.location.latitude" type="number" step="0.000001" placeholder="例如：28.008387"></label><label>地图经度<input v-model.number="form.location.longitude" type="number" step="0.000001" placeholder="例如：120.646399"></label><label>地图缩放级别<input v-model.number="form.location.zoom" type="number" min="4" max="18" step="1" placeholder="14"></label><label>地图详情链接<input v-model="form.location.mapLink" type="url" placeholder="留空则按经纬度自动生成高德标记链接"></label><div class="settings-location-picker settings-span"><div class="settings-location-picker__head"><strong>{{ hasAmap ? '高德地图选点' : '拖动地图选点' }}</strong><span>{{ hasAmap ? '搜索地址、拖动或点击地图，中心标记就是保存的位置。' : '拖动地图，让想展示的位置对准中心标记；保存后前台地图会同步到这个位置。' }}</span></div><AmapLocationPicker v-if="hasAmap" v-model:latitude="form.location.latitude" v-model:longitude="form.location.longitude" v-model:zoom="form.location.zoom" @update:latitude="onMapLocationChange" @update:longitude="onMapLocationChange" /><LocationMapPicker v-else v-model:latitude="form.location.latitude" v-model:longitude="form.location.longitude" v-model:zoom="form.location.zoom" @update:latitude="onMapLocationChange" @update:longitude="onMapLocationChange" /></div><p class="settings-location-note settings-span"><Icon name="lucide:map-pin" /> 当前坐标为 {{ Number(form.location.longitude || 0).toFixed(6) }}, {{ Number(form.location.latitude || 0).toFixed(6) }}。拖动地图或调整缩放后，详情链接会自动改为按新坐标生成。</p></div></section>
          <section v-if="!props.section || props.section === 'contact-inquiry'" class="settings-section"><div class="settings-section__intro"><div><h2>采购需求说明</h2><p>这里的说明会显示在前台采购需求表单附近。</p></div></div><div class="settings-grid"><label>中文说明<textarea v-model="form.inquiry.introZh" rows="3"></textarea></label><label>English intro<textarea v-model="form.inquiry.introEn" rows="3"></textarea></label><label>隐私提示（中文）<textarea v-model="form.inquiry.privacyZh" rows="2"></textarea></label><label>Privacy note (English)<textarea v-model="form.inquiry.privacyEn" rows="2"></textarea></label></div></section>
        </template>
        <div class="settings-actions"><button type="button" class="settings-reset" @click="resetDefaults">恢复默认值</button><button type="submit" :disabled="saving || translating">{{ translating ? '翻译中…' : saving ? '保存中…' : '翻译并保存' }}</button></div>
      </form>
    </main>
    <div v-else class="admin-settings__loading">正在读取内容…</div>
  </div>
</template>

<style>
.admin-settings{min-height:100vh;background:#f3f7f4;color:#17343a}.admin-settings__head{display:flex;align-items:end;justify-content:space-between;gap:2rem;padding:2rem clamp(1.25rem,5vw,5rem);background:#17343a;color:#fff}.admin-settings__eyebrow{margin:0 0 .45rem;color:#37675d;font-size:.65rem;font-weight:800;letter-spacing:.16em}.admin-settings__head h1{margin:0;font-family:var(--serif);font-size:clamp(1.5rem,4vw,2.2rem);font-weight:600}.admin-settings__head span{display:block;margin-top:.45rem;color:rgba(255,255,255,.72);font-size:.76rem}.admin-settings__view{display:inline-flex;align-items:center;gap:.35rem;border:1px solid rgba(255,255,255,.35);padding:.55rem .75rem;color:#fff;font-size:.72rem}.admin-settings__view svg{width:14px}.admin-settings__content{width:min(1200px,calc(100% - 2.5rem));margin:auto;padding:2rem 0 4rem}.admin-settings__alert,.admin-settings__success{margin:0 0 1rem;padding:.7rem .85rem;font-size:.76rem}.admin-settings__alert{background:#f9e9e7;color:#285147}.admin-settings__success{background:#e4f0ea;color:#326b57}.admin-settings__form{display:grid;gap:1rem}.settings-section{padding:1.35rem;background:#ffffff;border:1px solid rgba(23,52,58,.1)}.settings-section__intro{display:flex;align-items:start;justify-content:space-between;gap:1rem;margin-bottom:1.1rem}.settings-section__intro h2{margin:0;font-size:1rem}.settings-section__intro p{margin:.35rem 0 0;color:#526d65;font-size:.72rem}.settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:.9rem}.settings-grid label{display:grid;gap:.35rem;color:#526d65;font-size:.72rem;font-weight:700}.settings-grid input,.settings-grid textarea{width:100%;border:1px solid rgba(23,52,58,.16);border-radius:10px;padding:.65rem .7rem;background:#fff;color:#17343a;font:inherit;font-size:.78rem;font-weight:400}.settings-grid textarea{resize:vertical;line-height:1.55}.settings-grid input:focus,.settings-grid textarea:focus{outline:2px solid rgba(55,103,93,.25);border-color:#37675d}.settings-span{grid-column:1/-1}.settings-repeat{display:grid;gap:.8rem;margin-top:1rem}.settings-repeat__head,.settings-repeat__item-head{display:flex;align-items:center;justify-content:space-between;gap:.8rem}.settings-repeat__head{padding:.15rem 0 .25rem}.settings-repeat__item-head{margin-bottom:.75rem}.settings-repeat article{padding:1rem;background:#f3f7f4;border:1px solid rgba(12,28,35,.08)}.settings-repeat article>strong{display:block;margin-bottom:.75rem;font-size:.78rem}.settings-add,.settings-remove{display:inline-flex;align-items:center;gap:.35rem;border:1px solid rgba(23,52,58,.18);padding:.45rem .6rem;background:#ffffff;color:#17343a;font-size:.68rem;font-weight:800;cursor:pointer}.settings-add{border-color:#37675d;color:#285147}.settings-add svg{width:13px}.settings-remove{color:#285147}.settings-media-preview{display:block;width:min(100%,220px);height:150px;margin-top:.25rem;object-fit:contain;border:1px solid rgba(23,52,58,.12);background:#fff}.settings-colours{display:grid;gap:.55rem;margin-top:1rem}.settings-colours article{display:grid;grid-template-columns:1fr 1fr 150px 34px;gap:.5rem;align-items:center}.settings-colours input{border:1px solid rgba(23,52,58,.16);border-radius:10px;padding:.55rem;background:#fff;font-size:.75rem}.settings-colours i{width:30px;height:30px;border:1px solid rgba(23,52,58,.15)}.settings-actions{display:flex;justify-content:flex-end;gap:.7rem}.settings-actions button{border:1px solid #37675d;padding:.65rem 1rem;background:#37675d;color:#fff;font-size:.74rem;font-weight:800;cursor:pointer}.settings-actions .settings-reset{border-color:rgba(23,52,58,.18);background:#ffffff;color:#17343a}.settings-actions button:disabled{opacity:.5;cursor:wait}.admin-settings__loading{padding:4rem;text-align:center;color:#526d65;font-size:.8rem}@media(max-width:680px){.admin-settings__head{align-items:start;flex-direction:column;gap:1rem}.admin-settings__content{width:min(100% - 1.5rem,1200px);padding-top:1.25rem}.settings-grid{grid-template-columns:1fr}.settings-span{grid-column:auto}.settings-section__intro{align-items:start;flex-direction:column}.settings-colours article{grid-template-columns:1fr 1fr}.settings-colours article input:nth-child(3){grid-column:1/-1}.settings-colours i{grid-column:2;grid-row:1/3;justify-self:end}}
.settings-location-note{display:flex;align-items:flex-start;gap:.45rem;margin:0;padding:.75rem .8rem;background:#eaf3ed;color:#526d65;font-size:.7rem;line-height:1.55}.settings-location-note svg{flex:0 0 auto;width:15px;color:#37675d}
.settings-location-picker{display:grid;gap:.7rem;margin-top:.15rem}.settings-location-picker__head{display:flex;align-items:baseline;justify-content:space-between;gap:1rem}.settings-location-picker__head strong{color:#285147;font-size:.78rem}.settings-location-picker__head span{color:#526d65;font-size:.7rem;font-weight:400}@media(max-width:680px){.settings-location-picker__head{align-items:flex-start;flex-direction:column;gap:.25rem}}
.settings-profile-flow{gap:1rem;margin-top:1.25rem}.settings-profile-flow__head{align-items:end;border-bottom:1px solid rgba(23,52,58,.1);padding-bottom:.85rem}.settings-profile-flow__head>div:first-child{display:grid;gap:.28rem}.settings-profile-flow__head span{color:#526d65;font-size:.7rem;font-weight:400}.settings-profile-flow__add{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:.5rem}.settings-profile-flow__empty{margin:0;padding:1.1rem;border:1px dashed rgba(23,52,58,.18);color:#526d65;font-size:.74rem;text-align:center}.settings-profile-block{min-width:0;border-radius:16px}.settings-profile-block__head strong{display:inline-flex;align-items:center;gap:.45rem;margin:0}.settings-profile-block__head strong .iconify{width:15px;height:15px;color:#37675d}.settings-profile-block__actions{display:flex;align-items:center;gap:.4rem}.settings-order{width:40px;height:40px;display:inline-grid;place-items:center;border:1px solid rgba(23,52,58,.18);background:#ffffff;color:#17343a;cursor:pointer}.settings-order .iconify{width:14px;height:14px}.settings-order:disabled{opacity:.35;cursor:not-allowed}.settings-profile-block__actions .settings-remove,.settings-profile-flow__add .settings-add{min-height:40px}.settings-profile-block__preview{width:min(100%,360px);height:auto;aspect-ratio:16/9;object-fit:cover}.settings-profile-block input,.settings-profile-block textarea{min-width:0}.settings-order:focus-visible,.settings-add:focus-visible,.settings-remove:focus-visible{outline:2px solid rgba(55,103,93,.35);outline-offset:2px}@media(max-width:680px){.settings-profile-flow__head{align-items:stretch}.settings-profile-flow__add{justify-content:flex-start}.settings-profile-block__head{align-items:flex-start;flex-direction:column}.settings-profile-block__actions{width:100%;justify-content:flex-end}.settings-profile-block__actions .settings-remove{margin-left:auto}}

.settings-content-image{display:grid;gap:.8rem;padding:1rem;border:1px solid rgba(23,52,58,.1);border-radius:14px;background:#f8fbf9}.settings-content-image>label{display:grid;gap:.45rem}.settings-content-image__preview{position:relative;width:min(100%,460px);margin:0;overflow:hidden;border:1px solid rgba(23,52,58,.12);border-radius:12px;background:#fff}.settings-content-image__preview img{display:block;width:100%;height:auto;aspect-ratio:8/5;object-fit:cover}.settings-content-image__preview figcaption{padding:.5rem .65rem;border-top:1px solid rgba(23,52,58,.1);color:#526d65;font-size:.66rem;font-weight:600}.settings-content-image__remove{position:absolute;top:.6rem;right:.6rem;z-index:1;width:34px;height:34px;display:grid;place-items:center;border:1px solid rgba(23,52,58,.14);border-radius:50%;background:rgba(255,255,255,.94);color:#17343a;box-shadow:0 8px 20px rgba(23,52,58,.14);cursor:pointer;transition:background .2s ease,color .2s ease,transform .2s ease}.settings-content-image__remove:hover{background:#37675d;color:#fff;transform:scale(1.04)}.settings-content-image__remove .iconify{width:16px;height:16px}.settings-content-image__remove:focus-visible{outline:3px solid rgba(55,103,93,.4);outline-offset:3px}
.settings-culture-principles{margin-top:1.25rem}.settings-culture-principle{border-radius:16px}
.settings-section--qualifications,.settings-section--brand-vi{border-radius:16px}.settings-gallery{overflow:hidden;border:1px solid rgba(23,52,58,.11);border-radius:16px;background:#f8fbf9}.settings-gallery__toolbar{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.85rem 1rem;border-bottom:1px solid rgba(23,52,58,.09);background:#eef5f1}.settings-gallery__toolbar>div{display:flex;align-items:baseline;gap:.55rem}.settings-gallery__toolbar strong{font-size:.76rem}.settings-gallery__toolbar span{color:#526d65;font-size:.68rem}.settings-gallery__upload{min-height:40px;display:inline-flex;align-items:center;justify-content:center;gap:.4rem;border:1px solid #37675d;border-radius:999px;padding:.55rem .85rem;background:#37675d;color:#fff;font-size:.7rem;font-weight:800;cursor:pointer;box-shadow:0 7px 18px rgba(40,81,71,.14);transition:background .2s ease,transform .2s ease}.settings-gallery__upload:hover{background:#285147;transform:translateY(-1px)}.settings-gallery__upload:focus-within{outline:3px solid rgba(55,103,93,.32);outline-offset:3px}.settings-gallery__upload.is-uploading{opacity:.68;cursor:wait;transform:none}.settings-gallery__upload.is-uploading .iconify{animation:settings-gallery-spin .8s linear infinite}.settings-gallery__upload input{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.settings-gallery__upload .iconify{width:15px;height:15px}.settings-gallery__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,220px));gap:.85rem;padding:1rem}.settings-gallery__item{min-width:0;display:flex;flex-direction:column;gap:.55rem;padding:.7rem!important;border:0!important;border-radius:14px;background:#fff!important;box-shadow:0 8px 24px rgba(23,52,58,.06)}.settings-gallery__item label{display:grid;gap:.32rem;color:#526d65;font-size:.68rem;font-weight:700}.settings-gallery__item input{min-width:0;width:100%;border:1px solid rgba(23,52,58,.16);border-radius:14px;padding:.55rem .6rem;background:#fff;color:#17343a;font:inherit;font-size:.74rem;font-weight:400}.settings-gallery__item input:focus{outline:2px solid rgba(55,103,93,.25);border-color:#37675d}.settings-gallery__item figure{position:relative;margin:0;overflow:hidden;border-radius:14px;background:#eef3f0;aspect-ratio:4/3}.settings-gallery__item img{display:block;width:100%;height:100%;object-fit:contain}.settings-gallery__item figure button{position:absolute;top:.45rem;right:.45rem;width:34px;height:34px;display:grid;place-items:center;border:1px solid rgba(23,52,58,.13);border-radius:50%;background:rgba(255,255,255,.94);color:#17343a;box-shadow:0 6px 16px rgba(23,52,58,.14);cursor:pointer;transition:background .2s ease,color .2s ease,transform .2s ease}.settings-gallery__item figure button:hover{background:#285147;color:#fff;transform:scale(1.04)}.settings-gallery__item figure button:focus-visible{outline:3px solid rgba(55,103,93,.4);outline-offset:2px}.settings-gallery__item figure button .iconify{width:15px;height:15px}.settings-gallery__empty{min-height:190px;display:grid;place-items:center;align-content:center;gap:.35rem;padding:2rem;color:#526d65;text-align:center}.settings-gallery__empty .iconify{width:26px;height:26px;margin-bottom:.25rem;color:#849e94}.settings-gallery__empty strong{color:#35564e;font-size:.76rem}.settings-gallery__empty span{font-size:.68rem}@keyframes settings-gallery-spin{to{transform:rotate(360deg)}}@media(max-width:680px){.settings-gallery__toolbar{align-items:flex-start;flex-direction:column}.settings-gallery__upload{width:100%}.settings-gallery__grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:.65rem;padding:.7rem}.settings-gallery__item{padding:.6rem!important}}@media(max-width:430px){.settings-gallery__grid{grid-template-columns:1fr}}
.settings-section--contact-channels{border-radius:16px}.settings-contact-grid{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}.settings-contact-grid label{min-width:0}.settings-contact-grid input{border-radius:10px}@media(max-width:680px){.settings-contact-grid{grid-template-columns:1fr}}
.settings-field-help{color:#526d65;font-size:.66rem;font-weight:400;line-height:1.5}
</style>




