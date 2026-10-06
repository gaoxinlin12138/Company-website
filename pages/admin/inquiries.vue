<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: '询价记录｜管理后台' })

type Inquiry = {
  id: string
  name: string
  company: string
  email: string
  phone: string | null
  interest: string
  message: string
  source: string
  status: 'NEW' | 'PROCESSING' | 'CLOSED'
  internalNote: string | null
  createdAt: string
}

const inquiries = ref<Inquiry[]>([])
const statusFilter = ref('')
const search = ref('')
const page = ref(1)
const pageSize = 20
const total = ref(0)
const loading = ref(true)
const errorMessage = ref('')
const savingId = ref('')
const deletingId = ref('')
const statusOptions = [
  { value: 'NEW', label: '新询价' },
  { value: 'PROCESSING', label: '跟进中' },
  { value: 'CLOSED', label: '已完成' }
]

const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

onMounted(async () => {
  try {
    const status = await $fetch<{ authenticated: boolean }>('/api/admin/auth/status')
    if (!status.authenticated) {
      await navigateTo('/admin/login', { replace: true })
      return
    }
    await fetchInquiries()
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '无法读取询价记录。'
    loading.value = false
  }
})

async function fetchInquiries() {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await $fetch<{ items: Inquiry[]; total: number; page: number }>('/api/admin/inquiries', {
      query: { page: page.value, pageSize, status: statusFilter.value || undefined, search: search.value || undefined }
    })
    inquiries.value = result.items
    total.value = result.total
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '无法读取询价记录。'
  } finally {
    loading.value = false
  }
}

function runSearch() {
  page.value = 1
  fetchInquiries()
}

async function updateInquiry(inquiry: Inquiry) {
  savingId.value = inquiry.id
  errorMessage.value = ''
  try {
    await $fetch(`/api/admin/inquiries/${inquiry.id}`, {
      method: 'PATCH',
      body: { status: inquiry.status, internalNote: inquiry.internalNote || '' }
    })
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '保存失败，请重试。'
  } finally {
    savingId.value = ''
  }
}

async function removeInquiry(inquiry: Inquiry) {
  if (!window.confirm(`确定删除“${inquiry.name}”的这条询价记录吗？删除后无法恢复。`)) return
  deletingId.value = inquiry.id
  errorMessage.value = ''
  try {
    await $fetch(`/api/admin/inquiries/${inquiry.id}`, { method: 'DELETE' })
    if (inquiries.value.length === 1 && page.value > 1) page.value -= 1
    await fetchInquiries()
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '删除失败，请重试。'
  } finally {
    deletingId.value = ''
  }
}

async function logout() {
  await $fetch('/api/admin/auth/logout', { method: 'POST' })
  await navigateTo('/admin/login', { replace: true })
}

function statusLabel(status: Inquiry['status']) {
  return statusOptions.find((option) => option.value === status)?.label || status
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}
</script>

<template>
  <div class="admin-page">
    <header class="admin-topbar">
      <div>
        <p class="admin-topbar__eyebrow">HONGCAI WANFU · CONTENT CONTROL</p>
        <h1>询价记录</h1>
      </div>
      <div class="admin-topbar__actions">
        <NuxtLink to="/" target="_blank">查看网站 <Icon name="lucide:arrow-up-right" /></NuxtLink>
        <button type="button" @click="logout">退出登录</button>
      </div>
    </header>

    <main class="admin-content">
      <section class="admin-toolbar" aria-label="筛选询价">
        <div class="admin-toolbar__title">
          <span class="admin-toolbar__count">{{ total }}</span>
          <span>条询价记录</span>
        </div>
        <div class="admin-toolbar__filters">
          <select v-model="statusFilter" aria-label="按状态筛选" @change="runSearch">
            <option value="">全部状态</option>
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <form class="admin-search" @submit.prevent="runSearch">
            <Icon name="lucide:search" />
            <input v-model="search" placeholder="搜索姓名、公司、邮箱或产品" aria-label="搜索询价">
          </form>
          <button class="admin-refresh" type="button" title="刷新" @click="fetchInquiries"><Icon name="lucide:refresh-cw" /></button>
        </div>
      </section>

      <p v-if="errorMessage" class="admin-alert" role="alert">{{ errorMessage }}</p>
      <section class="admin-table-wrap">
        <div v-if="loading" class="admin-empty">正在读取数据…</div>
        <div v-else-if="!inquiries.length" class="admin-empty">
          <Icon name="lucide:inbox" />
          <strong>还没有询价记录</strong>
          <span>网站收到新的询价后，会显示在这里。</span>
        </div>
        <table v-else class="admin-table">
          <thead>
            <tr><th>联系人</th><th>感兴趣的产品</th><th>留言</th><th>提交时间</th><th>状态</th><th>内部备注</th><th aria-label="操作"></th></tr>
          </thead>
          <tbody>
            <tr v-for="inquiry in inquiries" :key="inquiry.id">
              <td data-label="联系人">
                <strong>{{ inquiry.name }}</strong>
                <span>{{ inquiry.company || '未填写公司' }}</span>
                <a :href="`mailto:${inquiry.email}`">{{ inquiry.email }}</a>
                <a v-if="inquiry.phone" :href="`tel:${inquiry.phone}`">{{ inquiry.phone }}</a>
              </td>
              <td data-label="感兴趣的产品"><span class="interest">{{ inquiry.interest }}</span></td>
              <td data-label="留言"><p class="message">{{ inquiry.message || '—' }}</p></td>
              <td data-label="提交时间" class="date">{{ formatDate(inquiry.createdAt) }}</td>
              <td data-label="状态">
                <select v-model="inquiry.status" class="status-select" :class="`status-select--${inquiry.status.toLowerCase()}`" :aria-label="`更新 ${inquiry.name} 的状态`" :disabled="savingId === inquiry.id || deletingId === inquiry.id" @change="updateInquiry(inquiry)">
                  <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </td>
              <td data-label="内部备注"><textarea v-model="inquiry.internalNote" rows="2" placeholder="仅后台可见" aria-label="内部备注" :disabled="savingId === inquiry.id || deletingId === inquiry.id" @blur="updateInquiry(inquiry)"></textarea></td>
              <td class="action-cell">
                <span v-if="savingId === inquiry.id" class="action-cell__status">自动保存中</span>
                <button class="action-cell__delete" type="button" :disabled="savingId === inquiry.id || deletingId === inquiry.id" @click="removeInquiry(inquiry)">{{ deletingId === inquiry.id ? '删除中' : '删除' }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <nav v-if="pageCount > 1" class="admin-pagination" aria-label="询价分页">
        <button type="button" :disabled="page <= 1" @click="page--; fetchInquiries()"><Icon name="lucide:chevron-left" /></button>
        <span>第 {{ page }} / {{ pageCount }} 页</span>
        <button type="button" :disabled="page >= pageCount" @click="page++; fetchInquiries()"><Icon name="lucide:chevron-right" /></button>
      </nav>
    </main>
  </div>
</template>

<style scoped>
.admin-page { min-height: 100vh; background: #f3f7f4; color: #17343a; }
.admin-topbar { display: flex; align-items: end; justify-content: space-between; gap: 2rem; padding: 2rem clamp(1.25rem, 5vw, 5rem); background: #17343a; color: #fff; }
.admin-topbar__eyebrow { margin: 0 0 .45rem; color: #37675d; font-size: .65rem; font-weight: 800; letter-spacing: .16em; }
.admin-topbar h1 { margin: 0; font-family: var(--serif); font-size: clamp(1.5rem, 4vw, 2.2rem); font-weight: 600; }
.admin-topbar__actions { display: flex; align-items: center; gap: .8rem; }
.admin-topbar__actions a, .admin-topbar__actions button { display: inline-flex; align-items: center; gap: .35rem; border: 1px solid rgba(255,255,255,.35); padding: .55rem .75rem; background: transparent; color: #fff; font-size: .72rem; cursor: pointer; }
.admin-topbar__actions a:hover, .admin-topbar__actions button:hover { border-color: #37675d; color: #37675d; }
.admin-topbar__actions svg { width: 14px; }
.admin-content { width: min(1500px, calc(100% - 2.5rem)); margin: 0 auto; padding: 2rem 0 4rem; }
.admin-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.admin-toolbar__title { display: flex; align-items: baseline; gap: .45rem; color: #526d65; font-size: .8rem; }
.admin-toolbar__count { color: #17343a; font-size: 1.4rem; font-weight: 800; }
.admin-toolbar__filters { display: flex; align-items: center; gap: .6rem; }
.admin-toolbar select, .admin-search, .admin-refresh { height: 38px; border: 1px solid rgba(23,52,58,.16); background: #ffffff; color: #17343a; }
.admin-toolbar select { padding: 0 .7rem; font-size: .75rem; }
.admin-search { display: flex; align-items: center; gap: .4rem; padding: 0 .65rem; }
.admin-search svg { width: 15px; color: #7d898d; }
.admin-search input { width: min(260px, 30vw); border: 0; outline: 0; background: transparent; font-size: .75rem; }
.admin-refresh { width: 38px; display: grid; place-items: center; cursor: pointer; }
.admin-refresh:hover { color: #37675d; border-color: #37675d; }
.admin-refresh svg { width: 15px; }
.admin-alert { margin: 0 0 1rem; padding: .7rem .85rem; background: #f9e9e7; color: #285147; font-size: .76rem; }
.admin-table-wrap { overflow: auto; background: #ffffff; border: 1px solid rgba(23,52,58,.1); }
.admin-table { width: 100%; min-width: 1080px; border-collapse: collapse; font-size: .76rem; }
.admin-table th { padding: .8rem .9rem; background: #eaf2ed; color: #526d65; font-size: .66rem; font-weight: 800; text-align: left; letter-spacing: .04em; white-space: nowrap; }
.admin-table td { padding: .9rem; border-top: 1px solid rgba(12,28,35,.09); vertical-align: top; }
.admin-table tbody tr:hover { background: #fbfaf6; }
.admin-table td:first-child { width: 190px; }
.admin-table td:first-child strong, .admin-table td:first-child span, .admin-table td:first-child a { display: block; }
.admin-table td:first-child strong { margin-bottom: .15rem; font-size: .82rem; }
.admin-table td:first-child span, .admin-table td:first-child a { color: #526d65; font-size: .68rem; }
.admin-table td:first-child a { margin-top: .08rem; color: #1268b2; }
.interest { display: inline-block; padding: .25rem .5rem; background: #eef3ef; color: #17343a; }
.message { width: 220px; max-height: 4.5em; overflow: auto; margin: 0; color: #4e5d62; line-height: 1.55; white-space: pre-wrap; }
.date { min-width: 145px; color: #526d65; white-space: nowrap; }
.status-select { border: 1px solid transparent; border-radius: 99px; padding: .35rem .55rem; font-size: .68rem; font-weight: 700; }
.status-select--new { background: #f9e9e7; color: #285147; }
.status-select--processing { background: #fff4df; color: #8a6b32; }
.status-select--closed { background: #e1efe9; color: #326b57; }
.admin-table textarea { width: 150px; min-height: 58px; resize: vertical; border: 1px solid rgba(23,52,58,.14); border-radius: 12px; padding: .55rem .65rem; background: #fff; color: #17343a; font-size: .68rem; line-height: 1.5; }
.admin-table textarea:focus { border-color: #37675d; box-shadow: 0 0 0 3px rgba(55,103,93,.1); outline: 0; }
.action-cell { min-width: 86px; }
.action-cell button { display: block; width: 100%; border: 0; border-radius: 999px; padding: .42rem .58rem; background: #17343a; color: #fff; font-size: .68rem; cursor: pointer; }
.action-cell button:hover { background: #37675d; }
.action-cell__status { display: block; margin-bottom: .4rem; color: #526d65; font-size: .62rem; white-space: nowrap; }
.action-cell .action-cell__delete { border: 1px solid rgba(142,45,39,.18); background: #fff; color: #8e2d27; }
.action-cell .action-cell__delete:hover { background: #f9e9e7; }
.action-cell button:disabled { opacity: .5; cursor: wait; }
.admin-empty { min-height: 260px; display: grid; place-items: center; align-content: center; gap: .45rem; color: #526d65; font-size: .78rem; }
.admin-empty svg { width: 28px; height: 28px; margin-bottom: .25rem; color: #37675d; }
.admin-empty strong { color: #17343a; font-size: .9rem; }
.admin-pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1.2rem; color: #526d65; font-size: .74rem; }
.admin-pagination button { width: 32px; height: 32px; display: grid; place-items: center; border: 1px solid rgba(23,52,58,.16); background: #ffffff; cursor: pointer; }
.admin-pagination button:disabled { cursor: not-allowed; opacity: .35; }
.admin-pagination svg { width: 14px; }
@media (max-width: 720px) {
  .admin-topbar { align-items: start; flex-direction: column; }
  .admin-topbar__actions { width: 100%; justify-content: space-between; }
  .admin-content { width: min(100% - 1.5rem, 1500px); padding-top: 1.25rem; }
  .admin-toolbar { align-items: stretch; flex-direction: column; }
  .admin-toolbar__filters { flex-wrap: wrap; }
  .admin-search { flex: 1 1 180px; }
  .admin-search input { width: 100%; }
}
</style>
