<script setup lang="ts">
import { watch, provide, reactive, computed, onMounted, nextTick } from 'vue'
import { Settings, RotateCcw, X } from 'lucide-vue-next'
import { startCase } from 'lodash-es'

const props = defineProps<{
  variablesBase64: string
}>()

// Generate storage key based on variables base64
const storageKey = computed(() => {
  return `vitepress-variables-${props.variablesBase64.slice(0, 16)}`
})

// Load saved values from localStorage
const loadFromStorage = (): Record<string, string> | null => {
  if (typeof localStorage === 'undefined') return null
  try {
    const saved = localStorage.getItem(storageKey.value)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

// Save values to localStorage
const saveToStorage = (values: Record<string, string>) => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(storageKey.value, JSON.stringify(values))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

// Clear values from localStorage
const clearStorage = () => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(storageKey.value)
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
  }
}

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
const initialValues = reactive<Record<string, string>>({})

// Check if a variable has been modified
const isModified = (key: string) => {
  return values[key] !== initialValues[key]
}

// Check if any variable has been modified
const hasAnyModification = computed(() => {
  return Object.keys(values).some(key => isModified(key))
})

// Reset a single variable
const resetVariable = (key: string) => {
  values[key] = initialValues[key]
}

// Reset all variables
const resetAll = () => {
  Object.keys(initialValues).forEach(key => {
    values[key] = initialValues[key]
  })
  clearStorage()
}

// Format variable key for display using lodash startCase
const formatKey = (key: string): string => {
  return startCase(key)
}

// Initialize values when variables change
watch(variables, (newVars) => {
  const savedValues = loadFromStorage()
  
  Object.keys(newVars).forEach(key => {
    if (!(key in values)) {
      initialValues[key] = newVars[key]
      // Use saved value if available, otherwise use initial value
      values[key] = savedValues?.[key] ?? newVars[key]
    }
  })
}, { immediate: true })

// Save to localStorage when values change
watch(values, (newValues) => {
  // Only save if there are modifications
  if (hasAnyModification.value) {
    saveToStorage(newValues)
  } else {
    clearStorage()
  }
}, { deep: true })

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
  <div class="mt-4 mb-5 border border-[var(--vp-c-divider)] rounded-lg overflow-hidden bg-[var(--vp-c-bg-soft)]">
    <div class="flex items-center justify-between px-4 py-3 bg-[var(--vp-c-bg-alt)] border-b border-[var(--vp-c-divider)]">
      <div class="flex items-center gap-2">
        <Settings :size="16" class="text-[var(--vp-c-text-2)]" aria-hidden="true" />
        <span class="text-[0.85rem] text-[var(--vp-c-text-2)] leading-relaxed">变量设置</span>
      </div>
      <button
        @click="resetAll"
        class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[var(--vp-c-text-2)] hover:text-[var(--vp-c-text-1)] bg-[var(--vp-c-bg)] hover:bg-[var(--vp-c-bg-soft)] border border-[var(--vp-c-divider)] rounded transition-all cursor-pointer"
        :class="{ 'invisible pointer-events-none': !hasAnyModification }"
        title="重置所有变量"
      >
        <RotateCcw :size="14" />
        <span>重置</span>
      </button>
    </div>
    <div class="px-4 py-4 flex flex-col gap-3">
      <div v-for="(, key) in variables" :key="key" class="flex items-center gap-4">
        <label 
          :for="`var-${key}`" 
          class="min-w-[120px] text-sm text-[var(--vp-c-text-2)]"
        >
          {{ formatKey(key) }}
        </label>
        <div class="flex-1 relative">
          <input
            :id="`var-${key}`"
            v-model="values[key]"
            type="text"
            class="w-full px-3 py-2 border border-[var(--vp-c-divider)] rounded bg-[var(--vp-c-bg)] text-[var(--vp-c-text-1)] font-mono text-sm transition-colors duration-250 outline-none focus:border-[var(--vp-c-brand-1)]"
            :class="{ 'pr-9': isModified(key) }"
          />
          <button
            v-if="isModified(key)"
            @click="resetVariable(key)"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--vp-c-text-3)] hover:text-[var(--vp-c-text-1)] transition-colors cursor-pointer"
            :title="`重置 ${key}`"
          >
            <X :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
