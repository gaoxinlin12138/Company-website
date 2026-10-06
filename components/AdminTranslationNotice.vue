<script setup lang="ts">
defineProps<{ translating?: boolean }>()
</script>

<template>
  <div class="admin-translation-notice" :aria-busy="translating">
    <Icon :name="translating ? 'lucide:loader-circle' : 'lucide:languages'" :class="{ 'is-spinning': translating }" />
    <div>
      <strong>{{ translating ? '正在生成英文译文…' : '中文自动翻译已启用' }}</strong>
      <span>{{ translating ? '请保持当前页面打开，译文完成后会继续保存。' : '只需填写中文；保存时自动生成英文，已有或人工修改的译文会被保留。' }}</span>
    </div>
    <small>百度通用文本翻译</small>
  </div>
</template>

<style scoped>
.admin-translation-notice{min-width:0;display:grid;grid-template-columns:34px minmax(0,1fr) auto;align-items:center;gap:.8rem;padding:.85rem 1rem;background:#e4f0ea;color:#17392b}.admin-translation-notice>.iconify{width:20px;height:20px;justify-self:center;color:#2f7455}.admin-translation-notice>div{min-width:0;display:grid;gap:.15rem}.admin-translation-notice strong{font-size:.76rem}.admin-translation-notice span{color:#4d675c;font-size:.68rem;line-height:1.55}.admin-translation-notice small{color:#4d675c;font-size:.64rem;white-space:nowrap}.is-spinning{animation:admin-translation-spin .8s linear infinite}@keyframes admin-translation-spin{to{transform:rotate(1turn)}}@media(max-width:680px){.admin-translation-notice{grid-template-columns:30px minmax(0,1fr)}.admin-translation-notice small{grid-column:2;white-space:normal}}
</style>
