<template>
  <div class="site-shell">
    <a class="skip-link" href="#main-content">跳到主要内容</a>
    <SiteHeader />
    <main id="main-content" tabindex="-1">
      <slot />
    </main>
    <SiteFooter />
    <HomeContactDock />
  </div>
</template>
