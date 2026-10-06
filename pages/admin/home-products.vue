<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: '首页推荐产品｜管理后台' })
const auth = ref(false)

onMounted(async () => {
  const status = await $fetch<{ authenticated: boolean }>('/api/admin/auth/status')
  if (!status.authenticated) return navigateTo('/admin/login', { replace: true })
  auth.value = true
})
</script>

<template>
  <div v-if="auth" class="admin-home">
    <header class="admin-home__head">
      <div>
        <p>PRODUCT CAROUSEL</p>
        <h1>首页推荐产品轮播</h1>
        <span>选择并排序首页“近期推荐产品”中的产品，前台会按当前顺序自动旋转展示。</span>
      </div>
    </header>
    <main class="admin-home__content">
      <section class="admin-home__notice">
        <Icon name="lucide:layers-3" />
        <div>
          <strong>推荐产品独立管理</strong>
          <p>这里的选择和排序只影响首页推荐产品轮播，不会改变产品中心的分类和产品资料。</p>
        </div>
      </section>
      <AdminHomeProductSelector />
    </main>
  </div>
</template>

<style scoped>
.admin-home { min-height:100vh; background:#f3f7f4; color:#17343a; }
.admin-home__head { display:flex; align-items:end; justify-content:space-between; gap:2rem; padding:2rem clamp(1.25rem,5vw,5rem); background:#17343a; color:#fff; }
.admin-home__head p { margin:0 0 .45rem; color:#37675d; font-size:.65rem; font-weight:800; letter-spacing:.16em; }
.admin-home__head h1 { margin:0; font-family:var(--serif); font-size:clamp(1.5rem,4vw,2.2rem); font-weight:600; }
.admin-home__head span { display:block; max-width:48rem; margin-top:.45rem; color:rgba(255,255,255,.72); font-size:.76rem; }
.admin-home__content { width:min(1400px,calc(100% - 2.5rem)); margin:auto; padding:2rem 0 4rem; }
.admin-home__notice { display:flex; gap:.8rem; padding:1rem; background:#e4f0ea; color:#326b57; font-size:.76rem; }
.admin-home__notice svg { flex:0 0 auto; width:18px; }
.admin-home__notice p { margin:.35rem 0 0; line-height:1.7; }
@media(max-width:640px){.admin-home__content{width:min(100% - 1.5rem,1400px);padding-top:1.25rem}}
</style>
