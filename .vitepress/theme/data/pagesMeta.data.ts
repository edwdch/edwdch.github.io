import { createContentLoader } from 'vitepress'
import { execSync } from 'child_process'
import { resolve } from 'path'

export interface PageMeta {
  url: string
  title?: string
  icon?: string
  description?: string
  lastUpdated?: number
}

// Get file's last modified time from git
function getGitLastModified(filePath: string): number | undefined {
  try {
    const timestamp = execSync(`git log -1 --format=%ct "${filePath}"`, {
      cwd: resolve(__dirname, '../../..'),
      encoding: 'utf-8',
    }).trim()
    return timestamp ? parseInt(timestamp) * 1000 : undefined
  } catch {
    return undefined
  }
}

export default createContentLoader('**/*.md', {
  includeSrc: false,
  render: false,
  excerpt: false,
  transform(rawData) {
    return rawData.map((page) => {
      // Normalize URL: remove .html suffix for consistent matching
      let url = page.url.replace(/\.html$/, '')
      
      // Get last modified time from git
      const relativePath = url === '/' ? 'index.md' : `${url.slice(1)}.md`
      const lastUpdated = getGitLastModified(relativePath)
      
      return {
        url,
        title: page.frontmatter?.title,
        icon: page.frontmatter?.icon,
        description: page.frontmatter?.description,
        lastUpdated,
      }
    })
  },
})

declare const data: PageMeta[]
export { data }
