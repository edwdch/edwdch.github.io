<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";

const props = defineProps<{
  icon?: string;
  title: string;
}>();

const iconId = computed(() => {
  const raw = props.icon?.trim();
  if (!raw) return null;

  // Prefer Iconify IDs, e.g. "vscode-icons:file-type-vscode".
  // (Dynamic component names won't work reliably with auto-imported icon components.)
  if (raw.includes(":")) return raw;

  return null;
});
</script>

<template>
  <span class="doc-title">
    <Icon v-if="iconId" :icon="iconId" aria-hidden="true" />
    <span>{{ title }}</span>
  </span>
</template>

<style scoped>
.doc-title {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.doc-title :deep(svg) {
  width: 1em;
  height: 1em;
}
</style>
