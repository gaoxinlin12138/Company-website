<script setup lang="ts">
type GalleryProduct = {
  id?: string
  name: string
  nameEn?: string
  category: string
  categoryEn?: string
  material: string
  materialEn?: string
  model?: string
  image: string
}

const props = defineProps<{ products: GalleryProduct[] }>()
const { language } = useSiteLanguage()

const galleryItems = computed(() => props.products.map((product) => {
  const name = language.value === 'en' ? (product.nameEn || product.name) : product.name
  const model = product.model ? ` · ${product.model}` : ''
  return {
    image: product.image,
    text: `${name}${model}`
  }
}))
</script>

<template>
  <section
    class="product-gallery"
    :class="{ 'is-empty': !products.length }"
    :aria-label="language === 'en' ? 'Recommended product gallery' : '推荐产品弧形画廊'"
  >
    <p v-if="!products.length" class="product-gallery__empty" role="status">
      {{ language === 'en' ? 'No published products yet.' : '暂无已发布产品。' }}
    </p>

    <template v-else>
      <div class="product-gallery__stage">
        <CircularGallery
          :items="galleryItems"
          :bend="1.55"
          :border-radius="0.018"
          text-color="#101d22"
          font="700 28px Manrope, 'Noto Sans SC', sans-serif"
          :scroll-speed="2"
          :scroll-ease="0.055"
          auto-rotate
          :auto-speed="2.55"
          :initial-index="3"
          :aria-label="language === 'en'
            ? 'Circular product gallery. Drag horizontally or use the left and right arrow keys.'
            : '弧形产品画廊，可横向拖动或使用左右方向键浏览。'"
        />
      </div>

      <div class="product-gallery__guide" aria-hidden="true">
        <span></span>
        <p>{{ language === 'en' ? 'Auto left · drag to browse' : '自动向左 · 拖动浏览' }}</p>
        <Icon name="lucide:move-left" />
      </div>
    </template>
  </section>
</template>

<style scoped>
.product-gallery {
  --gallery-edge-fade: clamp(28px, 5vw, 72px);
  position: relative;
  min-height: 660px;
  overflow: hidden;
  border: 0;
  background: #fff;
  isolation: isolate;
}

.product-gallery__stage {
  height: 660px;
  background: #fff;
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent 0,
    #000 var(--gallery-edge-fade),
    #000 calc(100% - var(--gallery-edge-fade)),
    transparent 100%
  );
  mask-image: linear-gradient(
    90deg,
    transparent 0,
    #000 var(--gallery-edge-fade),
    #000 calc(100% - var(--gallery-edge-fade)),
    transparent 100%
  );
}

.product-gallery__guide {
  position: absolute;
  right: 1.25rem;
  bottom: 1rem;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: .55rem;
  color: var(--muted);
  font-size: .68rem;
  pointer-events: none;
}

.product-gallery__guide span { width: 30px; height: 1px; background: var(--red); }
.product-gallery__guide p { margin: 0; }
.product-gallery__guide svg { width: 16px; height: 16px; color: var(--ink); }
.product-gallery__empty { margin: 0; padding: 4rem 1.5rem; color: var(--muted); text-align: center; }
.product-gallery.is-empty { min-height: 0; }

@media (max-width: 720px) {
  .product-gallery { --gallery-edge-fade: 24px; min-height: 520px; }
  .product-gallery__stage { height: 520px; }
  .product-gallery__guide { right: .8rem; bottom: .7rem; }
  .product-gallery__guide span { width: 22px; }
}
</style>
