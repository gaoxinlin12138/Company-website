<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle: string
  image: string
  align?: 'left' | 'center'
  letterSwap?: boolean
  splitText?: boolean
}>()
const { language, t } = useSiteLanguage()
const translatedTitle = computed(() => t(props.title))
const titleCharacters = computed(() => Array.from(translatedTitle.value))
const translatedSubtitle = computed(() => t(props.subtitle))
const subtitleCharacters = computed(() => Array.from(translatedSubtitle.value))
const characterDelay = (index: number) => `${Math.min(index * 42, 336)}ms`
const splitCharacterDelay = (index: number) => `${index * 50}ms`
</script>

<template>
  <section
    class="page-hero"
    :class="[
      `page-hero--${align || 'left'}`,
      {
        'page-hero--letter-pop': props.letterSwap,
        'page-hero--split-text': props.splitText
      }
    ]"
    :style="{ '--hero-image': `url(${image})` }"
  >
    <div class="page-hero__shade"></div>
    <div class="page-wrap page-hero__content">
      <h1 v-if="props.letterSwap || props.splitText" :key="translatedTitle" class="letter-pop-title" :class="{ 'letter-pop-title--latin': language === 'en' }" :aria-label="translatedTitle">
        <span
          v-for="(character, index) in titleCharacters"
          :key="`${character}-${index}`"
          class="letter-pop-title__character"
          :style="{ '--letter-delay': props.splitText ? splitCharacterDelay(index) : characterDelay(index) }"
          aria-hidden="true"
        >
          <span class="letter-pop-title__glyph">{{ character }}</span>
        </span>
      </h1>
      <h1 v-else>{{ translatedTitle }}</h1>
      <p v-if="props.splitText" :key="translatedSubtitle" class="page-hero__subtitle split-text-subtitle" :aria-label="translatedSubtitle">
        <span
          v-for="(character, index) in subtitleCharacters"
          :key="`${character}-${index}`"
          class="split-text-subtitle__character"
          :style="{ '--letter-delay': splitCharacterDelay(index) }"
          aria-hidden="true"
        >{{ character }}</span>
      </p>
      <p v-else-if="props.letterSwap" :key="translatedSubtitle" class="page-hero__subtitle page-hero__subtitle--reveal">{{ translatedSubtitle }}</p>
      <p v-else>{{ translatedSubtitle }}</p>
      <span class="page-hero__accent-line"></span>
    </div>
  </section>
</template>
