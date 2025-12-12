<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";

const LOCAL_SVG_PREFIX = "local:";

// Local SVGs live under: .vitepress/theme/assets/icons/*.svg
// We load them as raw strings so we can inline them (keeps currentColor + sizing CSS working well).
const localSvgRawByPath = import.meta.glob("../assets/icons/*.svg", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const localSvgByName: Record<string, string> = Object.fromEntries(
  Object.entries(localSvgRawByPath)
    .map(([filePath, svg]) => {
      const match = filePath.match(/\/([^/]+)\.svg$/);
      const name = match?.[1];
      if (!name) return null;
      return [name, svg] as const;
    })
    .filter((entry): entry is readonly [string, string] => Boolean(entry))
);

const props = defineProps<{
  icon?: string;
  title: string;
}>();

const localSvg = computed(() => {
  const raw = props.icon?.trim();
  if (!raw) return null;

  if (!raw.startsWith(LOCAL_SVG_PREFIX)) return null;

  const name = raw.slice(LOCAL_SVG_PREFIX.length).trim();
  if (!name) return null;

  return localSvgByName[name] ?? null;
});

const iconId = computed(() => {
  const raw = props.icon?.trim();
  if (!raw) return null;

  // Prefer Iconify IDs, e.g. "vscode-icons:file-type-vscode".
  // (Dynamic component names won't work reliably with auto-imported icon components.)
  if (raw.includes(":") && !raw.startsWith(LOCAL_SVG_PREFIX)) return raw;

  return null;
});
</script>

<template>
  <span class="doc-title">
    <span v-if="localSvg" class="doc-title__local-icon" v-html="localSvg" aria-hidden="true" />
    <Icon v-else-if="iconId" :icon="iconId" aria-hidden="true" />
    <span>{{ title }}</span>
  </span>
</template>

<style scoped>
.doc-title {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.doc-title__local-icon {
  display: inline-flex;
  align-items: center;
}

.doc-title :deep(svg) {
  width: 1em;
  height: 1em;
}
</style>
