<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: '案例展示｜管理后台' })
</script>

<template>
  <div class="admin-cases-placeholder">
    <header><p>CASES</p><h1>案例展示</h1><span>项目案例内容管理暂时保留，等待后续确认。</span></header>
    <main><section><Icon name="lucide:construction" /><div><strong>暂定，暂无修改</strong><p>案例展示的新增、编辑、配图、分类、发布和删除流程将在确认真实项目资料后继续开发。</p></div></section></main>
  </div>
</template>

<style scoped>
.admin-cases-placeholder{min-height:100vh;background:#f3f7f4;color:#17343a}.admin-cases-placeholder>header{padding:2rem clamp(1.25rem,5vw,5rem);background:#17343a;color:#fff}.admin-cases-placeholder header p{margin:0 0 .45rem;color:#37675d;font-size:.65rem;font-weight:800;letter-spacing:.16em}.admin-cases-placeholder header h1{margin:0;font-family:var(--serif);font-size:clamp(1.5rem,4vw,2.2rem);font-weight:600}.admin-cases-placeholder header span{display:block;margin-top:.45rem;color:rgba(255,255,255,.72);font-size:.76rem}.admin-cases-placeholder main{width:min(900px,calc(100% - 2.5rem));margin:auto;padding:2rem 0}.admin-cases-placeholder section{display:flex;gap:1rem;align-items:flex-start;padding:1.5rem;background:#ffffff;border:1px solid rgba(23,52,58,.1)}.admin-cases-placeholder section svg{flex:0 0 auto;width:28px;color:#37675d}.admin-cases-placeholder strong{font-size:1rem}.admin-cases-placeholder section p{margin:.5rem 0 0;color:#526d65;font-size:.78rem;line-height:1.8}
</style>
