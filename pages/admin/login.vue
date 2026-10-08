<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: '管理后台登录｜红财万富' })

const username = ref('')
const password = ref('')
const passwordVisible = ref(false)
const loading = ref(false)
const ready = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  try {
    const status = await $fetch<{ authenticated: boolean; ready: boolean; loginUsername: string }>('/api/admin/auth/status')
    if (status.authenticated) {
      await navigateTo('/admin/inquiries', { replace: true })
      return
    }
    username.value = status.loginUsername || ''
    ready.value = status.ready
    if (!status.ready) errorMessage.value = '管理员账号尚未配置，请联系服务器维护人员。'
  } catch {
    ready.value = false
    errorMessage.value = '暂时无法连接后台服务，请稍后重试。'
  }
})

async function submit() {
  if (!ready.value || loading.value) return
  errorMessage.value = ''
  loading.value = true
  try {
    await $fetch('/api/admin/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    })
    await navigateTo('/admin/inquiries', { replace: true })
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '登录失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="admin-auth">
    <div class="admin-auth__backdrop" aria-hidden="true" />
    <section class="admin-auth__brand" aria-label="红财万富管理后台">
      <div class="admin-auth__brand-mark">HCWF</div>
      <div>
        <p>HONGCAI WANFU</p>
        <h1>让网站内容始终<br>准确、清晰、及时。</h1>
      </div>
      <small>红财万富卫浴 · 网站内容管理</small>
    </section>

    <section class="admin-auth__panel" aria-labelledby="admin-login-title">
      <header>
        <div class="admin-auth__mark" aria-hidden="true">HCWF</div>
        <div>
          <h2 id="admin-login-title">登录管理后台</h2>
          <p>仅限授权管理员访问</p>
        </div>
      </header>

      <form class="admin-form" @submit.prevent="submit">
        <label>
          <span>管理员账号</span>
          <span class="admin-form__control">
            <Icon name="lucide:user-round" aria-hidden="true" />
            <input v-model.trim="username" autocomplete="username" required maxlength="60" placeholder="请输入管理员账号">
          </span>
        </label>

        <label>
          <span>密码</span>
          <span class="admin-form__control">
            <Icon name="lucide:lock-keyhole" aria-hidden="true" />
            <input v-model="password" autocomplete="current-password" required maxlength="200" :type="passwordVisible ? 'text' : 'password'" placeholder="请输入密码">
            <button class="admin-form__reveal" type="button" :aria-label="passwordVisible ? '隐藏密码' : '显示密码'" :title="passwordVisible ? '隐藏密码' : '显示密码'" @click="passwordVisible = !passwordVisible">
              <Icon :name="passwordVisible ? 'lucide:eye-off' : 'lucide:eye'" aria-hidden="true" />
            </button>
          </span>
        </label>

        <p v-if="errorMessage" class="admin-form__error" role="alert">
          <Icon name="lucide:circle-alert" aria-hidden="true" />
          <span>{{ errorMessage }}</span>
        </p>

        <button class="admin-form__submit" type="submit" :disabled="loading || !ready">
          <Icon v-if="loading" class="admin-form__spinner" name="lucide:loader-circle" aria-hidden="true" />
          <span>{{ loading ? '正在验证…' : '安全登录' }}</span>
          <Icon v-if="!loading" name="lucide:arrow-right" aria-hidden="true" />
        </button>
      </form>

      <footer>
        <Icon name="lucide:shield-check" aria-hidden="true" />
        <span>会话采用加密签名，并在 12 小时后自动失效</span>
      </footer>
    </section>
  </main>
</template>

<style scoped>
.admin-auth {
  position: relative;
  isolation: isolate;
  min-height: 100svh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(420px, 34vw);
  overflow: hidden;
  background: #17343a;
  color: #ffffff;
  font-family: Manrope, "Noto Sans SC", "Microsoft YaHei", sans-serif;
}
.admin-auth__backdrop {
  position: absolute;
  inset: 0;
  z-index: -2;
  background: url('/assets/images/hero-sanitaryware.webp') center / cover no-repeat;
  transform: scale(1.01);
}
.admin-auth::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg, rgba(10, 38, 40, .88) 0%, rgba(10, 38, 40, .58) 42%, rgba(10, 38, 40, .12) 72%);
}
.admin-auth__brand {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(2rem, 5vw, 5.5rem);
  text-shadow: 0 2px 24px rgba(0, 0, 0, .22);
}
.admin-auth__brand-mark, .admin-auth__mark {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  background: #37675d;
  color: #ffffff;
  font-size: .78rem;
  font-weight: 800;
}
.admin-auth__brand p {
  margin: 0 0 1.15rem;
  color: rgba(255, 255, 255, .78);
  font-size: .73rem;
  font-weight: 700;
  letter-spacing: .18em;
}
.admin-auth__brand h1 {
  max-width: 11em;
  margin: 0;
  font-size: clamp(2.6rem, 5vw, 5rem);
  font-weight: 650;
  line-height: 1.08;
  letter-spacing: 0;
  text-wrap: balance;
}
.admin-auth__brand small { color: rgba(255, 255, 255, .72); font-size: .75rem; }
.admin-auth__panel {
  min-width: 0;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(2.5rem, 5.5vw, 5.5rem);
  background: rgba(250, 252, 250, .97);
  color: #17343a;
  box-shadow: -20px 0 70px rgba(9, 31, 32, .18);
}
.admin-auth__panel header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2.5rem; }
.admin-auth__mark { width: 48px; height: 48px; flex: 0 0 48px; font-size: .66rem; text-shadow: none; }
.admin-auth__panel h2 { margin: 0 0 .35rem; font-size: clamp(1.65rem, 2.5vw, 2rem); line-height: 1.15; letter-spacing: 0; }
.admin-auth__panel header p { margin: 0; color: #526d65; font-size: .78rem; }
.admin-form { display: grid; gap: 1.2rem; }
.admin-form, .admin-form label, .admin-form__control { min-width: 0; }
.admin-form label { display: grid; gap: .5rem; }
.admin-form label > span:first-child { color: #35564e; font-size: .75rem; font-weight: 700; }
.admin-form__control {
  min-height: 52px;
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  align-items: center;
  gap: .7rem;
  border: 1px solid #c5d4cd;
  padding: 0 .85rem;
  background: #ffffff;
  transition: border-color .2s ease, box-shadow .2s ease;
}
.admin-form__control:focus-within { border-color: #37675d; box-shadow: 0 0 0 3px rgba(55, 103, 93, .13); }
.admin-form__control > svg { width: 18px; height: 18px; color: #668078; }
.admin-form input {
  min-width: 0;
  width: 100%;
  border: 0;
  outline: 0;
  padding: .85rem 0;
  background: transparent;
  color: #17343a;
  font: inherit;
  font-size: .9rem;
  caret-color: #37675d;
}
.admin-form input::placeholder { color: #789087; opacity: 1; }
.admin-form__reveal {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  color: #526d65;
  cursor: pointer;
}
.admin-form__reveal:hover { color: #17343a; }
.admin-form__reveal:focus-visible { outline: 2px solid #37675d; outline-offset: -2px; }
.admin-form__reveal svg { width: 18px; height: 18px; }
.admin-form__error {
  display: flex;
  align-items: flex-start;
  gap: .55rem;
  margin: 0;
  padding: .78rem .85rem;
  background: #f8ece8;
  color: #8a342b;
  font-size: .76rem;
  line-height: 1.5;
}
.admin-form__error svg { width: 17px; height: 17px; flex: 0 0 auto; margin-top: .1rem; }
.admin-form__submit {
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .65rem;
  border: 0;
  padding: 0 1.1rem;
  background: #37675d;
  color: #ffffff;
  font: inherit;
  font-size: .88rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(36, 80, 71, .18);
  transition: background-color .2s ease, box-shadow .2s ease, transform .2s ease;
}
.admin-form__submit:hover:not(:disabled) { background: #285147; box-shadow: 0 16px 34px rgba(36, 80, 71, .24); transform: translateY(-2px); }
.admin-form__submit:focus-visible { outline: 3px solid rgba(55, 103, 93, .35); outline-offset: 3px; }
.admin-form__submit:disabled { cursor: not-allowed; opacity: .58; box-shadow: none; }
.admin-form__submit svg { width: 18px; height: 18px; }
.admin-form__spinner { animation: spin .8s linear infinite; }
.admin-auth__panel footer { display: flex; align-items: center; gap: .5rem; margin-top: 1.5rem; color: #668078; font-size: .69rem; line-height: 1.5; }
.admin-auth__panel footer svg { width: 15px; height: 15px; flex: 0 0 auto; }
::selection { background: #37675d; color: #ffffff; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 860px) {
  .admin-auth { grid-template-columns: 1fr; align-content: end; }
  .admin-auth::before { background: linear-gradient(180deg, rgba(10, 38, 40, .28) 0%, rgba(10, 38, 40, .72) 48%, rgba(10, 38, 40, .84) 100%); }
  .admin-auth__brand { min-height: 30svh; padding: 1.5rem; }
  .admin-auth__brand > div:not(.admin-auth__brand-mark), .admin-auth__brand small { display: none; }
  .admin-auth__brand-mark { width: 52px; height: 52px; }
  .admin-auth__panel { align-self: end; min-height: 64svh; justify-content: flex-start; padding: 2rem max(1.25rem, env(safe-area-inset-right)) max(2rem, env(safe-area-inset-bottom)) max(1.25rem, env(safe-area-inset-left)); box-shadow: 0 -18px 54px rgba(9, 31, 32, .2); }
  .admin-auth__panel header { margin-bottom: 2rem; }
}
@media (prefers-reduced-motion: reduce) {
  .admin-auth__backdrop { transform: none; }
  .admin-form__submit { transition: none; }
}
</style>
