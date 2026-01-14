<script setup lang="ts">
import { watch, provide, reactive, computed, onMounted, nextTick } from 'vue'
import { Settings, RotateCcw, X } from 'lucide-vue-next'
import { startCase } from 'lodash-es'

interface VariableDefinition {
  key: string
  default: string
  label?: string
  desc?: string
}

const props = defineProps<{
  variablesBase64: string
}>()

// Helper function to decode base64 with Unicode support
const decodeBase64 = (str: string): string => {
  const binaryString = atob(str)
  const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0))
  return new TextDecoder('utf-8').decode(bytes)
}

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
const variableDefinitions = computed((): VariableDefinition[] => {
  try {
    const parsed = JSON.parse(decodeBase64(props.variablesBase64))
    // Support both old format (Record<string, string>) and new format (VariableDefinition[])
    if (Array.isArray(parsed)) {
      return parsed
    }
    // Convert old format to new format
    return Object.entries(parsed).map(([key, value]) => ({
      key,
      default: value as string,
    }))
  } catch {
    return []
  }
})

// Create a map for quick lookup
const variablesMap = computed(() => {
  const map: Record<string, VariableDefinition> = {}
  variableDefinitions.value.forEach(v => {
    map[v.key] = v
  })
  return map
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
watch(variableDefinitions, (newVars) => {
  const savedValues = loadFromStorage()
  
  newVars.forEach(({ key, default: defaultValue }) => {
    if (!(key in values)) {
      initialValues[key] = defaultValue
      // Use saved value if available, otherwise use initial value
      values[key] = savedValues?.[key] ?? defaultValue
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

  // Handle code blocks separately - they may have syntax highlighting that splits variables
  // e.g., $[email] might become <span>$</span><span>[email]</span>
  content.querySelectorAll('pre code').forEach(codeBlock => {
    const html = codeBlock.innerHTML
    // Match $[varName] that may be split across multiple spans
    // This regex handles: $[var], $</span><span>[var], $</span><span...>[var] etc.
    const regex = /\$(?:<\/span>)?(?:<span[^>]*>)?\[(\w+)\]/g
    
    if (regex.test(html)) {
      // Reset regex lastIndex after test()
      regex.lastIndex = 0
      codeBlock.innerHTML = html.replace(regex, (_, varName) => {
        const value = values[varName] || variablesMap.value[varName]?.default || varName
        return `<span class="page-variable" data-var-name="${varName}">${value}</span>`
      })
    }
  })
  
  // Walk through all text nodes and replace $[varName] (for non-code content)
  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      // Skip nodes inside code blocks (already processed) and inside page-variable spans
      const parent = node.parentElement
      if (parent?.closest('pre code') || parent?.classList.contains('page-variable')) {
        return NodeFilter.FILTER_REJECT
      }
      return NodeFilter.FILTER_ACCEPT
    }
  })
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
      span.textContent = values[varName] || variablesMap.value[varName]?.default || varName
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
        tabindex="-1"
      >
        <RotateCcw :size="14" />
        <span>重置</span>
      </button>
    </div>
    <div class="px-4 py-4 flex flex-col gap-3">
      <div v-for="variable in variableDefinitions" :key="variable.key" class="flex flex-col gap-1">
        <div class="flex items-center gap-4">
          <label 
            :for="`var-${variable.key}`" 
            class="min-w-[120px] text-sm text-[var(--vp-c-text-2)]"
          >
            {{ variable.label || formatKey(variable.key) }}
          </label>
          <div class="flex-1 relative">
            <input
              :id="`var-${variable.key}`"
              v-model="values[variable.key]"
              type="text"
              class="w-full px-3 py-2 border border-[var(--vp-c-divider)] rounded bg-[var(--vp-c-bg)] text-[var(--vp-c-text-1)] font-mono text-sm transition-colors duration-250 outline-none focus:border-[var(--vp-c-brand-1)]"
              :class="{ 'pr-9': isModified(variable.key) }"
            />
            <button
              v-if="isModified(variable.key)"
              @click="resetVariable(variable.key)"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--vp-c-text-3)] hover:text-[var(--vp-c-text-1)] transition-colors cursor-pointer"
              :title="`重置 ${variable.key}`"
              tabindex="-1"
            >
              <X :size="16" />
            </button>
          </div>
        </div>
        <p v-if="variable.desc" class="ml-[136px] text-xs text-[var(--vp-c-text-3)]">
          {{ variable.desc }}
        </p>
      </div>
    </div>
  </div>
</template>
