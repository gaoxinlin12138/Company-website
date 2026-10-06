export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: false },
  css: ['~/assets/css/site.css', '~/assets/css/home.css', '~/assets/css/porcelain-green.css'],
  modules: ['@nuxt/icon'],
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || 'mysql://root@127.0.0.1:3306/hongcai_wanfu',
    sessionSecret: process.env.NUXT_SESSION_SECRET || '',
    baiduTranslateAppId: process.env.BAIDU_TRANSLATE_APP_ID || '',
    baiduTranslateSecretKey: process.env.BAIDU_TRANSLATE_SECRET_KEY || '',
    public: {
      amapKey: process.env.NUXT_PUBLIC_AMAP_KEY || '',
      amapSecurityCode: process.env.NUXT_PUBLIC_AMAP_SECURITY_CODE || ''
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#f6f8f5' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/favicon.png' }
      ]
    }
  },
  routeRules: {
    '/index.html': { redirect: '/' },
    '/products.html': { redirect: '/products' },
    '/about.html': { redirect: '/about' },
    '/stories.html': { redirect: '/cases' },
    '/cooperation.html': { redirect: '/contact' },
    '/capability.html': { redirect: '/about#reports' },
    '/news.html': { redirect: '/news' },
    '/cases.html': { redirect: '/cases' },
    '/contact.html': { redirect: '/contact' },
    '/products-shower-sets.html': { redirect: '/products?category=花洒套装' },
    '/products-basin-faucets.html': { redirect: '/products?category=面盆龙头' },
    '/products-shower-bath.html': { redirect: '/products?category=淋浴与浴缸龙头' },
    '/products-kitchen-faucets.html': { redirect: '/products?category=厨房龙头' }
  }
})
