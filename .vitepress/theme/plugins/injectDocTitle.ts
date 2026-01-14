import type MarkdownIt from 'markdown-it'
import type { MarkdownRenderer } from 'vitepress'

export function injectDocTitle(md: MarkdownIt & MarkdownRenderer) {
  const originalRender = md.render.bind(md)
  
  md.render = function (src: string, env?: any): string {
    let result = originalRender(src, env)
    const frontmatter = env?.frontmatter
    
    let prefix = ''
    
    // Insert VariablesEditor if variables exist (it will handle all replacements client-side)
    if (frontmatter?.variables && Object.keys(frontmatter.variables).length > 0) {
      const variablesBase64 = btoa(JSON.stringify(frontmatter.variables))
      prefix += `<VariablesEditor variables-base64="${variablesBase64}" />\n`
    }
    
    // Insert DocTitle if title exists
    if (frontmatter?.title) {
      const title = frontmatter.title
      const icon = frontmatter.icon || ''
      prefix = `<h1><DocTitle title="${title}" ${icon ? `icon="${icon}"` : ''} /></h1>\n` + prefix
    }
    
    return prefix + result
  }
}


