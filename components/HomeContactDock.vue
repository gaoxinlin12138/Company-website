<script setup lang="ts">
import { defaultSocialContactContent, type SocialContactContent } from '~/data/site-content'

const { language } = useSiteLanguage()
const root = ref<HTMLElement | null>(null)
const open = ref(false)
const activeId = ref('')
let hideTimer: ReturnType<typeof setTimeout> | undefined

const { data: managedContent } = await useFetch<SocialContactContent>('/api/content/social-contact', {
  default: () => defaultSocialContactContent,
})

const content = computed(() => managedContent.value || defaultSocialContactContent)
const enabledChannels = computed(() => content.value.channels.filter(channel => channel.enabled))

function showMenu() {
  if (hideTimer) clearTimeout(hideTimer)
  open.value = true
}

function hideMenu() {
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = undefined
  open.value = false
  activeId.value = ''
}

function scheduleHide() {
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(hideMenu, 500)
}

function toggleMenu(event: MouseEvent) {
  // A real mouse click fires after mouseenter, so the menu is already open.
  // Keep it open on hover-capable devices; touch and keyboard activation toggle it.
  if (event.detail > 0 && window.matchMedia('(hover: hover)').matches) {
    showMenu()
    return
  }

  open.value ? hideMenu() : showMenu()
}

function selectChannel(id: string) {
  activeId.value = activeId.value === id ? '' : id
}

function handleFocusOut(event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  if (next && root.value?.contains(next)) return
  hideMenu()
}

function handlePointerDown(event: PointerEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) hideMenu()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') hideMenu()
}

onMounted(() => {
  document.addEventListener('pointerdown', handlePointerDown)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  if (hideTimer) clearTimeout(hideTimer)
  document.removeEventListener('pointerdown', handlePointerDown)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <aside
    ref="root"
    class="contact-dock"
    :class="{ 'is-open': open }"
    @mouseenter="showMenu"
    @mouseleave="scheduleHide"
    @focusout="handleFocusOut"
  >
    <div id="social-contact-menu" class="contact-dock__menu" :aria-hidden="!open">
      <div
        v-for="channel in enabledChannels"
        :key="channel.id"
        class="contact-dock__item"
        :class="{ 'is-active': activeId === channel.id }"
      >
        <button
          type="button"
          :aria-label="`${language === 'en' ? channel.nameEn : channel.nameZh} ${language === 'en' ? 'QR code' : '联系二维码'}`"
          :aria-expanded="activeId === channel.id"
          @click="selectChannel(channel.id)"
        >
          <span><Icon :name="channel.icon" /></span>
          <strong>{{ language === 'en' ? channel.nameEn : channel.nameZh }}</strong>
        </button>

        <section class="contact-dock__qr-card" :aria-label="language === 'en' ? channel.nameEn : channel.nameZh" @mouseenter="showMenu" @mouseleave="scheduleHide">
          <header>
            <span><Icon :name="channel.icon" /></span>
            <div>
              <h2>{{ language === 'en' ? channel.nameEn : channel.nameZh }}</h2>
            </div>
          </header>
          <div class="contact-dock__qr">
            <img v-if="channel.qrImage" :src="channel.qrImage" width="240" height="240" loading="lazy" :alt="`${language === 'en' ? channel.nameEn : channel.nameZh} QR code`">
            <template v-else>
              <Icon name="lucide:qr-code" />
            </template>
          </div>
        </section>
      </div>

    </div>

    <button
      class="contact-dock__trigger"
      type="button"
      aria-controls="social-contact-menu"
      :aria-expanded="open"
      @mouseenter="showMenu"
      @click="toggleMenu"
    >
      <span class="contact-dock__pulse"><Icon name="lucide:messages-square" /></span>
      <span>{{ language === 'en' ? 'Contact us' : '联系咨询' }}</span>
      <Icon :name="open ? 'lucide:chevron-down' : 'lucide:chevron-up'" />
    </button>
  </aside>
</template>

<style scoped>
.contact-dock {
  position: fixed;
  right: 1.35rem;
  bottom: clamp(4.5rem, 10vh, 7rem);
  z-index: 48;
  display: grid;
  justify-items: end;
  gap: .45rem;
}

.contact-dock__trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: .65rem;
  min-height: 52px;
  border: 0;
  border-radius: 999px;
  padding: .38rem .85rem .38rem .38rem;
  background: #c64135;
  color: #fff;
  box-shadow: 0 14px 32px rgba(142,45,39, .28);
  font-size: .74rem;
  font-weight: 800;
  cursor: pointer;
  transition: background .25s var(--ease), color .25s var(--ease), box-shadow .25s var(--ease), transform .25s var(--ease);
}

.contact-dock__trigger:hover {
  background: #a9322b;
  color: #fff;
  box-shadow: 0 18px 40px rgba(142,45,39, .34);
  transform: translateY(-2px);
}

.contact-dock.is-open .contact-dock__trigger {
  background: #a9322b;
  color: #fff;
}

.contact-dock__trigger:focus-visible,
.contact-dock__item > button:focus-visible {
  outline: 2px solid var(--red);
  outline-offset: 3px;
}

.contact-dock__trigger > svg {
  width: 14px;
  height: 14px;
  color: rgba(255,255,255,.82);
  transition: color .25s ease, transform .25s var(--ease);
}

.contact-dock.is-open .contact-dock__trigger > svg {
  color: #fff;
}

.contact-dock__pulse {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #fff;
  color: #c64135;
  transition: background .25s ease, transform .25s var(--ease);
}

.contact-dock__trigger:hover .contact-dock__pulse,
.contact-dock.is-open .contact-dock__pulse {
  background: #fff;
  color: #a9322b;
  transform: rotate(-6deg);
}

.contact-dock__pulse svg {
  width: 16px;
  height: 16px;
}

.contact-dock__menu {
  position: absolute;
  right: 0;
  bottom: calc(100% + .45rem);
  width: 154px;
  display: grid;
  gap: 2px;
  border-radius: 14px;
  padding: 4px;
  overflow: visible;
  background: #f6f8f5;
  box-shadow: 0 18px 40px rgba(7,20,26, .18);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(14px) scaleY(.92);
  transform-origin: 50% 100%;
  transition: opacity .22s var(--ease), visibility .22s var(--ease), transform .32s var(--ease);
}

.contact-dock.is-open .contact-dock__menu {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: none;
}

.contact-dock__item {
  position: relative;
}

.contact-dock__item > button {
  width: 100%;
  min-height: 48px;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  align-items: center;
  gap: .55rem;
  border: 0;
  border-radius: 10px;
  padding: .45rem .7rem;
  background: #f6f8f5;
  color: var(--ink);
  text-align: left;
  cursor: pointer;
  transition: background .18s ease, color .18s ease;
}

.contact-dock__item > button:hover,
.contact-dock__item:focus-within > button,
.contact-dock__item.is-active > button {
  background: var(--ink);
  color: #fff;
}

.contact-dock__item > button > span {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  background: #eef0ec;
  color: var(--ink);
}

.contact-dock__item > button > span svg {
  width: 15px;
  height: 15px;
}

.contact-dock__item > button strong {
  min-width: 0;
  overflow: hidden;
  font-size: .68rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-dock__qr-card {
  position: absolute;
  right: calc(100% + .65rem);
  bottom: 0;
  width: 190px;
  padding: .85rem;
  background: #f6f8f5;
  color: var(--ink);
  box-shadow: 0 20px 46px rgba(7,20,26, .24);
  opacity: 0;
  visibility: hidden;
  transform: translateX(12px);
  pointer-events: none;
  transition: opacity .2s var(--ease), visibility .2s var(--ease), transform .28s var(--ease);
}

.contact-dock__item:hover .contact-dock__qr-card,
.contact-dock__item:focus-within .contact-dock__qr-card,
.contact-dock__item.is-active .contact-dock__qr-card {
  opacity: 1;
  visibility: visible;
  transform: none;
  pointer-events: auto;
}

.contact-dock__qr-card::after {
  content: '';
  position: absolute;
  right: -.42rem;
  bottom: 1rem;
  width: .85rem;
  height: .85rem;
  background: #f6f8f5;
  transform: rotate(45deg);
}

.contact-dock__qr-card header {
  display: flex;
  align-items: center;
  gap: .6rem;
  margin-bottom: .7rem;
}

.contact-dock__qr-card header > span {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  background: var(--ink);
  color: #fff;
}

.contact-dock__qr-card header svg {
  width: 16px;
  height: 16px;
}

.contact-dock__qr-card h2 {
  margin: 0;
  font-size: .82rem;
}

.contact-dock__qr-card header strong {
  display: block;
  max-width: 125px;
  margin-top: .15rem;
  overflow: hidden;
  color: var(--muted);
  font-size: .58rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-dock__qr {
  width: 100%;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  background: #f0eee8;
  color: #8a9497;
}

.contact-dock__qr img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
}

.contact-dock__qr > svg {
  width: 32px;
  height: 32px;
}

@media (max-width: 600px) {
  .contact-dock {
    right: max(.75rem, env(safe-area-inset-right));
    bottom: max(4.5rem, calc(env(safe-area-inset-bottom) + 4.5rem));
  }

  .contact-dock__trigger {
    min-height: 48px;
    padding: 0 .85rem;
  }

  .contact-dock__menu {
    width: 144px;
  }

  .contact-dock__qr-card {
    right: calc(100% + .45rem);
    width: min(188px, calc(100vw - 174px));
    padding: .7rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .contact-dock__menu,
  .contact-dock__qr-card,
  .contact-dock__trigger {
    transition: none;
  }
}
</style>
