<script setup lang="ts">
import { defaultSocialContactContent, type SocialContactContent, type SocialContactChannel } from '~/data/site-content'

const form = ref<SocialContactContent>(clone(defaultSocialContactContent))
const loading = ref(true)
const saving = ref(false)
const uploadingId = ref<string | null>(null)
const errorMessage = ref('')
const successMessage = ref('')
const { translating, translatedCount, captureTranslationBaseline, translateChangedFields } = useAdminAutoTranslation()

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

onMounted(async () => {
  try {
    const auth = await $fetch<{ authenticated: boolean }>('/api/admin/auth/status')
    if (!auth.authenticated) return navigateTo('/admin/login', { replace: true })
    form.value = await $fetch<SocialContactContent>('/api/admin/social-contact')
    captureTranslationBaseline(form.value)
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '无法读取社交联系设置。'
  } finally {
    loading.value = false
  }
})

async function submit() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await translateChangedFields(form.value)
    form.value = await $fetch<SocialContactContent>('/api/admin/social-contact', {
      method: 'PATCH',
      body: form.value,
    })
    captureTranslationBaseline(form.value)
    successMessage.value = translatedCount.value ? `已生成并保存 ${translatedCount.value} 项英文译文。` : '已保存，现有英文译文保持不变。'
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '保存失败，请重试。'
  } finally {
    saving.value = false
  }
}

async function uploadQr(event: Event, channel: SocialContactChannel) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploadingId.value = channel.id
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const body = new FormData()
    body.append('file', file)
    body.append('kind', 'social')
    const result = await $fetch<{ url: string }>('/api/admin/media/upload', { method: 'POST', body })
    channel.qrImage = result.url
    successMessage.value = `${channel.nameZh}二维码已上传，点击“保存设置”后前台生效。`
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '二维码上传失败，请重试。'
  } finally {
    uploadingId.value = null
    input.value = ''
  }
}

function resetDefaults() {
  if (!window.confirm('确定恢复默认设置吗？已上传但尚未保存的二维码地址会从表单中移除。')) return
  form.value = clone(defaultSocialContactContent)
  successMessage.value = '已恢复默认值，点击“保存设置”后才会写入数据库。'
}
</script>

<template>
  <div class="social-admin">
    <header class="social-admin__head">
      <div>
        <p>CONTACT CHANNELS</p>
        <h1>社交联系</h1>
        <span>管理首页右下角的微信、企业微信、WhatsApp、抖音和 TikTok 联系二维码。</span>
      </div>
      <NuxtLink class="social-admin__view" to="/" target="_blank">查看首页 <Icon name="lucide:arrow-up-right" /></NuxtLink>
    </header>

    <main v-if="!loading" class="social-admin__content">
      <p v-if="errorMessage" class="social-admin__alert">{{ errorMessage }}</p>
      <p v-if="successMessage" class="social-admin__success">{{ successMessage }}</p>

      <form class="social-admin__form" novalidate @submit.prevent="submit">
        <AdminTranslationNotice :translating="translating" />
        <section class="social-admin__channels">
          <header><div><h2>联系平台</h2><p>关闭的平台不会在前台显示；没有上传二维码时，前台会明确显示“待配置”。</p></div><span>{{ form.channels.filter(item => item.enabled).length }} / {{ form.channels.length }} 已启用</span></header>
          <div class="social-admin__channel-list">
          <article v-for="channel in form.channels" :id="`channel-${channel.id}`" :key="channel.id" :class="{ 'is-disabled': !channel.enabled }">
            <div class="social-admin__channel-head">
              <span class="social-admin__brand"><Icon :name="channel.icon" /></span>
              <div><strong>{{ channel.nameZh }}</strong><small>{{ channel.nameEn }}</small></div>
              <label class="social-admin__switch"><input v-model="channel.enabled" type="checkbox"><span></span><b>{{ channel.enabled ? '已启用' : '已关闭' }}</b></label>
            </div>

            <div class="social-admin__channel-body">
              <div class="social-admin__fields">
                <label>中文名称<input v-model.trim="channel.nameZh" maxlength="16"></label>
                <label>English name<input v-model.trim="channel.nameEn" maxlength="24"></label>
              </div>

              <div class="social-admin__qr">
                <div class="social-admin__qr-preview">
                  <img v-if="channel.qrImage" :src="channel.qrImage" :alt="`${channel.nameZh}二维码预览`">
                  <template v-else><Icon name="lucide:qr-code" /><span>尚未上传</span></template>
                </div>
                <label class="social-admin__upload">
                  <input type="file" accept="image/jpeg,image/png,image/webp" :disabled="uploadingId === channel.id" @change="uploadQr($event, channel)">
                  <span><Icon name="lucide:upload" />{{ uploadingId === channel.id ? '上传中…' : channel.qrImage ? '替换二维码' : '上传二维码' }}</span>
                </label>
                <button v-if="channel.qrImage" type="button" @click="channel.qrImage = ''">移除当前二维码</button>
                <small>推荐 1000×1000（1:1 正方形，二维码四周保留空白）；支持 JPG、PNG、WebP，单张不超过 5MB。</small>
              </div>
            </div>
          </article>
          </div>
        </section>

        <div class="social-admin__actions">
          <button type="button" class="social-admin__reset" @click="resetDefaults">恢复默认值</button>
          <button type="submit" :disabled="saving || translating">{{ translating ? '翻译中…' : saving ? '保存中…' : '翻译并保存' }}</button>
        </div>
      </form>
    </main>
    <div v-else class="social-admin__loading">正在读取社交联系设置…</div>
  </div>
</template>

<style scoped>
.social-admin{min-height:100vh;background:#f3f7f4;color:#17343a}.social-admin__head{display:flex;align-items:end;justify-content:space-between;gap:2rem;padding:2rem clamp(1.25rem,5vw,5rem);background:#17343a;color:#fff}.social-admin__head p{margin:0 0 .45rem;color:#37675d;font-size:.65rem;font-weight:800;letter-spacing:.16em}.social-admin__head h1{margin:0;font-family:var(--serif);font-size:clamp(1.5rem,4vw,2.2rem);font-weight:600}.social-admin__head span{display:block;margin-top:.45rem;color:rgba(255,255,255,.72);font-size:.76rem}.social-admin__view{display:inline-flex;align-items:center;gap:.35rem;border:1px solid rgba(255,255,255,.35);padding:.55rem .75rem;color:#fff;font-size:.72rem}.social-admin__view svg{width:14px}.social-admin__content{width:min(1200px,calc(100% - 2.5rem));margin:auto;padding:2rem 0 4rem}.social-admin__alert,.social-admin__success{margin:0 0 1rem;padding:.7rem .85rem;font-size:.76rem}.social-admin__alert{background:#f9e9e7;color:#285147}.social-admin__success{background:#e4f0ea;color:#326b57}.social-admin__form{display:grid;gap:1rem}.social-admin__channels{padding:1.35rem;background:#ffffff;border:1px solid rgba(23,52,58,.1)}.social-admin h2{margin:0;font-size:1rem}.social-admin h2+p,.social-admin__channels header p{margin:.35rem 0 0;color:#526d65;font-size:.72rem}.social-admin__fields{display:grid;grid-template-columns:1fr 1fr;gap:.8rem}.social-admin__fields label{display:grid;gap:.35rem;color:#526d65;font-size:.7rem;font-weight:700}.social-admin__fields input{width:100%;border:1px solid rgba(23,52,58,.16);padding:.65rem .7rem;background:#fff;color:#17343a;font:inherit;font-size:.77rem;font-weight:400}.social-admin__fields input:focus{outline:2px solid rgba(55,103,93,.2);border-color:#37675d}.social-admin__wide{grid-column:1/-1}.social-admin__channels>header{display:flex;align-items:start;justify-content:space-between;gap:1rem;margin-bottom:1rem}.social-admin__channels>header>span{flex:0 0 auto;padding:.35rem .5rem;background:#e7f0ec;color:#3c6554;font-size:.65rem;font-weight:800}.social-admin__channels article{border-top:1px solid rgba(23,52,58,.12);padding:1.1rem 0;transition:opacity .2s ease}.social-admin__channels article:last-child{padding-bottom:0}.social-admin__channels article.is-disabled{opacity:.55}.social-admin__channel-head{display:flex;align-items:center;gap:.75rem}.social-admin__brand{display:grid;place-items:center;width:42px;height:42px;background:#17343a;color:#fff}.social-admin__brand svg{width:21px;height:21px}.social-admin__channel-head>div{display:grid;gap:.1rem}.social-admin__channel-head strong{font-size:.82rem}.social-admin__channel-head small{color:#7a8589;font-size:.64rem}.social-admin__switch{display:flex;align-items:center;gap:.55rem;margin-left:auto;color:#526d65;font-size:.68rem;font-weight:700;cursor:pointer}.social-admin__switch input{position:absolute;opacity:0;pointer-events:none}.social-admin__switch span{position:relative;width:38px;height:21px;border-radius:20px;background:#c7ccca;transition:background .2s ease}.social-admin__switch span::after{content:'';position:absolute;top:3px;left:3px;width:15px;height:15px;border-radius:50%;background:#fff;transition:transform .2s ease}.social-admin__switch input:checked+span{background:#3c8062}.social-admin__switch input:checked+span::after{transform:translateX(17px)}.social-admin__switch input:focus-visible+span{outline:2px solid #37675d;outline-offset:2px}.social-admin__channel-body{display:grid;grid-template-columns:minmax(0,1fr) 180px;gap:1.25rem;margin:1rem 0 0 3.55rem}.social-admin__qr{display:grid;justify-items:start;align-content:start;gap:.55rem}.social-admin__qr-preview{width:138px;aspect-ratio:1;display:grid;place-items:center;border:1px dashed rgba(23,52,58,.2);background:#f3f7f4;color:#849095}.social-admin__qr-preview img{width:100%;height:100%;object-fit:contain;background:#fff}.social-admin__qr-preview svg{width:28px;height:28px}.social-admin__qr-preview span{font-size:.66rem}.social-admin__upload input{position:absolute;width:1px;height:1px;opacity:0}.social-admin__upload>span{display:inline-flex;align-items:center;gap:.4rem;border:1px solid #37675d;padding:.5rem .65rem;background:#37675d;color:#fff;font-size:.68rem;font-weight:800;cursor:pointer}.social-admin__upload svg{width:13px}.social-admin__qr button{border:0;padding:0;background:transparent;color:#285147;font-size:.65rem;text-decoration:underline;text-underline-offset:3px;cursor:pointer}.social-admin__qr small{max-width:170px;color:#7a8589;font-size:.61rem;line-height:1.5}.social-admin__actions{display:flex;justify-content:flex-end;gap:.7rem}.social-admin__actions button{border:1px solid #37675d;padding:.7rem 1.05rem;background:#37675d;color:#fff;font-size:.74rem;font-weight:800;cursor:pointer}.social-admin__actions .social-admin__reset{border-color:rgba(23,52,58,.18);background:#ffffff;color:#17343a}.social-admin__actions button:disabled{opacity:.5;cursor:wait}.social-admin__loading{padding:4rem;text-align:center;color:#526d65;font-size:.8rem}@media(max-width:760px){.social-admin__head{align-items:start;flex-direction:column;gap:1rem}.social-admin__content{width:min(100% - 1.5rem,1200px);padding-top:1.25rem}.social-admin__fields{grid-template-columns:1fr}.social-admin__wide{grid-column:auto}.social-admin__channel-body{grid-template-columns:1fr;margin-left:0}.social-admin__qr{grid-template-columns:138px 1fr;align-items:start}.social-admin__upload,.social-admin__qr button,.social-admin__qr small{grid-column:2}.social-admin__upload{grid-row:1}.social-admin__qr button{grid-row:1;margin-top:2.65rem}.social-admin__qr small{grid-row:1;margin-top:4.6rem}}

.social-admin__channels{border-radius:16px}
.social-admin__channel-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
.social-admin__channels .social-admin__channel-list article{min-width:0;border:1px solid rgba(23,52,58,.1);border-radius:14px;padding:1rem;background:#f8fbf9}
.social-admin__channels .social-admin__channel-list article:last-child{padding-bottom:1rem}
.social-admin__channel-head{gap:.6rem}
.social-admin__brand{width:36px;height:36px;border-radius:9px}
.social-admin__brand svg{width:18px;height:18px}
.social-admin__channel-body{grid-template-columns:minmax(0,1fr) 112px;gap:.85rem;margin:.85rem 0 0}
.social-admin__fields{grid-template-columns:minmax(0,144px);align-self:start;align-content:start;grid-auto-rows:max-content;gap:.6rem}
.social-admin__fields label{align-content:start}
.social-admin__fields input{border-radius:9px;padding:.55rem .65rem}
.social-admin__qr{justify-items:stretch;gap:.45rem}
.social-admin__qr-preview{width:104px;border-radius:10px}
.social-admin__upload>span{justify-content:center;border-radius:9px;padding:.45rem .5rem}
.social-admin__qr button{text-align:center}
.social-admin__qr small{max-width:112px;font-size:.58rem}
@media(max-width:1000px){.social-admin__channel-list{grid-template-columns:1fr}}
@media(max-width:760px){.social-admin__channel-body{grid-template-columns:minmax(0,1fr) 104px}.social-admin__fields{grid-template-columns:1fr}.social-admin__qr{display:grid;grid-template-columns:1fr}.social-admin__upload,.social-admin__qr button,.social-admin__qr small{grid-column:auto;grid-row:auto;margin-top:0}}
</style>


