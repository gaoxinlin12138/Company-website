<script setup lang="ts">
import { computed } from 'vue'

const { language, t } = useSiteLanguage()

/**
 * 备案与版权信息（硬编码）。
 * 依据：网站在中国大陆境内提供服务，须在显著位置标明 ICP 备案编号并链接到
 * 工信部备案系统。备案主体名称必须与备案信息完全一致，请勿随意改动。
 *
 * 公安备案通过后，需在此处补充公安备案编号与官方图标，
 * 编号与图标由 beian.mps.gov.cn 提供，图标不可自行绘制或改色。
 */
const icpNumber = '浙ICP备2026018014号-2'
const companyName = '红财万富（温州）科技有限公司'
const icpUrl = 'https://beian.miit.gov.cn/'
const copyrightYear = computed(() => new Date().getFullYear())
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
    <!-- 备案与版权信息：固定显示，不受中英文切换影响（备案信息为中文法定公示内容） -->
    <div class="site-foot__legal">
      <span class="site-foot__legal-copy">COPYRIGHT © {{ copyrightYear }} {{ companyName }}</span>
      <span class="site-foot__legal-sep" aria-hidden="true">|</span>
      <a :href="icpUrl" target="_blank" rel="noopener nofollow">{{ icpNumber }}</a>
    </div>
  </footer>
</template>
