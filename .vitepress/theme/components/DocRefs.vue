<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { BookOpen } from 'lucide-vue-next'
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
  /** Base64 encoded refs array */
  refsBase64: string
}

const props = defineProps<Props>()
const route = useRoute()

// Helper function to decode base64 with Unicode support
const decodeBase64 = (str: string): string => {
  const binaryString = atob(str)
  const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0))
  return new TextDecoder('utf-8').decode(bytes)
}

// Decode refs from base64
const refs = computed((): string[] => {
  try {
    return JSON.parse(decodeBase64(props.refsBase64))
  } catch {
    return []
  }
})

interface RefItem {
  path: string
  title: string
  icon?: string
  url: string
}

// Resolve ref paths and get metadata
const refItems = computed((): RefItem[] => {
  const currentPath = route.path
  const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'))

  return refs.value.map(ref => {
    let targetPath = ref

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
      // Relative path without ./ prefix
      targetPath = currentDir + '/' + targetPath
    }

    // Remove .md extension if present
    targetPath = targetPath.replace(/\.md$/, '')

    // Find metadata from pages data
    const pageMeta = pagesMeta.find(page => page.url === targetPath)
    
    let title = pageMeta?.title || ''
    let icon = pageMeta?.icon || ''

    // Fallback title from path
    if (!title) {
      const fileName = ref.split('/').pop()?.replace(/\.md$/, '') || ref
      title = fileName.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }

    return {
      path: targetPath,
      title,
      icon,
      url: withBase(targetPath)
    }
  })
})

// Get icon content
const getIconSvg = (icon: string): string | null => {
  if (!icon || !icon.endsWith('.svg')) return null
  return svgByFilename[icon] ?? null
}

const getIconUrl = (icon: string): string | undefined => {
  if (!icon || icon.endsWith('.svg')) return undefined
  return imageByFilename[icon] ?? undefined
}
</script>

<template>
  <div v-if="refItems.length > 0" class="doc-refs not-prose my-6">
    <div class="flex items-center gap-2 mb-3 text-sm text-[var(--vp-c-text-2)]">
      <BookOpen :size="16" />
      <span>前置阅读</span>
    </div>
    <div class="flex flex-wrap gap-2">
      <a
        v-for="item in refItems"
        :key="item.path"
        :href="item.url"
        class="ref-card group flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] hover:border-[var(--vp-c-brand-1)] hover:bg-[var(--vp-c-bg-alt)] transition-all !no-underline"
      >
        <!-- Icon -->
        <span
          v-if="getIconSvg(item.icon || '')"
          class="ref-icon inline-flex items-center size-4 flex-shrink-0"
          v-html="getIconSvg(item.icon || '')"
          aria-hidden="true"
        />
        <img
          v-else-if="getIconUrl(item.icon || '')"
          :src="getIconUrl(item.icon || '')"
          alt=""
          class="size-4 flex-shrink-0 object-contain"
          aria-hidden="true"
        />
        <!-- Title -->
        <span class="text-sm text-[var(--vp-c-text-1)] group-hover:text-[var(--vp-c-brand-1)] transition-colors">
          {{ item.title }}
        </span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.ref-icon :deep(svg) {
  width: 1rem;
  height: 1rem;
}
</style>
