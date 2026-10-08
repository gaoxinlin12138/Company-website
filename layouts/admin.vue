<script setup lang="ts">
const route = useRoute()
const { data: auth } = await useFetch<{ authenticated: boolean }>('/api/admin/auth/status')
if (!auth.value?.authenticated && route.path !== '/admin/login') {
  await navigateTo('/admin/login', { replace: true })
}
</script>

<template>
  <div class="admin-shell">
    <AdminNav />
    <div class="admin-main"><slot /></div>
  </div>
</template>

<style>
.admin-shell { min-height: 100vh; display: flex; background: #f3f7f4; }
.admin-nav { position: sticky; top: 0; z-index: 30; flex: 0 0 238px; height: 100vh; min-height: 100vh; display: flex; flex-direction: column; overflow-y: auto; padding: 1.6rem 1rem 1.2rem; background: #17343a; color: #fff; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.18) transparent; }
.admin-nav__brand { display: flex; align-items: center; gap: .7rem; padding: 0 .55rem 1.8rem; color: #fff; }
.admin-nav__brand > span { display: grid; place-items: center; width: 38px; height: 38px; background: #37675d; color: #fff; font-size: .56rem; font-weight: 800; letter-spacing: 0; }
.admin-nav__brand div { display: grid; gap: .15rem; }.admin-nav__brand strong { font-size: .84rem; letter-spacing: .04em; }.admin-nav__brand small { color: rgba(255,255,255,.5); font-size: .65rem; }
.admin-nav__section { padding: 0 .8rem .55rem; color: rgba(255,255,255,.38); font-size: .6rem; font-weight: 800; letter-spacing: .16em; }
.admin-nav__links { display: grid; gap: .25rem; }
.admin-nav__group { position: relative; }
.admin-nav__parent { position: relative; width: 100%; min-height: 43px; display: flex; align-items: center; gap: .65rem; border: 1px solid transparent; padding: 0 .8rem; background: transparent; color: rgba(255,255,255,.7); font: inherit; font-size: .76rem; font-weight: 700; text-align: left; cursor: pointer; }
.admin-nav__parent:hover, .admin-nav__parent:focus-visible { color: #fff; background: rgba(255,255,255,.06); }
.admin-nav__parent:focus-visible { outline: 2px solid #37675d; outline-offset: -2px; }
.admin-nav__group.is-active > .admin-nav__parent { color: #fff; background: rgba(55,103,93,.2); border-color: rgba(55,103,93,.55); }
.admin-nav__group.is-active > .admin-nav__parent::before { content: ''; position: absolute; left: -1px; top: 7px; bottom: 7px; width: 3px; background: #37675d; }
.admin-nav__parent svg { width: 16px; height: 16px; }
.admin-nav__parent .admin-nav__arrow { width: 13px; margin-left: auto; opacity: .45; transition: transform .24s ease, color .2s ease; }
.admin-nav__group.is-expanded > .admin-nav__parent .admin-nav__arrow { transform: rotate(180deg); color: #37675d; opacity: 1; }
.admin-nav__children { display: grid; padding: .25rem 0 .45rem 2.15rem; }
.admin-nav__children a { position: relative; min-height: 31px; display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: 0 .6rem; color: rgba(255,255,255,.48); font-size: .67rem; }
.admin-nav__children a::before { content: ''; position: absolute; left: -.55rem; width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,.25); transition: background-color .2s ease, box-shadow .2s ease; }
.admin-nav__children a:hover, .admin-nav__children a:focus-visible, .admin-nav__children a.is-current { color: #fff; background: rgba(255,255,255,.06); }
.admin-nav__children a:hover::before, .admin-nav__children a:focus-visible::before, .admin-nav__children a.is-current::before { background: #37675d; box-shadow: 0 0 0 2px rgba(165,200,184,.14); }
.admin-nav__children a:focus-visible { outline: 1px solid #37675d; outline-offset: -1px; }
.admin-nav__children svg { width: 11px; height: 11px; opacity: 0; transition: opacity .2s ease, transform .2s ease; }
.admin-nav__children a:hover svg, .admin-nav__children a:focus-visible svg, .admin-nav__children a.is-current svg { opacity: .65; }
.admin-nav__foot { display: grid; gap: .8rem; margin-top: auto; padding: 1.2rem .8rem .1rem; border-top: 1px solid rgba(255,255,255,.12); }.admin-nav__site, .admin-nav__logout { display: inline-flex; align-items: center; gap: .55rem; border:0; padding:0; background:transparent; color: rgba(255,255,255,.72); font:inherit; font-size: .72rem; cursor:pointer; }.admin-nav__site:hover, .admin-nav__logout:hover { color: #fff; }.admin-nav__site svg, .admin-nav__logout svg { width: 15px; }.admin-nav__version { color: rgba(255,255,255,.3); font-size: .56rem; letter-spacing: .08em; }
.admin-main { min-width: 0; flex: 1; }
@media (max-width: 480px) { .admin-shell { display: block; }.admin-nav { position: relative; height: auto; min-height: auto; max-height: none; flex: none; overflow: visible; padding: .7rem .8rem; }.admin-nav__brand { padding: 0 .25rem .7rem; }.admin-nav__brand > span { width: 31px; height: 31px; }.admin-nav__section, .admin-nav__foot { display: none; }.admin-nav__links { max-height: 48vh; overflow-y: auto; }.admin-nav__parent { min-height: 38px; font-size: .72rem; }.admin-nav__children { padding-left: 2rem; }.admin-nav__children a { min-height: 30px; } }
</style>
