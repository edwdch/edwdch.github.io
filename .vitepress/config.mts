import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Edward's Notes",
  description: "This is where Edward keeps some notes.",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '主页', link: '/' },
      { text: '常用配置', link: '/configs/xiaohe' }
    ],
    logo: '/favicon.png',
    sidebar: {
      '/configs': [
        {
          text: '常用配置',
          items: [
            { text: '小鹤双拼', link: '/configs/xiaohe' },
            { text: '开发环境', link: '/configs/development' },
            { text: 'Linux', link: '/configs/linux' },
          ]
        },
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/edwdch/edwdch.github.io' }
    ],
    search: {
      provider: 'local'
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Edward Chen'
    }
  },
})
