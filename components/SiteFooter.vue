<script setup lang="ts">
const { language, t } = useSiteLanguage()
</script>

<template>
  <footer class="site-foot">
    <div class="site-foot__inner">
      <div class="site-foot__brand">
        <img src="/assets/images/logo-transparent.png" width="702" height="180" :alt="language === 'en' ? 'Hongcai Wanfu' : '红财万富 HONGCAI WANFU'">
        <span>{{ t('全球卫浴五金合作伙伴') }}<br><small>GLOBAL BATHROOM &amp; HARDWARE PARTNER</small></span>
      </div>
      <nav :aria-label="t('页脚导航')">
        <NuxtLink to="/">{{ t('首页') }}</NuxtLink>
        <NuxtLink to="/products">{{ t('产品中心') }}</NuxtLink>
        <NuxtLink to="/about">{{ t('关于我们') }}</NuxtLink>
        <NuxtLink to="/news">{{ t('新闻动态') }}</NuxtLink>
        <NuxtLink to="/cases">{{ t('案例展示') }}</NuxtLink>
        <NuxtLink to="/contact">{{ t('联系我们') }}</NuxtLink>
      </nav>
      <p>{{ t('让更好的卫浴') }}<br>{{ t('走向更广阔的世界') }}</p>
    </div>
  </footer>
</template>
