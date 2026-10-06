<script setup lang="ts">
const props = defineProps<{
  latitude: number
  longitude: number
  zoom: number
  link: string
  label: string
  openText: string
  errorText: string
}>()

const mapElement = ref<HTMLElement | null>(null)
const status = ref<'loading' | 'ready' | 'error'>('loading')
const errorMessage = ref('')
let map: any = null

async function initMap() {
  try {
    const AMap = await loadAmap()
    if (!mapElement.value) return
    map = new AMap.Map(mapElement.value, {
      viewMode: '2D',
      zoom: Math.min(18, Math.max(4, Math.round(Number(props.zoom) || 14))),
      zooms: [4, 18],
      center: [props.longitude, props.latitude],
      mapStyle: 'amap://styles/normal',
      resizeEnable: true,
      dragEnable: false,
      zoomEnable: false,
      doubleClickZoom: false,
      keyboardEnable: false,
      jogEnable: false,
    })
    status.value = 'ready'
  } catch (error: any) {
    status.value = 'error'
    errorMessage.value = error?.message || props.errorText
  }
}

onMounted(initMap)
onBeforeUnmount(() => map?.destroy())
</script>

<template>
  <div class="contact-location__map amap-location-display">
    <div ref="mapElement" class="amap-location-display__canvas"></div>
    <span class="location-map__shade" aria-hidden="true"></span>
    <span class="location-map__marker" aria-hidden="true"><span class="location-map__pin"><Icon name="lucide:map-pin" /></span><span class="location-map__label">{{ label }}</span></span>
    <span v-if="status === 'loading'" class="amap-location-display__state">地图加载中…</span>
    <span v-else-if="status === 'error'" class="amap-location-display__state is-error">{{ errorMessage }}</span>
    <a class="location-map__open" :href="link" target="_blank" rel="noopener noreferrer"><Icon name="lucide:external-link" />{{ openText }}</a>
  </div>
</template>

<style scoped>
.amap-location-display__canvas{position:absolute;inset:0}.amap-location-display__state{position:absolute;z-index:3;top:50%;left:50%;padding:.55rem .7rem;transform:translate(-50%,-50%);background:rgba(255,255,255,.92);color:#285147;font-size:.7rem;box-shadow:0 8px 20px rgba(23,52,58,.12)}.amap-location-display__state.is-error{color:#8e2d27}
</style>
