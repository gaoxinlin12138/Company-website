<script setup lang="ts">
import { defaultContactContent, type ContactContent } from '~/data/site-content'
import { gcj02ToWgs84, tilePoint } from '~/utils/geo'

const { language, t } = useSiteLanguage()
const runtimeConfig = useRuntimeConfig()
const hasAmap = computed(() => Boolean(runtimeConfig.public.amapKey))
const { data: managedContact } = await useFetch<ContactContent>('/api/content/contact', { default: () => defaultContactContent })
const contactContent = computed(() => managedContact.value || defaultContactContent)
// 高德分享链接使用 GCJ-02；底图使用 OpenStreetMap/WGS-84，因此预先换算底图中心点，避免定位点产生偏移。
const defaultMapLocation = { latitude: 28.008387, longitude: 120.646399, zoom: 14, link: '' }

function mapNumber(value: unknown, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function amapMarkerUrl(longitude: number, latitude: number) {
  return `https://uri.amap.com/marker?position=${longitude.toFixed(6)},${latitude.toFixed(6)}&name=${encodeURIComponent('公司位置')}`
}

const mapLocation = computed(() => {
  const configured = contactContent.value.location as ContactContent['location'] & { mapLink?: string; latitude?: number; longitude?: number; zoom?: number }
  const latitude = mapNumber(configured.latitude, defaultMapLocation.latitude)
  const longitude = mapNumber(configured.longitude, defaultMapLocation.longitude)
  return {
    latitude,
    longitude,
    zoom: Math.min(18, Math.max(4, Math.round(mapNumber(configured.zoom, defaultMapLocation.zoom)))),
    link: String(configured.mapLink || '').trim() || amapMarkerUrl(longitude, latitude)
  }
})

const mapTiles = computed(() => {
  const wgs84 = gcj02ToWgs84(mapLocation.value.latitude, mapLocation.value.longitude)
  const point = tilePoint(wgs84.latitude, wgs84.longitude, mapLocation.value.zoom)
  const tiles = []
  for (let y = point.tileY - 1; y <= point.tileY + 1; y += 1) {
    for (let x = point.tileX - 2; x <= point.tileX + 2; x += 1) {
      const tileCount = 2 ** mapLocation.value.zoom
      const wrappedX = ((x % tileCount) + tileCount) % tileCount
      tiles.push({
        key: `${x}-${y}`,
        src: `https://tile.openstreetmap.de/${mapLocation.value.zoom}/${wrappedX}/${y}.png`,
        left: (x - point.tileX) * 256 + 320 - point.offsetX * 256,
        top: (y - point.tileY) * 256 + 180 - point.offsetY * 256,
      })
    }
  }
  return tiles
})
useSeoMeta({
  title: () => language.value === 'en' ? 'Contact us | Hongcai Wanfu' : '联系我们｜红财万富',
  description: () => language.value === 'en' ? 'Contact Hongcai Wanfu, find our location and submit a sourcing enquiry.' : '查看红财万富联系方式、地理位置并提交采购需求。'
})

const submitted = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const inquiry = reactive({ name: '', company: '', email: '', phone: '', direction: '', product: '', quantity: '', message: '' })
type InquiryField = keyof typeof inquiry
const inquiryFieldErrors = reactive<Record<InquiryField, string>>({ name: '', company: '', email: '', phone: '', direction: '', product: '', quantity: '', message: '' })

const allowedDirections = ['批发与经销', '外贸采购', '工程项目']
const allowedProducts = ['卫浴产品', '卫浴五金', '安装及配件']
const fieldError = (field: InquiryField, zh: string, en: string) => { inquiryFieldErrors[field] = language.value === 'en' ? en : zh }
const clearInquiryError = (field: InquiryField) => { inquiryFieldErrors[field] = '' }

function validateInquiryField(field: InquiryField) {
  const value = inquiry[field].trim()
  clearInquiryError(field)
  if (field === 'name' && (value.length < 2 || value.length > 30 || !/^[\p{L}\p{M} .·'-]+$/u.test(value))) fieldError(field, '姓名需填写 2–30 个中文或英文字符。', 'Enter 2–30 letters or Chinese characters.')
  if (field === 'company' && (value.length < 2 || value.length > 80 || /[<>]/.test(value))) fieldError(field, '公司名称需填写 2–80 个字符。', 'Enter a company name with 2–80 characters.')
  if (field === 'email' && (value.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value))) fieldError(field, '请输入有效的邮箱地址。', 'Enter a valid email address.')
  if (field === 'phone' && (value.length < 7 || value.length > 25 || !/^[0-9+()\-\s]+$/.test(value))) fieldError(field, '电话需为 7–25 位数字，可包含 +、空格或短横线。', 'Use 7–25 digits; +, spaces, parentheses and hyphens are allowed.')
  if (field === 'direction' && !allowedDirections.includes(value)) fieldError(field, '请选择采购方向。', 'Choose a sourcing direction.')
  if (field === 'product' && !allowedProducts.includes(value)) fieldError(field, '请选择感兴趣的产品。', 'Choose an interested product.')
  if (field === 'quantity' && value && (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 999999999)) fieldError(field, '数量需填写 1–999999999 之间的整数。', 'Enter a whole number from 1 to 999999999.')
  if (field === 'message' && value.length > 1000) fieldError(field, '需求说明不能超过 1000 个字符。', 'Keep the requirement within 1000 characters.')
  return !inquiryFieldErrors[field]
}

function validateInquiry() {
  ;(['name', 'company', 'email', 'phone', 'direction', 'product', 'quantity', 'message'] as InquiryField[]).forEach(validateInquiryField)
  return !Object.values(inquiryFieldErrors).some(Boolean)
}

async function submitInquiry() {
  submitted.value = false
  errorMessage.value = ''
  if (!validateInquiry()) {
    const firstInvalid = (Object.keys(inquiryFieldErrors) as InquiryField[]).find(field => inquiryFieldErrors[field])
    if (firstInvalid) nextTick(() => document.getElementById(`inquiry-${firstInvalid}`)?.focus())
    return
  }
  submitting.value = true
  try {
    const details = [inquiry.quantity ? `${language.value === 'en' ? 'Estimated quantity' : '预计数量'}：${inquiry.quantity}` : '', inquiry.message].filter(Boolean).join('\n')
    await $fetch('/api/inquiries', { method: 'POST', body: { name: inquiry.name, company: inquiry.company, email: inquiry.email, phone: inquiry.phone, interest: `${inquiry.direction} / ${inquiry.product}`, message: details, source: 'contact' } })
    submitted.value = true
    Object.assign(inquiry, { name: '', company: '', email: '', phone: '', direction: '', product: '', quantity: '', message: '' })
    Object.keys(inquiryFieldErrors).forEach(field => { inquiryFieldErrors[field as InquiryField] = '' })
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || (language.value === 'en' ? 'Submission failed. Please try again.' : '提交失败，请稍后重试。')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page page-contact">
    <PageHero class="page-hero--inner" title="联系我们" subtitle="告诉我们，你正在采购什么" image="/assets/images/hero-contact-lake.webp" split-text />

    <div class="contact-spread">
      <div class="contact-overview">
        <div class="contact-spread__information">
          <div class="contact-spread__primary">
            <section id="contact-info" class="contact-directory" aria-labelledby="contact-directory-title">
              <div class="contact-block__heading">
                <h2 id="contact-directory-title">{{ t('联系方式') }}</h2>
                <p>{{ language === 'en' ? 'Choose the channel that works best for you.' : '选择适合您的渠道，与我们取得联系。' }}</p>
              </div>
              <dl class="contact-directory__list">
                <div><Icon name="lucide:phone" /><dt>{{ t('电话') }}</dt><dd>{{ contactContent.channels.phone || t('待补充') }}<small>{{ language === 'en' ? contactContent.channels.phoneHoursEn : contactContent.channels.phoneHoursZh }}</small></dd></div>
                <div><Icon name="lucide:mail" /><dt>{{ t('邮箱') }}</dt><dd>{{ contactContent.channels.email || t('待补充') }}<small>{{ language === 'en' ? contactContent.channels.emailNoteEn : contactContent.channels.emailNoteZh }}</small></dd></div>
                <div><Icon name="lucide:message-circle" /><dt>{{ t('微信 / WhatsApp') }}</dt><dd>{{ contactContent.channels.social || t('待补充') }}<small>{{ language === 'en' ? contactContent.channels.socialNoteEn : contactContent.channels.socialNoteZh }}</small></dd></div>
                <div><Icon name="lucide:clock-3" /><dt>{{ language === 'en' ? 'Service hours' : '服务时间' }}</dt><dd>{{ language === 'en' ? contactContent.channels.serviceHoursEn : contactContent.channels.serviceHoursZh }}<small>{{ language === 'en' ? contactContent.channels.serviceNoteEn : contactContent.channels.serviceNoteZh }}</small></dd></div>
              </dl>
            </section>
          </div>
        </div>

        <section id="inquiry" class="inquiry-section" aria-labelledby="inquiry-title">
          <header class="inquiry-section__intro">
            <h2 id="inquiry-title">{{ t('提交采购需求') }}</h2>
            <p>{{ language === 'en' ? contactContent.inquiry.introEn : contactContent.inquiry.introZh }}</p>
            <span>{{ language === 'en' ? 'Your enquiry is saved for coordinated follow-up by our team.' : '询价将进入管理台统一记录，方便团队集中查看和跟进。' }}</span>
          </header>
          <form class="inquiry-form" novalidate @submit.prevent="submitInquiry">
            <label>{{ t('姓名 *') }}<input id="inquiry-name" name="name" v-model.trim="inquiry.name" required minlength="2" maxlength="30" autocomplete="name" :aria-invalid="Boolean(inquiryFieldErrors.name)" :placeholder="t('请输入姓名')" @input="clearInquiryError('name')" @blur="validateInquiryField('name')"><small v-if="inquiryFieldErrors.name" class="inquiry-field-error">{{ inquiryFieldErrors.name }}</small></label>
            <label>{{ t('公司 *') }}<input id="inquiry-company" name="company" v-model.trim="inquiry.company" required minlength="2" maxlength="80" autocomplete="organization" :aria-invalid="Boolean(inquiryFieldErrors.company)" :placeholder="t('请输入公司名称')" @input="clearInquiryError('company')" @blur="validateInquiryField('company')"><small v-if="inquiryFieldErrors.company" class="inquiry-field-error">{{ inquiryFieldErrors.company }}</small></label>
            <label>{{ t('邮箱 *') }}<input id="inquiry-email" name="email" v-model.trim="inquiry.email" type="email" required maxlength="120" autocomplete="email" :aria-invalid="Boolean(inquiryFieldErrors.email)" :placeholder="t('请输入邮箱地址')" @input="clearInquiryError('email')" @blur="validateInquiryField('email')"><small v-if="inquiryFieldErrors.email" class="inquiry-field-error">{{ inquiryFieldErrors.email }}</small></label>
            <label>{{ t('电话 / WhatsApp *') }}<input id="inquiry-phone" name="phone" v-model.trim="inquiry.phone" required minlength="7" maxlength="25" inputmode="tel" autocomplete="tel" :aria-invalid="Boolean(inquiryFieldErrors.phone)" :placeholder="t('请输入电话号码')" @input="clearInquiryError('phone')" @blur="validateInquiryField('phone')"><small v-if="inquiryFieldErrors.phone" class="inquiry-field-error">{{ inquiryFieldErrors.phone }}</small></label>
            <label>{{ t('采购方向 *') }}<select id="inquiry-direction" name="direction" v-model="inquiry.direction" required :aria-invalid="Boolean(inquiryFieldErrors.direction)" @change="validateInquiryField('direction')"><option value="">{{ t('请选择') }}</option><option value="批发与经销">{{ t('批发与经销') }}</option><option value="外贸采购">{{ t('外贸采购') }}</option><option value="工程项目">{{ t('工程项目') }}</option></select><small v-if="inquiryFieldErrors.direction" class="inquiry-field-error">{{ inquiryFieldErrors.direction }}</small></label>
            <label>{{ t('感兴趣的产品 *') }}<select id="inquiry-product" name="product" v-model="inquiry.product" required :aria-invalid="Boolean(inquiryFieldErrors.product)" @change="validateInquiryField('product')"><option value="">{{ t('请选择') }}</option><option value="卫浴产品">{{ t('卫浴产品') }}</option><option value="卫浴五金">{{ t('卫浴五金') }}</option><option value="安装及配件">{{ t('安装及配件') }}</option></select><small v-if="inquiryFieldErrors.product" class="inquiry-field-error">{{ inquiryFieldErrors.product }}</small></label>
            <label>{{ t('数量') }}<input id="inquiry-quantity" name="quantity" v-model.trim="inquiry.quantity" class="inquiry-form__quantity" maxlength="9" inputmode="numeric" pattern="[0-9]*" autocomplete="off" :aria-invalid="Boolean(inquiryFieldErrors.quantity)" :placeholder="t('请输入预计采购数量')" @input="clearInquiryError('quantity')" @blur="validateInquiryField('quantity')"><small v-if="inquiryFieldErrors.quantity" class="inquiry-field-error">{{ inquiryFieldErrors.quantity }}</small></label>
            <label>{{ t('需求说明') }}<span class="inquiry-form__message-control"><textarea id="inquiry-message" name="message" v-model.trim="inquiry.message" class="inquiry-form__message" rows="4" maxlength="1000" autocomplete="off" :aria-invalid="Boolean(inquiryFieldErrors.message)" :placeholder="t('请详细描述采购需求、应用场景或项目信息')" @input="clearInquiryError('message')" @blur="validateInquiryField('message')"></textarea><small class="inquiry-form__counter">{{ inquiry.message.length }}/1000</small></span><small v-if="inquiryFieldErrors.message" class="inquiry-field-error">{{ inquiryFieldErrors.message }}</small></label>
            <button type="submit" :disabled="submitting">{{ submitting ? (language === 'en' ? 'Submitting…' : '提交中…') : t('提交采购需求') }}</button>
            <p v-if="submitted" class="form-success">{{ language === 'en' ? 'Submitted successfully. We will contact you as soon as possible.' : '采购需求已提交，我们会尽快与您联系。' }}</p>
            <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
            <small><Icon name="lucide:lock-keyhole" /> {{ language === 'en' ? contactContent.inquiry.privacyEn : contactContent.inquiry.privacyZh }}</small>
          </form>
        </section>
      </div>

      <section id="location" class="contact-location" aria-labelledby="contact-location-title">
        <div class="contact-location__content">
          <div class="contact-block__heading">
            <h2 id="contact-location-title">{{ t('地理位置') }}</h2>
            <p>{{ language === 'en' ? 'Office and showroom visit information.' : '办公与展厅到访信息。' }}</p>
          </div>
          <div class="contact-location__copy"><Icon name="lucide:map-pin" /><p><strong>{{ language === 'en' ? 'Office / showroom address' : '办公 / 展厅地址' }}</strong><span>{{ (language === 'en' ? contactContent.location.addressEn : contactContent.location.addressZh) || t('待补充') }}</span><small>{{ language === 'en' ? contactContent.location.noteEn : contactContent.location.noteZh }}</small></p></div>
        </div>
        <AmapLocationDisplay v-if="hasAmap" :latitude="mapLocation.latitude" :longitude="mapLocation.longitude" :zoom="mapLocation.zoom" :link="mapLocation.link" :label="language === 'en' ? 'Office location' : '公司位置'" :open-text="language === 'en' ? 'Open in Amap' : '在高德地图中打开'" :error-text="language === 'en' ? 'The map is temporarily unavailable.' : '地图暂时无法加载。'" />
        <a v-else class="contact-location__map" :href="mapLocation.link" target="_blank" rel="noopener noreferrer" :aria-label="language === 'en' ? 'Open the company location in Amap in a new window' : '在新窗口打开高德地图中的公司位置'">
          <span v-for="tile in mapTiles" :key="tile.key" class="location-map__tile" :style="{ left: `${tile.left}px`, top: `${tile.top}px`, backgroundImage: `url(${tile.src})` }" aria-hidden="true"></span>
          <span class="location-map__shade" aria-hidden="true"></span>
          <span class="location-map__marker" aria-hidden="true"><span class="location-map__pin"><Icon name="lucide:map-pin" /></span><span class="location-map__label">{{ language === 'en' ? 'Office location' : '公司位置' }}</span></span>
          <span class="location-map__open"><Icon name="lucide:external-link" />{{ language === 'en' ? 'Open in Amap' : '在高德地图中打开' }}</span>
          <span class="location-map__attribution">© OpenStreetMap contributors</span>
        </a>
      </section>
    </div>
  </div>
</template>
