<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface RepoData {
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  owner: {
    avatar_url: string
    login: string
  }
}

interface Props {
  /** GitHub 仓库链接,例如 "https://github.com/dockur/windows" */
  url: string
}

const props = defineProps<Props>()

// 语言对应的颜色映射
const languageColors: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89e051',
  Dockerfile: '#384d54',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
}

const repo = ref<RepoData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  }
  return num.toString()
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname !== 'github.com') return null
    const parts = urlObj.pathname.split('/').filter(Boolean)
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] }
    }
  } catch {
    // 尝试解析简短格式 owner/repo
    const parts = url.split('/').filter(Boolean)
    if (parts.length === 2) {
      return { owner: parts[0], repo: parts[1] }
    }
  }
  return null
}

// 简单的内存缓存
const repoCache = new Map<string, RepoData>()

const parsed = computed(() => parseGitHubUrl(props.url))

const languageColor = computed(() => {
  if (!repo.value?.language) return null
  return languageColors[repo.value.language] || '#8b8b8b'
})

onMounted(async () => {
  if (!parsed.value) {
    error.value = '无效的 GitHub 链接'
    loading.value = false
    return
  }

  const cacheKey = `${parsed.value.owner}/${parsed.value.repo}`
  
  // 检查缓存
  if (repoCache.has(cacheKey)) {
    repo.value = repoCache.get(cacheKey)!
    loading.value = false
    return
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${parsed.value.owner}/${parsed.value.repo}`
    )
    if (!response.ok) {
      throw new Error('仓库不存在或无法访问')
    }
    const data: RepoData = await response.json()
    repoCache.set(cacheKey, data)
    repo.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取仓库信息失败'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <!-- Error state -->
  <div
    v-if="error"
    class="not-prose my-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
  >
    {{ error }}
  </div>

  <!-- Loading state -->
  <div
    v-else-if="loading"
    class="not-prose my-4 animate-pulse rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/50"
  >
    <div class="flex items-center gap-2">
      <div class="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700" />
      <div class="flex-1">
        <div class="mb-1 h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div class="h-3 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700" />
      </div>
    </div>
  </div>

  <!-- Repo card -->
  <a
    v-else-if="repo"
    :href="repo.html_url"
    target="_blank"
    rel="noopener noreferrer"
    class="not-prose group my-4 flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 !no-underline !decoration-transparent transition-all hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
  >
    <!-- 头像 -->
    <img
      :src="repo.owner.avatar_url"
      :alt="repo.owner.login"
      class="h-8 w-8 flex-shrink-0 rounded-full"
    />

    <!-- 中间内容 -->
    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
      <span class="truncate font-medium text-neutral-900 group-hover:text-blue-600 dark:text-neutral-100 dark:group-hover:text-blue-400">
        {{ repo.full_name }}
      </span>
      <span
        v-if="repo.description"
        class="truncate text-xs text-neutral-500 no-underline dark:text-neutral-400"
      >
        {{ repo.description }}
      </span>
    </div>

    <!-- 右侧统计信息 -->
    <div class="flex flex-shrink-0 items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
      <!-- 语言 -->
      <span v-if="repo.language" class="hidden items-center gap-1 sm:flex">
        <span
          class="h-2.5 w-2.5 rounded-full"
          :style="{ backgroundColor: languageColor || '#8b8b8b' }"
        />
        {{ repo.language }}
      </span>
      
      <!-- Star 数 -->
      <span class="flex items-center gap-1">
        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
        {{ formatNumber(repo.stargazers_count) }}
      </span>

      <!-- GitHub 图标 -->
      <svg
        class="h-5 w-5 text-neutral-400 transition-colors group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    </div>
  </a>
</template>
