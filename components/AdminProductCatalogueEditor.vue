<script setup lang="ts">
import { defaultProductCatalogueContent, type ProductCatalogueContent } from '~/data/site-content'

const form = ref<ProductCatalogueContent>({ ...defaultProductCatalogueContent })
const loading = ref(true)
const uploading = ref(false)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const errorMessage = ref('')
const successMessage = ref('')

const hasCatalogue = computed(() => Boolean(selectedFile.value || form.value.fileUrl))
const previewName = computed(() => selectedFile.value?.name || form.value.fileUrl.split('/').pop() || '产品电子图册.pdf')
const selectedFileSize = computed(() => {
  if (!selectedFile.value) return ''
  return `${(selectedFile.value.size / 1024 / 1024).toFixed(2)} MB`
})

onMounted(async () => {
  try {
    const auth = await $fetch<{ authenticated: boolean }>('/api/admin/auth/status')
    if (!auth.authenticated) return navigateTo('/admin/login', { replace: true })
    form.value = await $fetch<ProductCatalogueContent>('/api/admin/product-catalogue')
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '无法读取图册设置。'
  } finally { loading.value = false }
})

function selectCatalogue(event: Event) {
  errorMessage.value = ''
  successMessage.value = ''
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) {
    errorMessage.value = '请选择 PDF 格式的文件。'
    if (fileInput.value) fileInput.value.value = ''
    return
  }
  clearSelectedCatalogue()
  selectedFile.value = file
}

function clearSelectedCatalogue() {
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

async function uploadCatalogue() {
  const file = selectedFile.value
  if (!file) {
    errorMessage.value = '请先选择 PDF 文件。'
    return
  }
  errorMessage.value = ''; successMessage.value = ''; uploading.value = true
  try {
    const body = new FormData()
    body.append('file', file)
    body.append('kind', 'catalogue')
    const result = await $fetch<{ url: string }>('/api/admin/media/upload', { method: 'POST', body })
    form.value.fileUrl = result.url
    clearSelectedCatalogue()
    successMessage.value = '图册已上传，前台产品中心现在可以直接下载。'
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '图册上传失败，请重试。'
  } finally {
    uploading.value = false
    if (!selectedFile.value && fileInput.value) fileInput.value.value = ''
  }
}
</script>

<template>
  <section id="catalogue" class="admin-catalogue-editor">
    <header class="admin-catalogue-editor__head">
      <div><p>PRODUCT CATALOGUE</p><h2>产品电子图册</h2><span>上传 PDF 后，前台产品中心会自动显示下载入口。</span></div>
      <a v-if="form.fileUrl" class="admin-catalogue-editor__preview" :href="form.fileUrl" target="_blank" rel="noopener">预览当前文件 <Icon name="lucide:arrow-up-right" /></a>
    </header>
    <p v-if="errorMessage" class="admin-catalogue-editor__message admin-catalogue-editor__message--error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="admin-catalogue-editor__message admin-catalogue-editor__message--success">{{ successMessage }}</p>
    <div v-if="!loading" class="admin-catalogue-editor__file">
      <input id="catalogue-pdf-input" ref="fileInput" class="admin-catalogue-editor__file-input" type="file" accept=".pdf,application/pdf" :disabled="uploading" @change="selectCatalogue">
      <label v-if="!hasCatalogue" class="admin-catalogue-editor__picker" for="catalogue-pdf-input">
        <span class="admin-catalogue-editor__picker-icon"><Icon name="lucide:file-up" /></span>
        <strong>选择 PDF 图册</strong>
        <small>点击选择 PDF 文件，选择后可确认文件信息再上传</small>
      </label>

      <div v-else class="admin-catalogue-editor__pdf-card">
        <span class="admin-catalogue-editor__pdf-icon"><Icon name="lucide:file-text" /></span>
        <div class="admin-catalogue-editor__pdf-copy"><strong>{{ previewName }}</strong><small>{{ selectedFile ? `已选择，尚未上传 · ${selectedFileSize}` : '当前已上传的产品图册' }}</small></div>
        <button v-if="selectedFile" type="button" class="admin-catalogue-editor__remove" aria-label="移除已选择的 PDF" title="移除并重新选择" :disabled="uploading" @click="clearSelectedCatalogue"><Icon name="lucide:x" /></button>
        <div class="admin-catalogue-editor__pdf-actions">
          <label class="admin-catalogue-editor__replace" for="catalogue-pdf-input"><Icon name="lucide:refresh-cw" /> {{ selectedFile ? '重新选择' : '选择新 PDF' }}</label>
          <button v-if="selectedFile" type="button" class="admin-catalogue-editor__upload" :disabled="uploading" @click="uploadCatalogue">{{ uploading ? '上传中…' : '确认上传' }} <Icon name="lucide:upload" /></button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.admin-catalogue-editor { width: 100%; margin: 0 0 1.15rem; padding: 1rem 1.15rem; border: 1px solid rgba(23,52,58,.12); background: #ffffff; }
.admin-catalogue-editor__head { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; border-bottom:1px solid rgba(23,52,58,.1); padding-bottom:1rem; }
.admin-catalogue-editor__head p { margin:0 0 .25rem; color:#37675d; font-size:.6rem; font-weight:800; letter-spacing:.14em; }
.admin-catalogue-editor__head h2 { margin:0; color:#17343a; font-size:1.05rem; }
.admin-catalogue-editor__head span { display:block; margin-top:.35rem; color:#526d65; font-size:.72rem; }
.admin-catalogue-editor__preview { display:inline-flex; align-items:center; gap:.3rem; color:#285147; font-size:.72rem; font-weight:800; }
.admin-catalogue-editor__preview svg { width:13px; }
.admin-catalogue-editor__message { margin:.9rem 0 0; padding:.65rem .75rem; font-size:.72rem; }
.admin-catalogue-editor__message--error { background:#f8e5e2; color:#8e2d27; }
.admin-catalogue-editor__message--success { background:#e1efe9; color:#326b57; }
.admin-catalogue-editor__file { margin-top:.9rem; }
.admin-catalogue-editor__file-input { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
.admin-catalogue-editor__picker { min-height:180px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.45rem; border:1px dashed rgba(55,103,93,.38); border-radius:14px; background:#f7faf8; color:#285147; cursor:pointer; transition:border-color .2s ease, background .2s ease; }
.admin-catalogue-editor__picker:hover { border-color:#37675d; background:#edf5ef; }
.admin-catalogue-editor__picker-icon { display:grid; place-items:center; width:44px; height:44px; border-radius:50%; background:#e1efe9; }
.admin-catalogue-editor__picker-icon svg { width:20px; height:20px; }
.admin-catalogue-editor__picker strong { font-size:.76rem; }
.admin-catalogue-editor__picker small { color:#526d65; font-size:.68rem; font-weight:400; }
.admin-catalogue-editor__pdf-card { display:grid; grid-template-columns:auto minmax(0,1fr) auto auto; align-items:center; gap:.8rem; padding:.85rem; border:1px solid rgba(23,52,58,.14); border-radius:14px; background:#f7faf8; }
.admin-catalogue-editor__pdf-icon { display:grid; place-items:center; width:48px; height:48px; border-radius:16px; background:#e1efe9; color:#285147; }
.admin-catalogue-editor__pdf-icon svg { width:22px; height:22px; }
.admin-catalogue-editor__pdf-copy { min-width:0; display:grid; gap:.22rem; }
.admin-catalogue-editor__pdf-copy strong { overflow:hidden; color:#17343a; font-size:.76rem; text-overflow:ellipsis; white-space:nowrap; }
.admin-catalogue-editor__pdf-copy small { color:#526d65; font-size:.68rem; }
.admin-catalogue-editor__remove { display:grid; place-items:center; width:32px; height:32px; border:1px solid rgba(142,45,39,.18); border-radius:50%; background:#fff; color:#8e2d27; cursor:pointer; }
.admin-catalogue-editor__remove:hover { background:#f8e5e2; }
.admin-catalogue-editor__remove svg { width:15px; height:15px; }
.admin-catalogue-editor__pdf-actions { display:flex; align-items:center; justify-content:flex-end; gap:.65rem; }
.admin-catalogue-editor__replace,.admin-catalogue-editor__upload { display:inline-flex; align-items:center; justify-content:center; gap:.35rem; min-height:36px; border-radius:999px; padding:.48rem .72rem; font:inherit; font-size:.68rem; font-weight:800; cursor:pointer; }
.admin-catalogue-editor__replace { border:1px solid rgba(55,103,93,.28); background:#fff; color:#285147; }
.admin-catalogue-editor__upload { border:1px solid #37675d; background:#37675d; color:#fff; }
.admin-catalogue-editor__replace:hover { background:#edf5ef; }
.admin-catalogue-editor__picker:focus-visible,.admin-catalogue-editor__replace:focus-visible,.admin-catalogue-editor__upload:focus-visible,.admin-catalogue-editor__remove:focus-visible { outline:3px solid rgba(55,103,93,.32); outline-offset:3px; }
.admin-catalogue-editor__upload svg { width:13px; height:13px; }
.admin-catalogue-editor__upload:disabled { cursor:not-allowed; opacity:.45; }
@media (max-width:680px) { .admin-catalogue-editor { margin-bottom:1rem; padding:.9rem; } .admin-catalogue-editor__head { flex-direction:column; } .admin-catalogue-editor__pdf-card { grid-template-columns:auto minmax(0,1fr) auto; } .admin-catalogue-editor__pdf-actions { grid-column:1 / -1; align-items:stretch; justify-content:stretch; } .admin-catalogue-editor__pdf-actions > * { flex:1; } }
</style>
