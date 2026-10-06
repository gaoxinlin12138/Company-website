<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: '管理后台登录｜红财万富' })

const mode = ref<'login' | 'setup'>('login')
const username = ref('')
const password = ref('')
const passwordConfirm = ref('')
const loading = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  try {
    const status = await $fetch<{ authenticated: boolean; needsSetup: boolean }>('/api/admin/auth/status')
    if (status.authenticated) {
      await navigateTo('/admin/inquiries', { replace: true })
    } else if (status.needsSetup) {
      mode.value = 'setup'
    }
  } catch {
    errorMessage.value = '暂时无法连接后台服务，请确认开发服务正在运行。'
  }
})

async function submit() {
  errorMessage.value = ''
  if (mode.value === 'setup' && password.value !== passwordConfirm.value) {
    errorMessage.value = '两次输入的密码不一致。'
    return
  }
  loading.value = true
  try {
    await $fetch(mode.value === 'setup' ? '/api/admin/auth/setup' : '/api/admin/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    })
    await navigateTo('/admin/inquiries', { replace: true })
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '操作失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="admin-auth">
    <div class="admin-auth__panel">
      <div class="admin-auth__mark">HWF</div>
      <p class="admin-auth__eyebrow">HONGCAI WANFU · ADMIN</p>
      <h1>{{ mode === 'setup' ? '创建管理员账号' : '管理后台' }}</h1>
      <p class="admin-auth__intro">
        {{ mode === 'setup' ? '首次使用，请先创建一个管理员账号。' : '登录后管理网站内容与询价记录。' }}
      </p>

      <form class="admin-form" @submit.prevent="submit">
        <label>
          <span>用户名</span>
          <input v-model.trim="username" autocomplete="username" required minlength="3" maxlength="60" placeholder="请输入用户名">
        </label>
        <label>
          <span>密码{{ mode === 'setup' ? '（至少 10 位）' : '' }}</span>
          <input v-model="password" :autocomplete="mode === 'setup' ? 'new-password' : 'current-password'" required :minlength="mode === 'setup' ? 10 : undefined" type="password" placeholder="请输入密码">
        </label>
        <label v-if="mode === 'setup'">
          <span>确认密码</span>
          <input v-model="passwordConfirm" autocomplete="new-password" required minlength="10" type="password" placeholder="再次输入密码">
        </label>
        <p v-if="errorMessage" class="admin-form__error" role="alert">{{ errorMessage }}</p>
        <button type="submit" :disabled="loading">
          {{ loading ? '处理中…' : mode === 'setup' ? '创建并进入后台' : '登录后台' }}
        </button>
      </form>

      <button v-if="mode === 'login'" class="admin-auth__hint" type="button" @click="mode = 'setup'">
        首次使用？创建管理员账号
      </button>
      <button v-else class="admin-auth__hint" type="button" @click="mode = 'login'">
        返回登录
      </button>
    </div>
  </main>
</template>

<style scoped>
.admin-auth { min-height: 100vh; display: grid; place-items: center; padding: 2rem; background: #17343a; color: #f7f6f1; }
.admin-auth__panel { width: min(100%, 430px); padding: clamp(2rem, 5vw, 3.5rem); background: #ffffff; color: #17343a; box-shadow: 0 28px 80px rgba(0,0,0,.28); }
.admin-auth__mark { width: 48px; height: 48px; display: grid; place-items: center; background: #37675d; color: #fff; font-size: .75rem; font-weight: 800; letter-spacing: .08em; }
.admin-auth__eyebrow { margin: 1.6rem 0 .6rem; color: #37675d; font-size: .68rem; font-weight: 800; letter-spacing: .16em; }
h1 { margin: 0; font-family: var(--serif); font-size: clamp(1.7rem, 5vw, 2.2rem); }
.admin-auth__intro { margin: .75rem 0 1.8rem; color: #526d65; font-size: .86rem; }
.admin-form { display: grid; gap: 1rem; }
.admin-form label { display: grid; gap: .35rem; }
.admin-form label span { color: #526d65; font-size: .74rem; font-weight: 700; }
.admin-form input { width: 100%; border: 1px solid rgba(23,52,58,.18); border-radius: 2px; padding: .78rem .85rem; background: #fff; color: #17343a; }
.admin-form input:focus { outline: 2px solid rgba(55,103,93,.3); border-color: #37675d; }
.admin-form button { border: 0; padding: .86rem 1rem; background: #37675d; color: #fff; font-weight: 800; cursor: pointer; }
.admin-form button:disabled { cursor: wait; opacity: .62; }
.admin-form__error { margin: 0; padding: .7rem .8rem; background: #f4e5dc; color: #285147; font-size: .76rem; }
.admin-auth__hint { margin-top: 1.2rem; border: 0; padding: 0; background: transparent; color: #526d65; font-size: .75rem; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
</style>
