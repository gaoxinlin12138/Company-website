<script setup lang="ts">
import { gcj02ToWgs84, pointToLocation, tilePoint, wgs84ToGcj02 } from '~/utils/geo'

type LocationProps = {
  latitude: number
  longitude: number
  zoom: number
}

const props = defineProps<LocationProps>()
const emit = defineEmits<{
  'update:latitude': [value: number]
  'update:longitude': [value: number]
  'update:zoom': [value: number]
}>()

const mapElement = ref<HTMLElement | null>(null)
const viewport = reactive({ width: 640, height: 460 })
const origin = {
  latitude: Number.isFinite(Number(props.latitude)) ? Number(props.latitude) : 28.008387,
  longitude: Number.isFinite(Number(props.longitude)) ? Number(props.longitude) : 120.646399,
  zoom: Math.min(18, Math.max(4, Math.round(Number(props.zoom) || 14))),
}
const view = reactive({
  latitude: origin.latitude,
  longitude: origin.longitude,
  zoom: origin.zoom,
})
const dragging = ref(false)
let resizeObserver: ResizeObserver | null = null
let dragState: { pointerId: number; startX: number; startY: number; worldX: number; worldY: number; moved: boolean } | null = null

const centerPoint = computed(() => {
  const wgs84 = gcj02ToWgs84(view.latitude, view.longitude, true)
  return tilePoint(wgs84.latitude, wgs84.longitude, view.zoom)
})

const mapTiles = computed(() => {
  const point = centerPoint.value
  const tileCount = 2 ** view.zoom
  const tiles: Array<{ key: string; src: string; left: number; top: number }> = []
  for (let y = point.tileY - 3; y <= point.tileY + 3; y += 1) {
    if (y < 0 || y >= tileCount) continue
    for (let x = point.tileX - 4; x <= point.tileX + 4; x += 1) {
      const wrappedX = ((x % tileCount) + tileCount) % tileCount
      tiles.push({
        key: `${x}-${y}`,
        src: `https://tile.openstreetmap.de/${view.zoom}/${wrappedX}/${y}.png`,
        left: (x - point.tileX) * 256 + viewport.width / 2 - point.offsetX * 256,
        top: (y - point.tileY) * 256 + viewport.height / 2 - point.offsetY * 256,
      })
    }
  }
  return tiles
})

function emitView() {
  emit('update:latitude', Number(view.latitude.toFixed(6)))
  emit('update:longitude', Number(view.longitude.toFixed(6)))
  emit('update:zoom', view.zoom)
}

function setCenterFromWgs84(latitude: number, longitude: number, shouldEmit = true) {
  const gcj02 = wgs84ToGcj02(latitude, longitude, true)
  view.latitude = gcj02.latitude
  view.longitude = gcj02.longitude
  if (shouldEmit) emitView()
}

function onPointerDown(event: PointerEvent) {
  const point = centerPoint.value
  dragState = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, worldX: point.x, worldY: point.y, moved: false }
  dragging.value = true
  mapElement.value?.setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!dragState || dragState.pointerId !== event.pointerId) return
  const deltaX = event.clientX - dragState.startX
  const deltaY = event.clientY - dragState.startY
  if (Math.abs(deltaX) + Math.abs(deltaY) > 3) dragState.moved = true
  const location = pointToLocation(dragState.worldX - deltaX / 256, dragState.worldY - deltaY / 256, view.zoom)
  setCenterFromWgs84(location.latitude, location.longitude)
}

function centerOnPointer(event: PointerEvent) {
  if (!mapElement.value) return
  const rect = mapElement.value.getBoundingClientRect()
  const point = centerPoint.value
  const worldX = point.x + (event.clientX - rect.left - viewport.width / 2) / 256
  const worldY = point.y + (event.clientY - rect.top - viewport.height / 2) / 256
  const location = pointToLocation(worldX, worldY, view.zoom)
  setCenterFromWgs84(location.latitude, location.longitude)
}

function onPointerUp(event: PointerEvent) {
  if (!dragState || dragState.pointerId !== event.pointerId) return
  const wasClick = !dragState.moved
  mapElement.value?.releasePointerCapture(event.pointerId)
  dragState = null
  dragging.value = false
  if (wasClick) centerOnPointer(event)
  emitView()
}

function changeZoom(delta: number) {
  const nextZoom = Math.min(18, Math.max(4, view.zoom + delta))
  if (nextZoom === view.zoom) return
  view.zoom = nextZoom
  emitView()
}

function resetOrigin() {
  view.latitude = origin.latitude
  view.longitude = origin.longitude
  view.zoom = origin.zoom
  emitView()
}

watch(() => [props.latitude, props.longitude, props.zoom], ([latitude, longitude, zoom]) => {
  if (dragging.value) return
  if (Number.isFinite(Number(latitude))) view.latitude = Number(latitude)
  if (Number.isFinite(Number(longitude))) view.longitude = Number(longitude)
  if (Number.isFinite(Number(zoom))) view.zoom = Math.min(18, Math.max(4, Math.round(Number(zoom))))
})

onMounted(() => {
  if (!mapElement.value) return
  const updateSize = () => {
    if (!mapElement.value) return
    viewport.width = mapElement.value.clientWidth || 640
    viewport.height = mapElement.value.clientHeight || 460
  }
  updateSize()
  resizeObserver = new ResizeObserver(updateSize)
  resizeObserver.observe(mapElement.value)
})

onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<template>
  <div class="location-map-picker">
    <div ref="mapElement" class="location-map-picker__canvas" :class="{ 'is-dragging': dragging }" role="application" aria-label="拖动地图选择位置" @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp" @pointercancel="onPointerUp">
      <img v-for="tile in mapTiles" :key="tile.key" class="location-map-picker__tile" :src="tile.src" alt="" aria-hidden="true" :style="{ left: `${tile.left}px`, top: `${tile.top}px` }">
      <div class="location-map-picker__shade" aria-hidden="true"></div>
      <div class="location-map-picker__crosshair" aria-hidden="true"><span></span><i></i></div>
      <div class="location-map-picker__zoom" aria-label="地图缩放">
        <button type="button" aria-label="放大地图" :disabled="view.zoom >= 18" @pointerdown.stop @click.stop="changeZoom(1)">+</button>
        <button type="button" aria-label="缩小地图" :disabled="view.zoom <= 4" @pointerdown.stop @click.stop="changeZoom(-1)">−</button>
      </div>
      <button type="button" class="location-map-picker__origin" @pointerdown.stop @click.stop="resetOrigin">回到初始位置</button>
    </div>
    <div class="location-map-picker__meta"><span>拖动或点击地图，让目标位置对准中心标记</span><strong>{{ view.longitude.toFixed(6) }}, {{ view.latitude.toFixed(6) }} · {{ view.zoom }}级</strong></div>
  </div>
</template>

<style scoped>
.location-map-picker{display:grid;gap:.55rem}.location-map-picker__canvas{position:relative;isolation:isolate;height:460px;overflow:hidden;touch-action:none;cursor:grab;background:#dfeaf0;user-select:none}.location-map-picker__canvas.is-dragging{cursor:grabbing}.location-map-picker__tile{position:absolute;width:256px;height:256px;display:block;max-width:none;pointer-events:none}.location-map-picker__shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,.02),rgba(15,42,54,.08))}.location-map-picker__crosshair{position:absolute;top:50%;left:50%;width:46px;height:46px;transform:translate(-50%,-50%);pointer-events:none}.location-map-picker__crosshair span,.location-map-picker__crosshair i{position:absolute;display:block;background:#37675d;box-shadow:0 0 0 2px rgba(255,255,255,.72)}.location-map-picker__crosshair span{top:0;left:50%;width:3px;height:46px;transform:translateX(-50%)}.location-map-picker__crosshair i{top:50%;left:0;width:46px;height:3px;transform:translateY(-50%)}.location-map-picker__zoom{position:absolute;right:.8rem;bottom:.8rem;display:grid;gap:.3rem}.location-map-picker__zoom button{width:34px;height:34px;border:1px solid rgba(23,52,58,.16);background:rgba(255,255,255,.92);color:#17343a;font-size:1.2rem;line-height:1;cursor:pointer}.location-map-picker__zoom button:disabled{cursor:not-allowed;opacity:.45}.location-map-picker__origin{position:absolute;left:.8rem;bottom:.8rem;border:1px solid rgba(23,52,58,.16);padding:.55rem .7rem;background:rgba(255,255,255,.94);color:#285147;font-size:.7rem;font-weight:700;cursor:pointer}.location-map-picker__meta{display:flex;justify-content:space-between;gap:1rem;color:#526d65;font-size:.7rem;line-height:1.4}.location-map-picker__meta strong{color:#285147;font-weight:700;white-space:nowrap}@media(max-width:680px){.location-map-picker__canvas{height:340px}.location-map-picker__meta{align-items:flex-start;flex-direction:column;gap:.2rem}}
</style>
