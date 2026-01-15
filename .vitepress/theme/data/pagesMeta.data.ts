import { createContentLoader } from 'vitepress'

export interface PageMeta {
  url: string
  title?: string
  icon?: string
  description?: string
}

export default createContentLoader('**/*.md', {
  includeSrc: false,
  render: false,
  excerpt: false,
  transform(rawData) {
    return rawData.map((page) => {
      // Normalize URL: remove .html suffix for consistent matching
      let url = page.url.replace(/\.html$/, '')
      
      return {
        url,
        title: page.frontmatter?.title,
        icon: page.frontmatter?.icon,
        description: page.frontmatter?.description,
      }
    })
  },
})

declare const data: PageMeta[]
export { data }
