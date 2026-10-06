<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: '首页首屏轮播｜管理后台' })
const auth = ref(false)
const slides = ref<any[]>([])
const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  try {
    const status = await $fetch<{ authenticated: boolean }>('/api/admin/auth/status')
    if (!status.authenticated) return navigateTo('/admin/login', { replace: true })
    auth.value = true
    slides.value = await $fetch<any[]>('/api/admin/home')
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '无法读取首页轮播内容。'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="auth" class="admin-home">
    <header class="admin-home__head">
      <div>
        <p>HERO CAROUSEL</p>
        <h1>首屏轮播图</h1>
        <span>维护首页首屏展示的 4 张轮播图内容。</span>
      </div>
    </header>
    <main class="admin-home__content">
      <p v-if="errorMessage" class="admin-home__error">{{ errorMessage }}</p>
      <section class="admin-home__notice">
        <Icon name="lucide:lock-keyhole" />
        <div>
          <strong>首屏结构已固定</strong>
          <p>首页首屏始终保留 4 个轮播位置，可分别编辑图片、标题、摘要和跳转内容。</p>
        </div>
      </section>
      <section class="admin-home__table">
        <div v-if="loading" class="admin-home__empty">正在读取…</div>
        <div v-else-if="!slides.length" class="admin-home__empty">
          <Icon name="lucide:panels-top-left" />
          <strong>暂无首页轮播内容</strong>
          <span>请先运行首页初始化数据。</span>
        </div>
        <article v-for="(slide, index) in slides" v-else :key="slide.id" class="admin-home__slide">
          <span class="admin-home__index">0{{ index + 1 }}</span>
          <img :src="slide.image" alt="">
          <div>
            <strong>{{ slide.titleLeadZh }} {{ slide.titleEmphasisZh }}</strong>
            <span>{{ slide.categoryZh }}</span>
          </div>
          <NuxtLink :to="`/admin/home/${slide.id}`">编辑</NuxtLink>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
.admin-home { min-height:100vh; background:#f3f7f4; color:#17343a; }
.admin-home__head { display:flex; align-items:end; justify-content:space-between; gap:2rem; padding:2rem clamp(1.25rem,5vw,5rem); background:#17343a; color:#fff; }
.admin-home__head p { margin:0 0 .45rem; color:#37675d; font-size:.65rem; font-weight:800; letter-spacing:.16em; }
.admin-home__head h1 { margin:0; font-family:var(--serif); font-size:clamp(1.5rem,4vw,2.2rem); font-weight:600; }
.admin-home__head span { display:block; margin-top:.45rem; color:rgba(255,255,255,.72); font-size:.76rem; }
.admin-home__content { width:min(1400px,calc(100% - 2.5rem)); margin:auto; padding:2rem 0 4rem; }
.admin-home__notice { display:flex; gap:.8rem; padding:1rem; background:#e4f0ea; color:#326b57; font-size:.76rem; border-radius:14px; }
.admin-home__notice svg { flex:0 0 auto; width:18px; }
.admin-home__notice p { margin:.35rem 0 0; line-height:1.7; }
.admin-home__error { padding:.7rem .85rem; background:#f9e9e7; color:#285147; font-size:.76rem; }
.admin-home__table { margin-top:1rem; background:#fff; border:1px solid rgba(23,52,58,.1); }
.admin-home__empty { min-height:240px; display:grid; place-items:center; align-content:center; gap:.45rem; color:#526d65; font-size:.78rem; }
.admin-home__empty svg { width:28px; color:#37675d; }
.admin-home__empty strong { color:#17343a; font-size:.9rem; }
.admin-home__slide { display:flex; align-items:center; gap:1rem; padding:1rem; border-bottom:1px solid rgba(23,52,58,.1); }
.admin-home__slide:last-child { border-bottom:0; }
.admin-home__index { flex:0 0 2rem; color:#37675d !important; font-family:var(--serif); font-size:1.1rem !important; font-weight:700; }
.admin-home__slide img { width:150px; height:84px; object-fit:cover; background:#eaf2ed; border-radius:10px; }
.admin-home__slide div { display:grid; gap:.25rem; flex:1; min-width:0; }
.admin-home__slide div strong { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.admin-home__slide div span { color:#526d65; font-size:.72rem; }
.admin-home__slide em { color:#8a6b32; font-size:.7rem; font-style:normal; white-space:nowrap; }
.admin-home__slide a { display:inline-flex; align-items:center; justify-content:center; min-height:34px; border:0; border-radius:10px; padding:.45rem .8rem; background:#eaf2ed; color:#17343a; font-size:.68rem; cursor:pointer; text-decoration:none; white-space:nowrap; transition:background .2s ease, transform .2s ease; }
.admin-home__slide a:hover { background:#d4e2dc; transform:translateY(-1px); }
@media(max-width:640px){.admin-home__content{width:min(100% - 1.5rem,1400px);padding-top:1.25rem}.admin-home__slide{gap:.6rem;padding:.75rem}.admin-home__slide img{width:86px;height:58px}.admin-home__slide div strong{white-space:normal}.admin-home__slide em{display:none}}
</style>


