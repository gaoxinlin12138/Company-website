type AMapNamespace = any

declare global {
  interface Window {
    AMap?: AMapNamespace
    _AMapSecurityConfig?: { securityJsCode?: string }
  }
}

let amapPromise: Promise<AMapNamespace> | null = null

export function loadAmap(): Promise<AMapNamespace> {
  if (import.meta.server) return Promise.reject(new Error('高德地图只能在浏览器中加载。'))
  if (window.AMap) return Promise.resolve(window.AMap)
  if (amapPromise) return amapPromise

  const config = useRuntimeConfig().public
  const key = String(config.amapKey || '').trim()
  const securityJsCode = String(config.amapSecurityCode || '').trim()
  if (!key) return Promise.reject(new Error('未配置高德地图 Key。'))

  if (securityJsCode) window._AMapSecurityConfig = { securityJsCode }
  amapPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-amap-sdk]')
    if (existing) {
      existing.addEventListener('load', () => window.AMap ? resolve(window.AMap) : reject(new Error('高德地图 SDK 未初始化。')), { once: true })
      existing.addEventListener('error', () => reject(new Error('高德地图 SDK 加载失败。')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.dataset.amapSdk = 'true'
    script.async = true
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}&plugin=AMap.Geocoder,AMap.PlaceSearch`
    script.onload = () => window.AMap ? resolve(window.AMap) : reject(new Error('高德地图 SDK 未初始化。'))
    script.onerror = () => reject(new Error('高德地图 SDK 加载失败，请检查 Key、安全密钥和域名白名单。'))
    document.head.appendChild(script)
  }).catch(error => {
    amapPromise = null
    throw error
  })
  return amapPromise
}
