import type MarkdownIt from 'markdown-it'
import type { MarkdownRenderer } from 'vitepress'

export function injectDocTitle(md: MarkdownIt & MarkdownRenderer) {
  const originalRender = md.render.bind(md)
  
  md.render = function (src: string, env?: any): string {
    const result = originalRender(src, env)
    
    // Check if frontmatter has title
    if (env?.frontmatter?.title) {
      const title = env.frontmatter.title
      const icon = env.frontmatter.icon || ''
      
      // Insert DocTitle at the beginning
      const docTitleTag = `<h1><DocTitle title="${title}" ${icon ? `icon="${icon}"` : ''} /></h1>\n`
      return docTitleTag + result
    }
    
    return result
  }
}

