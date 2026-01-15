<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { data as pagesMeta } from '../data/pagesMeta.data'

// Load SVG files as raw content for inline rendering
const svgFiles = import.meta.glob('../assets/icons/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

// Load image files as URLs
const imageFiles = import.meta.glob('../assets/icons/*.{webp,png,jpg,jpeg,gif}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

// Map SVG files by their basename
const svgByFilename: Record<string, string> = Object.fromEntries(
  Object.entries(svgFiles)
    .map(([filePath, content]) => {
      const match = filePath.match(/\/([^/]+)$/)
      const filename = match?.[1]
      if (!filename) return null
      return [filename, content] as const
    })
    .filter((entry): entry is readonly [string, string] => Boolean(entry))
)

// Map image files by their basename
const imageByFilename: Record<string, string> = Object.fromEntries(
  Object.entries(imageFiles)
    .map(([filePath, url]) => {
      const match = filePath.match(/\/([^/]+)$/)
      const filename = match?.[1]
      if (!filename) return null
      return [filename, url] as const
    })
    .filter((entry): entry is readonly [string, string] => Boolean(entry))
)

interface Props {
  href: string
}

const props = defineProps<Props>()
const route = useRoute()

// Resolve the full path
const fullPath = computed(() => {
  const currentPath = route.path
  const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'))

  let targetPath = props.href

  // Handle relative paths
  if (targetPath.startsWith('./')) {
    targetPath = currentDir + '/' + targetPath.substring(2)
  } else if (targetPath.startsWith('../')) {
    const parts = currentDir.split('/').filter(p => p)
    const upLevels = (targetPath.match(/\.\.\//g) || []).length
    const remainingPath = targetPath.replace(/\.\.\//g, '')
    parts.splice(parts.length - upLevels, upLevels)
    targetPath = '/' + parts.join('/') + '/' + remainingPath
  } else if (!targetPath.startsWith('/')) {
    targetPath = currentDir + '/' + targetPath
  }

  // Remove .md extension
  targetPath = targetPath.replace(/\.md$/, '')

  return targetPath
})

// Get metadata from pages data
const pageMeta = computed(() => {
  return pagesMeta.find(page => page.url === fullPath.value)
})

const title = computed(() => {
  if (pageMeta.value?.title) {
    return pageMeta.value.title
  }
  // Fallback to filename
  const fileName = props.href.split('/').pop()?.replace(/\.md$/, '') || props.href
  return fileName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

const icon = computed(() => pageMeta.value?.icon || '')

const url = computed(() => withBase(fullPath.value))

// Get icon content
const getIconSvg = (iconName: string): string | null => {
  if (!iconName || !iconName.endsWith('.svg')) return null
  return svgByFilename[iconName] ?? null
}

const getIconUrl = (iconName: string): string | undefined => {
  if (!iconName || iconName.endsWith('.svg')) return undefined
  return imageByFilename[iconName] ?? undefined
}
</script>

<template>
  <a
    :href="url"
    class="post-link group inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] hover:border-[var(--vp-c-brand-1)] hover:bg-[var(--vp-c-bg-alt)] transition-all !no-underline"
  >
    <!-- Icon -->
    <span
      v-if="getIconSvg(icon)"
      class="post-link-icon inline-flex items-center size-4 flex-shrink-0"
      v-html="getIconSvg(icon)"
      aria-hidden="true"
    />
    <img
      v-else-if="getIconUrl(icon)"
      :src="getIconUrl(icon)"
      alt=""
      class="size-4 flex-shrink-0 object-contain"
      aria-hidden="true"
    />
    <!-- Title -->
    <span class="text-sm text-[var(--vp-c-text-1)] group-hover:text-[var(--vp-c-brand-1)] transition-colors">
      {{ title }}
    </span>
  </a>
</template>

<style scoped>
.post-link-icon :deep(svg) {
  width: 1rem;
  height: 1rem;
}
</style>
