<script setup lang="ts">
import type { AboutProfileBlock, AboutProfileBlockType } from '~/data/site-content'

const props = defineProps<{
  blocks: AboutProfileBlock[]
  previewAlt: string
  emptyText?: string
}>()

const emit = defineEmits<{
  add: [type: AboutProfileBlockType]
  move: [index: number, offset: -1 | 1]
  remove: [index: number]
  removeImage: [block: AboutProfileBlock]
  // 多参数事件统一打包成元组传递，父级可以直接按位置取用。
  upload: [payload: [Event, AboutProfileBlock]]
}>()

const emptyMessage = computed(() => props.emptyText || '还没有内容，请先添加文字或图片。')
</script>

<template>
  <div class="settings-repeat settings-profile-flow">
    <div class="settings-repeat__head settings-profile-flow__head">
      <div><strong>图文内容编排</strong><span>使用上移、下移调整文字和图片在前台出现的位置。</span></div>
      <div class="settings-profile-flow__add">
        <button type="button" class="settings-add" @click="emit('add', 'text')"><Icon name="lucide:file-text" />添加文字</button>
        <button type="button" class="settings-add" @click="emit('add', 'image')"><Icon name="lucide:image-plus" />添加图片</button>
      </div>
    </div>
    <p v-if="!blocks.length" class="settings-profile-flow__empty">{{ emptyMessage }}</p>
    <article v-for="(block, index) in blocks" :key="block.id" class="settings-profile-block">
      <div class="settings-repeat__item-head settings-profile-block__head">
        <strong><Icon :name="block.type === 'text' ? 'lucide:file-text' : 'lucide:image'" />{{ block.type === 'text' ? '文字段落' : '图片' }} {{ index + 1 }}</strong>
        <div class="settings-profile-block__actions">
          <button type="button" class="settings-order" :disabled="index === 0" :aria-label="`上移第 ${index + 1} 项`" title="上移" @click="emit('move', index, -1)"><Icon name="lucide:arrow-up" /></button>
          <button type="button" class="settings-order" :disabled="index === blocks.length - 1" :aria-label="`下移第 ${index + 1} 项`" title="下移" @click="emit('move', index, 1)"><Icon name="lucide:arrow-down" /></button>
          <button type="button" class="settings-remove" @click="emit('remove', index)">移除</button>
        </div>
      </div>
      <div v-if="block.type === 'text'" class="settings-grid">
        <label>中文正文<textarea v-model="block.bodyZh" rows="5" placeholder="输入一个或多个自然段"></textarea></label>
        <label>English copy<textarea v-model="block.bodyEn" rows="5" placeholder="English content for this block"></textarea></label>
      </div>
      <div v-else class="settings-grid">
        <div class="settings-span settings-content-image">
          <label v-if="!block.image">上传图片<input type="file" accept="image/jpeg,image/png,image/webp" @change="emit('upload', [$event, block])"><small class="settings-field-help">推荐 1600×1000（约 8:5 横图）；支持 JPG、PNG、WebP，单张不超过 5MB。</small></label>
          <figure v-if="block.image" class="settings-content-image__preview">
            <button type="button" class="settings-content-image__remove" aria-label="删除当前图片并重新选择" title="删除并更换图片" @click="emit('removeImage', block)"><Icon name="lucide:x" /></button>
            <img :src="block.image" :alt="block.altZh || previewAlt">
            <figcaption>当前图片预览；点击右上角叉号可删除并重新选择。</figcaption>
          </figure>
        </div>
        <label>中文替代文本<input v-model="block.altZh" placeholder="简要描述图片内容"></label>
        <label>English alt text<input v-model="block.altEn" placeholder="Describe the image"></label>
      </div>
    </article>
  </div>
</template>
