<script setup>
const props = defineProps({
  items: { type: Array, default: () => [] },
  bend: { type: Number, default: 2.6 },
  borderRadius: { type: Number, default: 0.025 },
  textColor: { type: String, default: '#101d22' },
  font: { type: String, default: '700 28px Manrope, "Noto Sans SC", sans-serif' },
  scrollSpeed: { type: Number, default: 2 },
  scrollEase: { type: Number, default: 0.055 },
  autoRotate: { type: Boolean, default: false },
  autoSpeed: { type: Number, default: 0.85 },
  initialIndex: { type: Number, default: 0 },
  ariaLabel: { type: String, default: 'Circular product gallery' }
})

const root = ref(null)
const failed = ref(false)
let gallery
let resizeObserver
let visibilityObserver
let visibilityHandler
let inView = true
let buildVersion = 0

function lerp(start, end, amount) {
  return start + (end - start) * amount
}

function debounce(callback, delay) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => callback(...args), delay)
  }
}

function createTextTexture(Texture, gl, text, font, color) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return null
  context.font = font
  const fontSize = Number.parseInt(font.match(/(\d+)px/)?.[1] || '28', 10)
  const textWidth = Math.ceil(context.measureText(text).width)
  canvas.width = Math.max(64, textWidth + 32)
  canvas.height = fontSize * 2
  context.font = font
  context.fillStyle = color
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, canvas.width / 2, canvas.height / 2)
  const texture = new Texture(gl, { generateMipmaps: false })
  texture.image = canvas
  return { texture, width: canvas.width, height: canvas.height }
}

function needsProductTreatment(image) {
  const fallback = image.naturalWidth / image.naturalHeight <= 1.05
  try {
    const canvas = document.createElement('canvas')
    const size = 24
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return fallback
    context.drawImage(image, 0, 0, size, size)
    const { data } = context.getImageData(0, 0, size, size)
    let paleOrTransparent = 0
    let sampled = 0
    const edge = 4

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        if (x >= edge && x < size - edge && y >= edge && y < size - edge) continue
        const offset = (y * size + x) * 4
        const red = data[offset]
        const green = data[offset + 1]
        const blue = data[offset + 2]
        const alpha = data[offset + 3]
        const isNeutralWhite = Math.min(red, green, blue) > 235 && Math.max(red, green, blue) - Math.min(red, green, blue) < 18
        if (alpha < 24 || isNeutralWhite) paleOrTransparent += 1
        sampled += 1
      }
    }

    return paleOrTransparent / sampled > 0.52
  } catch {
    return fallback
  }
}

function createCircularGallery(container, options, ogl) {
  const { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } = ogl
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  class Title {
    constructor({ gl, plane, renderer, text, textColor, font }) {
      const result = createTextTexture(Texture, gl, text, font, textColor)
      if (!result) return
      const geometry = new Plane(gl)
      const program = new Program(gl, {
        vertex: `
          attribute vec3 position;
          attribute vec2 uv;
          uniform mat4 modelViewMatrix;
          uniform mat4 projectionMatrix;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragment: `
          precision highp float;
          uniform sampler2D tMap;
          varying vec2 vUv;
          void main() {
            vec4 color = texture2D(tMap, vUv);
            if (color.a < 0.1) discard;
            gl_FragColor = color;
          }
        `,
        uniforms: { tMap: { value: result.texture } },
        transparent: true
      })
      this.mesh = new Mesh(gl, { geometry, program })
      const textHeight = plane.scale.y * 0.095
      const naturalWidth = textHeight * (result.width / result.height)
      const maxWidth = plane.scale.x * 0.82
      const fitScale = Math.min(1, maxWidth / naturalWidth)
      this.mesh.scale.set(naturalWidth * fitScale, textHeight * fitScale, 1)
      this.mesh.position.y = -plane.scale.y * 0.5 - textHeight * fitScale * 0.62
      this.mesh.setParent(plane)
    }
  }

  class Media {
    constructor(settings) {
      Object.assign(this, settings)
      this.extra = 0
      this.createShader()
      this.createMesh()
      this.onResize()
    }

    createShader() {
      const texture = new Texture(this.gl, { generateMipmaps: true, anisotropy: 8 })
      const placeholder = document.createElement('canvas')
      placeholder.width = 1
      placeholder.height = 1
      const placeholderContext = placeholder.getContext('2d')
      if (placeholderContext) {
        placeholderContext.fillStyle = '#ffffff'
        placeholderContext.fillRect(0, 0, 1, 1)
        texture.image = placeholder
      }
      this.program = new Program(this.gl, {
        depthTest: false,
        depthWrite: false,
        vertex: `
          precision highp float;
          attribute vec3 position;
          attribute vec2 uv;
          uniform mat4 modelViewMatrix;
          uniform mat4 projectionMatrix;
          uniform float uTime;
          uniform float uSpeed;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 p = position;
            p.z = (sin(p.x * 4.0 + uTime) + cos(p.y * 2.0 + uTime)) * uSpeed * 0.18;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragment: `
          precision highp float;
          uniform vec2 uImageSizes;
          uniform vec2 uPlaneSizes;
          uniform sampler2D tMap;
          uniform float uBorderRadius;
          uniform float uProductTreatment;
          varying vec2 vUv;

          float roundedBoxSDF(vec2 p, vec2 b, float r) {
            vec2 d = abs(p) - b;
            return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
          }

          void main() {
            float planeAspect = uPlaneSizes.x / uPlaneSizes.y;
            float imageAspect = uImageSizes.x / uImageSizes.y;
            vec2 coverRatio = vec2(
              min(planeAspect / imageAspect, 1.0),
              min(imageAspect / planeAspect, 1.0)
            );
            vec2 coverUv = vUv * coverRatio + (1.0 - coverRatio) * 0.5;
            vec4 color = texture2D(tMap, coverUv);

            if (uProductTreatment > 0.5) {
              // Keep the complete source image inside the card. The UV window
              // expands along the card's wider axis so the source keeps its
              // original aspect ratio and gains a quiet surface around it.
              vec2 containScale = planeAspect > imageAspect
                ? vec2(planeAspect / imageAspect, 1.0)
                : vec2(1.0, imageAspect / planeAspect);
              vec2 containUv = (vUv - 0.5) * containScale + 0.5;
              bool outsideImage = containUv.x < 0.0 || containUv.x > 1.0 || containUv.y < 0.0 || containUv.y > 1.0;
              // Match the page's porcelain-white surface exactly so the
              // product frame disappears into the surrounding section.
              vec3 sampleSurface = vec3(1.0);
              vec4 productColor = outsideImage ? vec4(sampleSurface, 1.0) : texture2D(tMap, containUv);
              float neutralWhite = smoothstep(0.78, 0.955, min(productColor.r, min(productColor.g, productColor.b)));
              float neutralRange = max(productColor.r, max(productColor.g, productColor.b)) - min(productColor.r, min(productColor.g, productColor.b));
              neutralWhite *= 1.0 - smoothstep(0.025, 0.12, neutralRange);
              float backgroundMask = max(neutralWhite, 1.0 - productColor.a);
              color = vec4(mix(productColor.rgb, sampleSurface, backgroundMask), 1.0);
            }
            float distance = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
            float alpha = 1.0 - smoothstep(-0.004, 0.004, distance);
            gl_FragColor = vec4(color.rgb * alpha, color.a * alpha);
          }
        `,
        uniforms: {
          tMap: { value: texture },
          uPlaneSizes: { value: [0, 0] },
          uImageSizes: { value: [1, 1] },
          uSpeed: { value: 0 },
          uTime: { value: Math.random() * 100 },
          uBorderRadius: { value: this.borderRadius },
          uProductTreatment: { value: 0 }
        },
        transparent: true
      })
      const image = new Image()
      image.decoding = 'async'
      let settled = false
      const markReady = () => {
        if (settled) return
        settled = true
        this.onReady?.()
      }
      image.onload = () => {
        texture.image = image
        this.program.uniforms.uImageSizes.value = [image.naturalWidth, image.naturalHeight]
        // Uploaded catalogue images are product cutouts even when their
        // white studio background is not perfectly uniform. Keep editorial
        // scene images untouched while making product cards blend into the
        // surrounding page surface.
        const isUploadedProduct = this.image.includes('/uploads/products/')
        this.program.uniforms.uProductTreatment.value = isUploadedProduct || needsProductTreatment(image) ? 1 : 0
        markReady()
      }
      image.onerror = markReady
      image.src = this.image
    }

    createMesh() {
      this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program })
      this.plane.setParent(this.scene)
      new Title({
        gl: this.gl,
        plane: this.plane,
        renderer: this.renderer,
        text: this.text,
        textColor: this.textColor,
        font: this.font
      })
    }

    onResize({ screen, viewport } = {}) {
      if (screen) this.screen = screen
      if (viewport) this.viewport = viewport
      const scale = this.screen.height / 1500
      // Give the source artwork a taller frame so portrait product renders
      // can stay close to their original proportions instead of looking
      // compressed inside a shallow landscape card.
      this.plane.scale.y = (this.viewport.height * (980 * scale)) / this.screen.height
      this.plane.scale.x = (this.viewport.width * (1120 * scale)) / this.screen.width
      this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y]
      // Keep the loop visually continuous; the old fixed minimum left a
      // conspicuous gap between neighbouring product images on wide screens.
      this.padding = Math.max(0.2, this.viewport.width * 0.004)
      this.width = this.plane.scale.x + this.padding
      this.widthTotal = this.width * this.length
      this.x = this.width * this.index
    }

    update(scroll, direction) {
      this.plane.position.x = this.x - scroll.current - this.extra
      const x = this.plane.position.x
      const halfWidth = this.viewport.width / 2
      if (this.bend === 0) {
        this.plane.position.y = 0
        this.plane.rotation.z = 0
      } else {
        const bend = Math.abs(this.bend)
        const radius = (halfWidth * halfWidth + bend * bend) / (2 * bend)
        const effectiveX = Math.min(Math.abs(x), halfWidth)
        const arc = radius - Math.sqrt(Math.max(0, radius * radius - effectiveX * effectiveX))
        this.plane.position.y = this.bend > 0 ? -arc : arc
        this.plane.rotation.z = (this.bend > 0 ? -1 : 1) * Math.sign(x) * Math.asin(effectiveX / radius)
      }
      const rawSpeed = scroll.current - scroll.last
      const speed = reducedMotion ? 0 : Math.max(-0.12, Math.min(0.12, rawSpeed))
      this.program.uniforms.uTime.value += 0.035
      this.program.uniforms.uSpeed.value = speed
      const planeOffset = this.plane.scale.x / 2
      const viewportOffset = this.viewport.width / 2
      const before = this.plane.position.x + planeOffset < -viewportOffset
      const after = this.plane.position.x - planeOffset > viewportOffset
      if (direction === 'right' && before) this.extra -= this.widthTotal
      if (direction === 'left' && after) this.extra += this.widthTotal
    }
  }

  class GalleryApp {
    constructor() {
      container.classList.remove('is-ready')
      this.destroyed = false
      this.scroll = { ease: reducedMotion ? 0.12 : options.scrollEase, current: 0, target: 0, last: 0, position: 0 }
      this.active = true
      this.pointerId = null
      this.resumeAt = 0
      this.inactiveAt = null
      this.catchUpWhileInactive = false
      this.motionScale = reducedMotion ? 0.72 : 1
      this.lastFrameTime = performance.now()
      this.renderer = new Renderer({
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
        dpr: Math.min(Math.max(window.devicePixelRatio || 1, 1.5), 3)
      })
      this.gl = this.renderer.gl
      this.gl.clearColor(0, 0, 0, 0)
      container.appendChild(this.gl.canvas)
      this.camera = new Camera(this.gl)
      this.camera.fov = 45
      this.camera.position.z = 20
      this.scene = new Transform()
      this.geometry = new Plane(this.gl, { heightSegments: 32, widthSegments: 64 })
      this.onResize()
      const repeatedItems = [...options.items, ...options.items]
      this.expectedMedia = repeatedItems.length
      this.loadedMedia = 0
      this.onMediaReady = () => {
        if (this.destroyed) return
        this.loadedMedia += 1
        if (this.loadedMedia < this.expectedMedia) return
        this.onResize()
        this.readyFrame = requestAnimationFrame(() => {
          if (!this.destroyed) container.classList.add('is-ready')
        })
      }
      this.medias = repeatedItems.map((item, index) => new Media({
        geometry: this.geometry,
        gl: this.gl,
        image: item.image,
        index,
        length: repeatedItems.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: item.text,
        viewport: this.viewport,
        bend: options.bend,
        textColor: options.textColor,
        borderRadius: options.borderRadius,
        font: options.font,
        onReady: this.onMediaReady
      }))
      const startingIndex = Math.min(Math.max(Math.round(options.initialIndex), 0), Math.max(options.items.length - 1, 0))
      const initialPosition = (this.medias[startingIndex]?.width || 0) * startingIndex
      const frameAdvance = options.autoRotate ? options.autoSpeed * this.motionScale / 60 : 0
      const steadyMotionLead = frameAdvance * (1 - this.scroll.ease) / this.scroll.ease
      this.scroll.current = initialPosition
      this.scroll.target = initialPosition + steadyMotionLead
      this.scroll.last = initialPosition
      this.onCheckDebounced = debounce(() => this.snap(), 160)
      this.bindEvents()
      this.update()
    }

    onResize = () => {
      this.screen = { width: container.clientWidth, height: container.clientHeight }
      this.renderer.setSize(this.screen.width, this.screen.height)
      this.camera.perspective({ aspect: this.screen.width / this.screen.height })
      const fov = (this.camera.fov * Math.PI) / 180
      const height = 2 * Math.tan(fov / 2) * this.camera.position.z
      this.viewport = { width: height * this.camera.aspect, height }
      this.medias?.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }))
    }

    pointerDown = (event) => {
      this.pointerId = event.pointerId
      this.resumeAt = Number.POSITIVE_INFINITY
      this.startX = event.clientX
      this.startY = event.clientY
      this.scroll.position = this.scroll.current
      container.setPointerCapture?.(event.pointerId)
      container.classList.add('is-dragging')
    }

    pointerMove = (event) => {
      if (event.pointerId !== this.pointerId) return
      const horizontal = this.startX - event.clientX
      const vertical = this.startY - event.clientY
      if (Math.abs(horizontal) < Math.abs(vertical)) return
      this.scroll.target = this.scroll.position + horizontal * options.scrollSpeed * 0.022
    }

    pointerUp = (event) => {
      if (event.pointerId !== this.pointerId) return
      container.releasePointerCapture?.(event.pointerId)
      this.pointerId = null
      container.classList.remove('is-dragging')
      this.snap()
      this.resumeAt = performance.now() + 1800
    }

    wheel = (event) => {
      const horizontalDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : (event.shiftKey ? event.deltaY : 0)
      if (!horizontalDelta) return
      event.preventDefault()
      this.scroll.target += Math.sign(horizontalDelta) * options.scrollSpeed * 0.55
      this.onCheckDebounced()
      this.resumeAt = performance.now() + 1800
    }

    keydown = (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) return
      event.preventDefault()
      if (event.key === 'Home') this.scroll.target = 0
      else this.scroll.target += (event.key === 'ArrowRight' ? 1 : -1) * options.scrollSpeed * 2.5
      this.onCheckDebounced()
      this.resumeAt = performance.now() + 1800
    }

    snap() {
      const width = this.medias?.[0]?.width
      if (!width) return
      this.scroll.target = Math.round(this.scroll.target / width) * width
    }

    bindEvents() {
      container.addEventListener('pointerdown', this.pointerDown)
      container.addEventListener('pointermove', this.pointerMove)
      container.addEventListener('pointerup', this.pointerUp)
      container.addEventListener('pointercancel', this.pointerUp)
      container.addEventListener('wheel', this.wheel, { passive: false })
      container.addEventListener('keydown', this.keydown)
    }

    setActive(active, catchUp = true) {
      if (this.active === active) {
        if (!active && !catchUp) this.catchUpWhileInactive = false
        return
      }
      this.active = active
      if (active) {
        const now = performance.now()
        if (options.autoRotate && this.catchUpWhileInactive && this.inactiveAt !== null) {
          const inactiveSeconds = Math.max(0, (now - this.inactiveAt) / 1000)
          const cycleWidth = (this.medias?.[0]?.width || 0) * Math.max(options.items.length, 1)
          const elapsedAdvance = cycleWidth
            ? (options.autoSpeed * this.motionScale * inactiveSeconds) % cycleWidth
            : 0
          this.scroll.current += elapsedAdvance
          this.scroll.target += elapsedAdvance
          this.scroll.last += elapsedAdvance
        }
        this.inactiveAt = null
        this.catchUpWhileInactive = false
        this.lastFrameTime = now
        this.update()
      }
      else {
        this.inactiveAt = performance.now()
        this.catchUpWhileInactive = catchUp && options.autoRotate
        cancelAnimationFrame(this.frame)
      }
    }

    update = () => {
      if (!this.active) return
      const now = performance.now()
      const delta = Math.min((now - this.lastFrameTime) / 1000, 0.05)
      this.lastFrameTime = now
      if (options.autoRotate && this.pointerId === null && now >= this.resumeAt) {
        this.scroll.target += options.autoSpeed * this.motionScale * delta
      }
      this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease)
      const direction = this.scroll.current > this.scroll.last ? 'right' : 'left'
      this.medias?.forEach(media => media.update(this.scroll, direction))
      this.renderer.render({ scene: this.scene, camera: this.camera })
      this.scroll.last = this.scroll.current
      this.frame = requestAnimationFrame(this.update)
    }

    destroy() {
      this.destroyed = true
      this.active = false
      cancelAnimationFrame(this.frame)
      cancelAnimationFrame(this.readyFrame)
      container.classList.remove('is-ready')
      container.removeEventListener('pointerdown', this.pointerDown)
      container.removeEventListener('pointermove', this.pointerMove)
      container.removeEventListener('pointerup', this.pointerUp)
      container.removeEventListener('pointercancel', this.pointerUp)
      container.removeEventListener('wheel', this.wheel)
      container.removeEventListener('keydown', this.keydown)
      this.gl.canvas.remove()
    }
  }

  return new GalleryApp()
}

function syncPlayback() {
  gallery?.setActive(inView && !document.hidden, !document.hidden)
}

async function buildGallery() {
  const version = ++buildVersion
  gallery?.destroy()
  gallery = undefined
  failed.value = false
  await nextTick()
  if (!root.value || !props.items.length) return
  try {
    const ogl = await import('ogl')
    if (version !== buildVersion || !root.value) return
    gallery = createCircularGallery(root.value, {
      items: props.items,
      bend: props.bend,
      borderRadius: props.borderRadius,
      textColor: props.textColor,
      font: props.font,
      scrollSpeed: props.scrollSpeed,
      scrollEase: props.scrollEase,
      autoRotate: props.autoRotate,
      autoSpeed: props.autoSpeed,
      initialIndex: props.initialIndex
    }, ogl)
    syncPlayback()
  } catch (error) {
    failed.value = true
    console.error('CircularGallery failed to initialise', error)
  }
}

onMounted(() => {
  resizeObserver = new ResizeObserver(() => gallery?.onResize())
  if (root.value) resizeObserver.observe(root.value)
  visibilityObserver = new IntersectionObserver(([entry]) => {
    inView = Boolean(entry?.isIntersecting)
    syncPlayback()
  }, { threshold: 0.05 })
  if (root.value) visibilityObserver.observe(root.value)
  visibilityHandler = syncPlayback
  document.addEventListener('visibilitychange', visibilityHandler)
  buildGallery()
})

watch(() => [props.items, props.bend, props.borderRadius, props.textColor, props.initialIndex], buildGallery, { deep: true })

onBeforeUnmount(() => {
  buildVersion += 1
  gallery?.destroy()
  resizeObserver?.disconnect()
  visibilityObserver?.disconnect()
  document.removeEventListener('visibilitychange', visibilityHandler)
})
</script>

<template>
  <div
    ref="root"
    class="circular-gallery"
    tabindex="0"
    role="region"
    :aria-label="ariaLabel"
  >
    <div v-if="failed" class="circular-gallery__fallback" aria-hidden="true">
      <article v-for="item in items" :key="`${item.image}-${item.text}`">
        <img :src="item.image" :alt="item.text">
        <strong>{{ item.text }}</strong>
      </article>
    </div>
    <ul class="circular-gallery__accessible">
      <li v-for="item in items" :key="`accessible-${item.image}-${item.text}`">{{ item.text }}</li>
    </ul>
  </div>
</template>

<style scoped>
.circular-gallery {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
}

.circular-gallery.is-dragging { cursor: grabbing; }
.circular-gallery:focus-visible { outline: 2px solid var(--red); outline-offset: -4px; }
.circular-gallery :deep(canvas) { position: absolute; inset: 0; width: 100%; height: 100%; display: block; opacity: 0; transition: opacity .32s cubic-bezier(.16,1,.3,1); }
.circular-gallery.is-ready :deep(canvas) { opacity: 1; }

.circular-gallery__accessible {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.circular-gallery__fallback {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  overflow-x: auto;
  padding: 1.5rem;
}

.circular-gallery__fallback article { flex: 0 0 min(72vw, 310px); background: var(--white); }
.circular-gallery__fallback img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }
.circular-gallery__fallback strong { display: block; padding: .8rem; color: var(--ink); font-size: .82rem; }

@media (prefers-reduced-motion: reduce) {
  .circular-gallery { scroll-behavior: auto; }
  .circular-gallery :deep(canvas) { transition-duration: .12s; }
}
</style>
