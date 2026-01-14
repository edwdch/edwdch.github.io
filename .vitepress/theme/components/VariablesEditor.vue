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
  <div class="variables-editor">
    <div class="variables-editor__header">
      <span>这篇文章里面有一些变量，你可以手动修改它们的值，文章内容将对应更新</span>
    </div>
    <div class="variables-editor__content">
      <div v-for="(, key) in variables" :key="key" class="variables-editor__row">
        <label :for="`var-${key}`" class="variables-editor__label">{{ key }}</label>
        <input
          :id="`var-${key}`"
          v-model="values[key]"
          type="text"
          class="variables-editor__input"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.variables-editor {
  margin: 1rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}

.variables-editor__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg-alt);
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.9rem;
}

.variables-editor__icon {
  font-size: 1rem;
}

.variables-editor__content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.variables-editor__row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.variables-editor__label {
  min-width: 120px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.variables-editor__input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 0.875rem;
  transition: border-color 0.25s;
}

.variables-editor__input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}
</style>
