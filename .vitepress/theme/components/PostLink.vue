<script setup lang="ts">
import { computed } from 'vue';
import { useData, useRoute, withBase } from 'vitepress';

interface Props {
  href: string;
}

const props = defineProps<Props>();
const route = useRoute();
const { theme } = useData();

// Resolve the full path
const fullPath = computed(() => {
  const currentPath = route.path;
  const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
  
  let targetPath = props.href;
  
  // Handle relative paths
  if (targetPath.startsWith('./')) {
    targetPath = currentDir + '/' + targetPath.substring(2);
  } else if (targetPath.startsWith('../')) {
    const parts = currentDir.split('/').filter(p => p);
    const upLevels = (targetPath.match(/\.\.\//g) || []).length;
    const remainingPath = targetPath.replace(/\.\.\//g, '');
    parts.splice(parts.length - upLevels, upLevels);
    targetPath = '/' + parts.join('/') + '/' + remainingPath;
  } else if (!targetPath.startsWith('/')) {
    targetPath = currentDir + '/' + targetPath;
  }
  
  // Remove .md extension
  targetPath = targetPath.replace(/\.md$/, '');
  
  return targetPath;
});

// Get the title from sidebar configuration
const title = computed(() => {
  const sidebar = theme.value.sidebar;
  
  if (sidebar) {
    // Search through all sidebar items
    for (const key in sidebar) {
      const items = sidebar[key];
      if (Array.isArray(items)) {
        for (const group of items) {
          if (group.items) {
            for (const item of group.items) {
              if (item.link === fullPath.value) {
                return item.text;
              }
            }
          }
        }
      }
    }
  }
  
  // Fallback to filename
  const fileName = props.href.split('/').pop()?.replace(/\.md$/, '') || props.href;
  return fileName.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
});

const url = computed(() => withBase(fullPath.value));
</script>

<template>
  <a :href="url">{{ title }}</a>
</template>

<style scoped>
/* Remove custom styles to inherit VitePress default link styles */
</style>
