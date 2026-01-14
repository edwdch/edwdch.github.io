<script setup lang="ts">
import { watch, provide, reactive, computed, onMounted, nextTick } from 'vue'

const props = defineProps<{
  variablesBase64: string
}>()

// Decode variables from base64
const variables = computed(() => {
  try {
    return JSON.parse(atob(props.variablesBase64)) as Record<string, string>
  } catch {
    return {}
  }
})

// Create reactive state for variables
const values = reactive<Record<string, string>>({})

// Initialize values when variables change
watch(variables, (newVars) => {
  Object.keys(newVars).forEach(key => {
    if (!(key in values)) {
      values[key] = newVars[key]
    }
  })
}, { immediate: true })

// Provide values to child components
provide('pageVariables', values)

// Replace $[varName] in the page content
const replaceVariables = () => {
  if (typeof document === 'undefined') return
  
  const content = document.querySelector('.vp-doc')
  if (!content) return
  
  // Walk through all text nodes and replace $[varName]
  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null)
  const nodesToReplace: { node: Text, matches: { start: number, end: number, varName: string }[] }[] = []
  
  let node: Text | null
  while ((node = walker.nextNode() as Text | null)) {
    const text = node.textContent || ''
    const regex = /\$\[(\w+)\]/g
    let match
    const matches: { start: number, end: number, varName: string }[] = []
    
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        varName: match[1]
      })
    }
    
    if (matches.length > 0) {
      nodesToReplace.push({ node, matches })
    }
  }
  
  // Replace nodes with spans
  nodesToReplace.forEach(({ node, matches }) => {
    const text = node.textContent || ''
    const fragment = document.createDocumentFragment()
    let lastIndex = 0
    
    matches.forEach(({ start, end, varName }) => {
      // Add text before the match
      if (start > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, start)))
      }
      
      // Add the variable span
      const span = document.createElement('span')
      span.className = 'page-variable'
      span.dataset.varName = varName
      span.textContent = values[varName] || variables.value[varName] || varName
      fragment.appendChild(span)
      
      lastIndex = end
    })
    
    // Add remaining text
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)))
    }
    
    node.parentNode?.replaceChild(fragment, node)
  })
}

// Update all variable spans when values change
const updateVariableSpans = () => {
  if (typeof document === 'undefined') return
  
  document.querySelectorAll('.page-variable').forEach(span => {
    const varName = (span as HTMLElement).dataset.varName
    if (varName && varName in values) {
      span.textContent = values[varName]
    }
  })
}

onMounted(() => {
  nextTick(() => {
    replaceVariables()
  })
})

watch(values, () => {
  updateVariableSpans()
}, { deep: true })
</script>

<template>
  <div class="my-4 border border-[var(--vp-c-divider)] rounded-lg overflow-hidden bg-[var(--vp-c-bg-soft)]">
    <div class="flex items-center gap-2 px-4 py-3 bg-[var(--vp-c-bg-alt)] border-b border-[var(--vp-c-divider)]">
      <span class="i-carbon-settings-adjust inline-block text-base text-[var(--vp-c-text-2)]" aria-hidden="true"></span>
      <span class="text-[0.85rem] text-[var(--vp-c-text-2)] leading-relaxed">变量设置</span>
    </div>
    <div class="px-4 py-4 flex flex-col gap-3">
      <div v-for="(, key) in variables" :key="key" class="flex items-center gap-4">
        <label 
          :for="`var-${key}`" 
          class="min-w-[120px] font-mono text-sm text-[var(--vp-c-text-2)]"
        >
          {{ key }}
        </label>
        <input
          :id="`var-${key}`"
          v-model="values[key]"
          type="text"
          class="flex-1 px-3 py-2 border border-[var(--vp-c-divider)] rounded bg-[var(--vp-c-bg)] text-[var(--vp-c-text-1)] font-mono text-sm transition-colors duration-250 outline-none focus:border-[var(--vp-c-brand-1)]"
        />
      </div>
    </div>
  </div>
</template>
