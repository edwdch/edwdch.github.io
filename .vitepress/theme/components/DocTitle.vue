<script setup lang="ts">
import { computed } from "vue";

// Load SVG files as raw content for inline rendering
const svgFiles = import.meta.glob("../assets/icons/*.svg", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

// Load image files as URLs
const imageFiles = import.meta.glob("../assets/icons/*.{webp,png,jpg,jpeg,gif}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

// Map SVG files by their basename
const svgByFilename: Record<string, string> = Object.fromEntries(
  Object.entries(svgFiles)
    .map(([filePath, content]) => {
      const match = filePath.match(/\/([^/]+)$/);
      const filename = match?.[1];
      if (!filename) return null;
      return [filename, content] as const;
    })
    .filter((entry): entry is readonly [string, string] => Boolean(entry))
);

// Map image files by their basename
const imageByFilename: Record<string, string> = Object.fromEntries(
  Object.entries(imageFiles)
    .map(([filePath, url]) => {
      const match = filePath.match(/\/([^/]+)$/);
      const filename = match?.[1];
      if (!filename) return null;
      return [filename, url] as const;
    })
    .filter((entry): entry is readonly [string, string] => Boolean(entry))
);

const props = defineProps<{
  icon?: string;
  title: string;
}>();

const svgContent = computed(() => {
  const filename = props.icon?.trim();
  if (!filename || !filename.endsWith('.svg')) return null;
  return svgByFilename[filename] ?? null;
});

const imageUrl = computed(() => {
  const filename = props.icon?.trim();
  if (!filename || filename.endsWith('.svg')) return null;
  return imageByFilename[filename] ?? null;
});

</script>

<template>
  <span class="doc-title">
    <span v-if="svgContent" class="doc-title__icon" v-html="svgContent" aria-hidden="true" />
    <img v-else-if="imageUrl" :src="imageUrl" alt="" class="doc-title__icon" aria-hidden="true" />
    <span>{{ title }}</span>
  </span>
</template>

<style scoped>
.doc-title {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.doc-title__icon {
  display: inline-flex;
  align-items: center;
  width: 1em;
  height: 1em;
  object-fit: contain;
}

.doc-title :deep(svg) {
  width: 1em;
  height: 1em;
}
</style>
