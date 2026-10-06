<script setup lang="ts">
import { buildProfileContentBlocks, defaultAboutContent, type AboutContent } from '~/data/site-content'

type AboutSection = 'company-profile' | 'brand-culture' | 'qualifications' | 'brand-vi'

const { language } = useSiteLanguage()
const route = useRoute()
const router = useRouter()
const { data: managedAbout } = await useFetch<AboutContent>('/api/content/about', { default: () => defaultAboutContent })
const aboutContent = computed(() => managedAbout.value || defaultAboutContent)
const profileBlocks = computed(() => buildProfileContentBlocks(aboutContent.value.companyProfile).filter((block) => {
  const body = language.value === 'en' ? block.bodyEn : block.bodyZh
  return block.type === 'image' ? Boolean(block.image) : Boolean(String(body || '').trim())
}))
const profileHighlights = computed(() => aboutContent.value.companyProfile.highlights?.length
  ? aboutContent.value.companyProfile.highlights
  : defaultAboutContent.companyProfile.highlights)
const cultureBlocks = computed(() => buildProfileContentBlocks(aboutContent.value.brandCulture, 'legacy-culture').filter((block) => {
  const body = language.value === 'en' ? block.bodyEn : block.bodyZh
  return block.type === 'image' ? Boolean(block.image) : Boolean(String(body || '').trim())
}))
const qualificationItems = computed(() => (aboutContent.value.qualifications.items || []).filter((item) => isImageUrl(item.fileUrl)))
const brandViItems = computed(() => (aboutContent.value.brandVi.items || []).filter((item) => isImageUrl(item.image)))

useSeoMeta({
  title: () => language.value === 'en' ? 'About us | Hongcai Wanfu' : '关于我们｜红财万富',
  description: () => language.value === 'en' ? 'Learn about Hongcai Wanfu, our brand culture, verified qualifications and visual identity.' : '了解红财万富的公司简介、品牌文化、荣誉资质与企业视觉识别。'
})

const sections = computed(() => [
  { id: 'company-profile' as AboutSection, label: language.value === 'en' ? 'Company profile' : '公司简介', caption: language.value === 'en' ? 'Who we are' : '认识红财万富' },
  { id: 'brand-culture' as AboutSection, label: language.value === 'en' ? 'Brand culture' : '品牌文化', caption: language.value === 'en' ? 'How we work' : '我们的合作原则' },
  { id: 'qualifications' as AboutSection, label: language.value === 'en' ? 'Qualifications' : '荣誉资质', caption: language.value === 'en' ? 'Verified materials' : '真实资料与文件' },
  { id: 'brand-vi' as AboutSection, label: language.value === 'en' ? 'Visual identity' : '企业 VI', caption: language.value === 'en' ? 'Brand standards' : '品牌视觉规范' }
])

const activeSection = ref<AboutSection>('company-profile')
const validSections: AboutSection[] = ['company-profile', 'brand-culture', 'qualifications', 'brand-vi']

watch(() => route.hash, (hash) => {
  const requested = hash.replace('#', '') as AboutSection
  if (validSections.includes(requested)) activeSection.value = requested
}, { immediate: true })

const selectSection = async (section: AboutSection) => {
  activeSection.value = section
  await router.replace({ path: '/about', hash: `#${section}` })
}

function isImageUrl(value: string) {
  return /\.(?:jpe?g|png|webp|gif)(?:\?.*)?$/i.test(value || '')
}

</script>

<template>
  <div class="page page-about">
    <PageHero class="page-hero--inner" title="关于我们" subtitle="认识红财万富，也认识我们的品牌" image="/assets/images/hero-about-shanshui.webp" split-text />

    <section class="about-directory section-space">
      <div class="page-wrap about-directory__layout">
        <aside class="about-directory__aside" :aria-label="language === 'en' ? 'About us sections' : '关于我们栏目'">
          <div class="about-directory__brand">
            <span>ABOUT US</span>
            <strong>{{ language === 'en' ? 'Hongcai Wanfu' : '关于红财万富' }}</strong>
          </div>
          <div class="about-directory__tabs" role="tablist" :aria-label="language === 'en' ? 'About us sections' : '关于我们栏目'">
            <button
              v-for="section in sections"
              :key="section.id"
              type="button"
              role="tab"
              :aria-selected="activeSection === section.id"
              :aria-controls="`about-panel-${section.id}`"
              @click="selectSection(section.id)"
            >
              <span><strong>{{ section.label }}</strong><small>{{ section.caption }}</small></span>
              <Icon name="lucide:arrow-right" />
            </button>
          </div>
          <NuxtLink class="about-directory__contact" to="/contact#inquiry">
            <span>{{ language === 'en' ? 'Sourcing enquiry' : '采购合作' }}</span>
            <strong>{{ language === 'en' ? 'Tell us what you need' : '告诉我们您的采购需求' }}</strong>
            <Icon name="lucide:arrow-up-right" />
          </NuxtLink>
        </aside>

        <main class="about-directory__content">
          <div class="about-directory__trail">
            <span>{{ language === 'en' ? 'Home' : '首页' }}</span>
            <Icon name="lucide:chevron-right" />
            <span>{{ language === 'en' ? 'About us' : '关于我们' }}</span>
            <Icon name="lucide:chevron-right" />
            <strong>{{ sections.find(section => section.id === activeSection)?.label }}</strong>
          </div>

          <article v-show="activeSection === 'company-profile'" id="about-panel-company-profile" class="about-panel" role="tabpanel">
              <header class="about-panel__header">
                <h2>{{ language === 'en' ? 'Company profile' : '公司简介' }}</h2>
                <p>{{ language === 'en' ? aboutContent.companyProfile.introEn : aboutContent.companyProfile.introZh }}</p>
              </header>
              <div class="about-highlights" :aria-label="language === 'en' ? 'Company profile highlights' : '公司简介重点信息'">
                <template v-for="highlight in profileHighlights" :key="highlight.titleZh">
                  <NuxtLink v-if="highlight.to" class="about-highlights__item about-highlights__item--link" :to="highlight.to">
                    <div class="about-highlights__topline">
                      <Icon :name="highlight.icon" />
                      <Icon name="lucide:arrow-up-right" />
                    </div>
                    <div>
                      <h3>{{ language === 'en' ? highlight.titleEn : highlight.titleZh }}</h3>
                      <p>{{ language === 'en' ? highlight.detailEn : highlight.detailZh }}</p>
                    </div>
                  </NuxtLink>
                  <article v-else class="about-highlights__item">
                    <div class="about-highlights__topline">
                      <Icon :name="highlight.icon" />
                    </div>
                    <div>
                      <h3>{{ language === 'en' ? highlight.titleEn : highlight.titleZh }}</h3>
                      <p>{{ language === 'en' ? highlight.detailEn : highlight.detailZh }}</p>
                    </div>
                  </article>
                </template>
              </div>
              <div class="about-profile__flow">
                <template v-for="block in profileBlocks" :key="block.id">
                  <div v-if="block.type === 'text'" class="about-profile__text-block">
                    <p>{{ language === 'en' ? block.bodyEn : block.bodyZh }}</p>
                  </div>
                  <figure v-else-if="block.image" class="about-profile__image-block">
                    <img :src="block.image" :alt="language === 'en' ? block.altEn : block.altZh">
                  </figure>
                </template>
              </div>
          </article>

          <article v-show="activeSection === 'brand-culture'" id="about-panel-brand-culture" class="about-panel" role="tabpanel">
              <header class="about-panel__header">
                <h2>{{ language === 'en' ? 'Brand culture' : '品牌文化' }}</h2>
                <p>{{ language === 'en' ? aboutContent.brandCulture.introEn : aboutContent.brandCulture.introZh }}</p>
              </header>
              <div class="about-profile__flow about-culture__flow">
                <template v-for="block in cultureBlocks" :key="block.id">
                  <div v-if="block.type === 'text'" class="about-profile__text-block">
                    <p>{{ language === 'en' ? block.bodyEn : block.bodyZh }}</p>
                  </div>
                  <figure v-else-if="block.image" class="about-profile__image-block">
                    <img :src="block.image" :alt="language === 'en' ? block.altEn : block.altZh">
                  </figure>
                </template>
              </div>
          </article>

          <article v-show="activeSection === 'qualifications'" id="about-panel-qualifications" class="about-panel" role="tabpanel">
              <header class="about-panel__header">
                <h2>{{ language === 'en' ? 'Qualifications' : '荣誉资质' }}</h2>
              </header>
              <p v-if="!qualificationItems.length" class="about-qualifications__empty">{{ language === 'en' ? 'No qualification images yet.' : '暂无荣誉资质图片。' }}</p>
              <div v-else class="about-qualifications__documents" role="list">
                <article v-for="item in qualificationItems" :key="`${item.fileUrl}-${item.titleZh}`" class="about-qualifications__card" role="listitem">
                  <a class="about-qualifications__preview" :href="item.fileUrl" target="_blank" rel="noreferrer" :aria-label="language === 'en' ? `Open ${item.titleEn || 'qualification document'}` : `查看${item.titleZh || '资质文件'}`">
                    <img :src="item.fileUrl" :alt="language === 'en' ? item.titleEn || 'Qualification image' : item.titleZh || '荣誉资质图片'" loading="lazy">
                    <span><Icon name="lucide:external-link" />{{ language === 'en' ? 'View original' : '查看原图' }}</span>
                  </a>
                  <div class="about-qualifications__card-info">
                    <h3>{{ language === 'en' ? item.titleEn || 'Qualification document' : item.titleZh || '资质文件' }}</h3>
                  </div>
                </article>
              </div>
          </article>

          <article v-show="activeSection === 'brand-vi'" id="about-panel-brand-vi" class="about-panel" role="tabpanel">
              <header class="about-panel__header">
                <h2>{{ language === 'en' ? 'Visual identity' : '企业 VI' }}</h2>
              </header>
              <p v-if="!brandViItems.length" class="about-qualifications__empty">{{ language === 'en' ? 'No visual identity images yet.' : '暂无企业 VI 图片。' }}</p>
              <div v-else class="about-qualifications__documents" role="list" aria-label="企业 VI 图片">
                <article v-for="item in brandViItems" :key="`${item.image}-${item.titleZh}`" class="about-qualifications__card" role="listitem">
                  <a class="about-qualifications__preview" :href="item.image" target="_blank" rel="noreferrer" :aria-label="language === 'en' ? `Open ${item.titleEn || 'visual identity image'}` : `查看${item.titleZh || '企业 VI 图片'}`">
                    <img :src="item.image" :alt="language === 'en' ? item.titleEn || 'Visual identity image' : item.titleZh || '企业 VI 图片'" loading="lazy">
                    <span><Icon name="lucide:external-link" />{{ language === 'en' ? 'View original' : '查看原图' }}</span>
                  </a>
                  <div class="about-qualifications__card-info"><h3>{{ language === 'en' ? item.titleEn || 'Visual identity image' : item.titleZh || '企业 VI 图片' }}</h3></div>
                </article>
              </div>
          </article>
        </main>
      </div>
    </section>
  </div>
</template>
