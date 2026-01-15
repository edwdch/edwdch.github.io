import fs from 'node:fs'
import path from 'node:path'
import { sync as globSync } from 'fast-glob'
import matter from 'gray-matter'

export interface PageMeta {
  url: string
  title?: string
  icon?: string
  description?: string
}

export default {
  load(): PageMeta[] {
    const pattern = '**/*.md'
    const cwd = path.resolve(__dirname, '../../..')
    
    const files = globSync(pattern, {
      cwd,
      ignore: ['node_modules/**', '.vitepress/**'],
    })

    const pages: PageMeta[] = []

    for (const file of files) {
      const fullPath = path.join(cwd, file)
      const content = fs.readFileSync(fullPath, 'utf-8')
      const { data: frontmatter } = matter(content)

      // Convert file path to URL
      let url = '/' + file.replace(/\.md$/, '')
      if (url.endsWith('/index')) {
        url = url.slice(0, -6) || '/'
      }

      pages.push({
        url,
        title: frontmatter.title,
        icon: frontmatter.icon,
        description: frontmatter.description,
      })
    }

    return pages
  },
}

declare const data: PageMeta[]
export { data }
