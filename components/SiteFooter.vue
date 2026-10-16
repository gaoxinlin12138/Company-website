<script setup lang="ts">
import { footerMenuColumns } from '~/data/site'

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

// 与顶部导航同源（data/site.ts），改一处两处同时生效
const columns = footerMenuColumns
</script>

<template>
  <footer class="site-foot">
    <div class="site-foot__main">
      <div class="site-foot__brand">
        <span class="site-foot__name">红财万富</span>
        <span class="site-foot__name-en">HONGCAI WANFU</span>
        <span class="site-foot__rule" aria-hidden="true"></span>
        <p class="site-foot__tagline">{{ t('全球卫浴五金合作伙伴') }}<br><small>GLOBAL BATHROOM &amp; HARDWARE PARTNER</small></p>
        <p class="site-foot__slogan">{{ t('让更好的卫浴') }}<br>{{ t('走向更广阔的世界') }}</p>
      </div>

      <nav class="site-foot__columns" :aria-label="t('页脚导航')" data-foot-columns>
        <div v-for="column in columns" :key="column.to" class="site-foot__column" data-foot-column>
          <NuxtLink class="site-foot__column-title" :to="column.to">{{ t(column.label) }}</NuxtLink>
          <ul>
            <li v-for="item in column.items()" :key="`${column.to}-${item.label}`">
              <NuxtLink :to="item.to">{{ t(item.label) }}</NuxtLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <!-- 备案与版权信息：固定显示，不随中英文切换（备案为中文法定公示内容） -->
    <div class="site-foot__legal">
      <div class="site-foot__legal-inner">
        <p class="site-foot__legal-copy">COPYRIGHT © {{ copyrightYear }} {{ companyName }}</p>
        <p class="site-foot__legal-links">
          <a :href="icpUrl" target="_blank" rel="noopener nofollow">{{ icpNumber }}</a>
          <span class="site-foot__legal-sep" aria-hidden="true">|</span>
          <!-- 公安备案通过后，用官方生成的编号与图标替换此处 -->
          <span class="site-foot__legal-pending">公安备案办理中</span>
        </p>
      </div>
    </div>
  </footer>
</template>
