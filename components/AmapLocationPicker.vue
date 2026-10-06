<script setup lang="ts">
const props = defineProps<{ latitude: number; longitude: number; zoom: number }>()
const emit = defineEmits<{
  'update:latitude': [value: number]
  'update:longitude': [value: number]
  'update:zoom': [value: number]
}>()

const mapElement = ref<HTMLElement | null>(null)
const searchText = ref('')
const status = ref<'loading' | 'ready' | 'error'>('loading')
const errorMessage = ref('')
const searching = ref(false)
const searchMessage = ref('')
let map: any = null
let geocoder: any = null
let syncTimer: ReturnType<typeof setTimeout> | null = null
const origin = {
  latitude: Number(props.latitude),
  longitude: Number(props.longitude),
  zoom: Math.min(18, Math.max(4, Math.round(Number(props.zoom) || 14))),
}

function emitCenter() {
  if (!map) return
  const center = map.getCenter()
  const zoom = Number(map.getZoom())
  const longitude = Number(Number(center.lng).toFixed(6))
  const latitude = Number(Number(center.lat).toFixed(6))
  const nextZoom = Math.min(18, Math.max(4, Math.round(zoom)))
  if (longitude !== Number(props.longitude)) emit('update:longitude', longitude)
  if (latitude !== Number(props.latitude)) emit('update:latitude', latitude)
  if (nextZoom !== Number(props.zoom)) emit('update:zoom', nextZoom)
}

function scheduleEmitCenter(delay = 180) {
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(() => {
    syncTimer = null
    emitCenter()
  }, delay)
}

function resetOrigin() {
  if (!map) return
  map.setZoomAndCenter(origin.zoom, [origin.longitude, origin.latitude])
  scheduleEmitCenter(450)
}

function searchAddress() {
  const query = searchText.value.trim()
  if (!query || !geocoder) return
  searching.value = true
  searchMessage.value = ''
  geocoder.getLocation(query, (status: string, result: any) => {
    searching.value = false
    if (status === 'complete' && result?.geocodes?.length) {
      const location = result.geocodes[0].location
      map.setZoomAndCenter(Math.max(Number(map.getZoom()), 13), [location.lng, location.lat])
      scheduleEmitCenter(450)
      searchMessage.value = `已定位：${result.geocodes[0].formattedAddress || query}`
    } else {
      searchMessage.value = '没有找到这个地址，请换一个更完整的名称。'
    }
  })
}

async function initMap() {
  try {
    const AMap = await loadAmap()
    if (!mapElement.value) return
    map = new AMap.Map(mapElement.value, {
      viewMode: '2D',
      zoom: origin.zoom,
      zooms: [4, 18],
      center: [origin.longitude, origin.latitude],
      mapStyle: 'amap://styles/normal',
      resizeEnable: true,
      dragEnable: true,
      zoomEnable: true,
      doubleClickZoom: false,
      keyboardEnable: true,
      animateEnable: true,
      jogEnable: true,
    })
    geocoder = new AMap.Geocoder({ city: '全国' })
    map.on('moveend', () => scheduleEmitCenter())
    map.on('zoomend', () => scheduleEmitCenter())
    map.on('click', (event: any) => {
      map.setCenter(event.lnglat)
      scheduleEmitCenter()
    })
    status.value = 'ready'
  } catch (error: any) {
    status.value = 'error'
    errorMessage.value = error?.message || '高德地图加载失败。'
  }
}

watch(() => [props.latitude, props.longitude, props.zoom], ([latitude, longitude, zoom]) => {
  if (!map) return
  const nextZoom = Math.min(18, Math.max(4, Math.round(Number(zoom) || 14)))
  const center = [Number(longitude), Number(latitude)]
  const currentCenter = map.getCenter()
  if (Number.isFinite(center[0]) && Number.isFinite(center[1]) && (Math.abs(currentCenter.lng - center[0]) > 0.000001 || Math.abs(currentCenter.lat - center[1]) > 0.000001)) map.setCenter(center)
  if (Number.isFinite(nextZoom) && nextZoom !== map.getZoom()) map.setZoom(nextZoom)
})

onMounted(initMap)
onBeforeUnmount(() => {
  if (syncTimer) clearTimeout(syncTimer)
  map?.destroy()
})
</script>

<template>
  <div class="amap-picker">
    <div class="amap-picker__toolbar">
      <div class="amap-picker__search"><input v-model="searchText" placeholder="搜索省、市、区或详细地址" @keyup.enter="searchAddress"><button type="button" :disabled="searching || status !== 'ready'" @click="searchAddress">{{ searching ? '搜索中…' : '搜索地址' }}</button></div>
      <button type="button" class="amap-picker__reset" :disabled="status !== 'ready'" @click="resetOrigin">回到初始位置</button>
    </div>
    <div ref="mapElement" class="amap-picker__canvas" role="application" aria-label="高德地图选址">
      <div class="amap-picker__crosshair" aria-hidden="true"><span></span><i></i></div>
      <p v-if="status === 'loading'" class="amap-picker__state">正在加载高德地图…</p>
      <p v-else-if="status === 'error'" class="amap-picker__state is-error">{{ errorMessage }}</p>
    </div>
    <div class="amap-picker__meta"><span>拖动地图或点击地图选点，中心标记就是保存的位置。</span><strong>{{ Number(longitude).toFixed(6) }}, {{ Number(latitude).toFixed(6) }} · {{ Number(zoom) }}级</strong></div>
    <p v-if="searchMessage" class="amap-picker__message">{{ searchMessage }}</p>
  </div>
</template>

<style scoped>
.amap-picker{display:grid;gap:.6rem}.amap-picker__toolbar{display:flex;align-items:center;justify-content:space-between;gap:.7rem}.amap-picker__search{display:flex;min-width:0;flex:1}.amap-picker__search input{min-width:0;flex:1;border:1px solid rgba(23,52,58,.16);padding:.65rem .7rem;background:#fff;color:#17343a;font:inherit;font-size:.76rem}.amap-picker__search button,.amap-picker__reset{border:1px solid #37675d;padding:.65rem .8rem;background:#37675d;color:#fff;font-size:.7rem;font-weight:800;cursor:pointer}.amap-picker__reset{background:#fff;color:#285147;white-space:nowrap}.amap-picker__search button:disabled,.amap-picker__reset:disabled{cursor:not-allowed;opacity:.5}.amap-picker__canvas{position:relative;isolation:isolate;height:460px;overflow:hidden;background:#e6edf0}.amap-picker__crosshair{position:absolute;z-index:2;top:50%;left:50%;width:46px;height:46px;transform:translate(-50%,-50%);pointer-events:none}.amap-picker__crosshair span,.amap-picker__crosshair i{position:absolute;display:block;background:#37675d;box-shadow:0 0 0 2px rgba(255,255,255,.72)}.amap-picker__crosshair span{top:0;left:50%;width:3px;height:46px;transform:translateX(-50%)}.amap-picker__crosshair i{top:50%;left:0;width:46px;height:3px;transform:translateY(-50%)}.amap-picker__state{position:absolute;z-index:3;top:50%;left:50%;margin:0;padding:.7rem .85rem;transform:translate(-50%,-50%);background:rgba(255,255,255,.94);color:#285147;font-size:.75rem;box-shadow:0 8px 20px rgba(23,52,58,.12)}.amap-picker__state.is-error{color:#8e2d27}.amap-picker__meta{display:flex;justify-content:space-between;gap:1rem;color:#526d65;font-size:.7rem;line-height:1.4}.amap-picker__meta strong{color:#285147;font-weight:700;white-space:nowrap}.amap-picker__message{margin:0;color:#285147;font-size:.7rem}@media(max-width:680px){.amap-picker__toolbar{align-items:stretch;flex-direction:column}.amap-picker__reset{width:fit-content}.amap-picker__canvas{height:340px}.amap-picker__meta{align-items:flex-start;flex-direction:column;gap:.2rem}}
</style>
