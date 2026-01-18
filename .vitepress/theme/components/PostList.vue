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
  category?: string
}

const props = defineProps<Props>()
const route = useRoute()

// Get current category from route or props
const currentCategory = computed(() => {
  if (props.category) return props.category
  // Extract category from current path, e.g., /linux/index -> linux
  const match = route.path.match(/^\/([^/]+)/)
  return match?.[1] || ''
})

// Filter pages by category and sort by lastUpdated
const categoryPosts = computed(() => {
  const category = currentCategory.value
  if (!category) return []

  return pagesMeta
    .filter((page) => {
      // Match pages under this category, exclude index pages
      const isInCategory = page.url.startsWith(`/${category}/`)
      const isIndexPage = page.url === `/${category}/` || page.url === `/${category}/index`
      return isInCategory && !isIndexPage
    })
    .map((page) => ({
      ...page,
      // Generate display title from filename if not provided
      displayTitle: page.title || generateTitleFromUrl(page.url),
    }))
    .sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0))
})

// Group posts by year
const postsByYear = computed(() => {
  const groups: Record<string, typeof categoryPosts.value> = {}
  
  for (const post of categoryPosts.value) {
    const year = post.lastUpdated 
      ? new Date(post.lastUpdated).getFullYear().toString()
      : '未知'
    
    if (!groups[year]) {
      groups[year] = []
    }
    groups[year].push(post)
  }
  
  // Sort years in descending order
  const sortedYears = Object.keys(groups).sort((a, b) => {
    if (a === '未知') return 1
    if (b === '未知') return -1
    return parseInt(b) - parseInt(a)
  })
  
  return sortedYears.map(year => ({
    year,
    posts: groups[year]
  }))
})

function generateTitleFromUrl(url: string): string {
  const fileName = url.split('/').pop()?.replace(/\.html$/, '') || ''
  return fileName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDate(timestamp: number | undefined): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

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
  <div class="post-list">
    <template v-for="group in postsByYear" :key="group.year">
      <h2 :id="group.year" class="year-header">
        {{ group.year }}
        <a class="header-anchor" :href="`#${group.year}`" aria-label="Permalink to &quot;{{ group.year }}&quot;">​</a>
      </h2>
      <ul class="post-items">
        <li v-for="post in group.posts" :key="post.url" class="post-item">
          <a :href="withBase(post.url)" class="post-link">
            <!-- Date -->
            <span class="post-date">{{ formatDate(post.lastUpdated) }}</span>
            <!-- Icon -->
            <span class="post-icon">
              <span
                v-if="getIconSvg(post.icon || '')"
                class="icon-wrapper"
                v-html="getIconSvg(post.icon || '')"
                aria-hidden="true"
              />
              <img
                v-else-if="getIconUrl(post.icon || '')"
                :src="getIconUrl(post.icon || '')"
                alt=""
                class="icon-img"
                aria-hidden="true"
              />
              <span v-else class="icon-placeholder" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
              </span>
            </span>
            <!-- Title -->
            <span class="post-title">{{ post.displayTitle }}</span>
          </a>
        </li>
      </ul>
    </template>
    <p v-if="categoryPosts.length === 0" class="no-posts">
      暂无文章
    </p>
  </div>
</template>

<style scoped>
.post-list {
  margin-top: 1rem;
}

.year-header {
  position: relative;
  margin: 2rem 0 1rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  border: none;
  padding: 0;
}

.year-header:first-child {
  margin-top: 0;
}

.year-header .header-anchor {
  position: absolute;
  top: 0;
  left: 0;
  margin-left: -0.87em;
  font-weight: 500;
  opacity: 0;
  transition: color 0.25s, opacity 0.25s;
}

.year-header:hover .header-anchor {
  opacity: 1;
}

.post-items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.post-item {
  margin: 0;
  padding: 0;
}

.post-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0;
  text-decoration: none !important;
  border-bottom: 1px dashed var(--vp-c-divider);
  transition: all 0.2s ease;
}

.post-link:hover {
  padding-left: 0.5rem;
}

.post-link:hover .post-title {
  color: var(--vp-c-brand-1);
}

.post-date {
  flex-shrink: 0;
  font-size: 0.875rem;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-3);
  min-width: 3.5rem;
}

.post-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.icon-wrapper :deep(svg) {
  width: 20px;
  height: 20px;
}

.icon-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.icon-placeholder {
  color: var(--vp-c-text-3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-placeholder svg {
  width: 16px;
  height: 16px;
}

.post-title {
  flex: 1;
  font-size: 1rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: color 0.2s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-posts {
  color: var(--vp-c-text-3);
  text-align: center;
  padding: 2rem;
}
</style>
