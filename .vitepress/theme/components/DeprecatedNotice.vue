<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data as pagesMeta } from '../data/pagesMeta.data'

const { frontmatter } = useData()

const isDeprecated = computed(() => frontmatter.value.deprecated === true)

const replacedByUrl = computed<string | undefined>(() => frontmatter.value.replacedBy)

const replacedByPage = computed(() => {
  if (!replacedByUrl.value) return null
  // Normalize: strip trailing slash and .html for matching
  const normalized = replacedByUrl.value.replace(/\.html$/, '').replace(/\/$/, '')
  return pagesMeta.find((p) => p.url === normalized) ?? null
})
</script>

<template>
  <div v-if="isDeprecated" class="deprecated-notice" role="note">
    <span class="deprecated-icon" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    </span>
    <span class="deprecated-text">
      <strong>此文章已废弃</strong>
      <template v-if="replacedByPage">
        ，请参阅替代文章：
        <a :href="withBase(replacedByPage.url)" class="deprecated-link">{{ replacedByPage.title || replacedByPage.url }}</a>
      </template>
      <template v-else-if="replacedByUrl">
        ，请参阅替代文章：
        <a :href="withBase(replacedByUrl)" class="deprecated-link">{{ replacedByUrl }}</a>
      </template>
    </span>
  </div>
</template>

<style scoped>
.deprecated-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  margin-bottom: 1.5rem;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-warning-2);
  background: var(--vp-c-warning-soft);
  color: var(--vp-c-warning-1);
  font-size: 0.9375rem;
  line-height: 1.5;
}

.deprecated-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  margin-top: 0.125rem;
}

.deprecated-text {
  color: var(--vp-c-text-1);
}

.deprecated-text strong {
  color: var(--vp-c-warning-1);
}

.deprecated-link {
  color: var(--vp-c-brand-1);
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.deprecated-link:hover {
  color: var(--vp-c-brand-2);
}
</style>
