<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import { onMounted, watch } from "vue";
import { useRouter, useData } from "vitepress";
import mediumZoom from "medium-zoom";

const { Layout } = DefaultTheme;
const router = useRouter();
const { page } = useData();

// Setup medium zoom with the desired options
const setupMediumZoom = () => {
  mediumZoom("[data-zoomable]", {
    background: "transparent",
  });
};

// Toggle nav title visibility based on page
const toggleNavTitle = () => {
  const isHomePage = page.value.relativePath === 'index.md';
  if (isHomePage) {
    document.body.classList.add('hide-nav-title');
  } else {
    document.body.classList.remove('hide-nav-title');
  }
};

// Apply medium zoom on load
onMounted(() => {
  setupMediumZoom();
  toggleNavTitle();
});

// Subscribe to route changes to re-apply medium zoom effect and toggle nav title
router.onAfterRouteChanged = () => {
  setupMediumZoom();
  toggleNavTitle();
};

// Watch for page changes
watch(() => page.value.relativePath, toggleNavTitle);
</script>

<template>
  <Layout />
</template>

<style>
.medium-zoom-overlay {
  backdrop-filter: blur(5rem);
}

.medium-zoom-overlay,
.medium-zoom-image--opened {
  z-index: 999;
}
</style>