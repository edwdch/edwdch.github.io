import { defineConfig } from 'vitepress'
import lightbox from "vitepress-plugin-lightbox"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "爱德华笔记",
  lang: 'zh-CN',
  description: "爱德华的学习笔记，通常记录一些开发中遇到的问题和解决方案。",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }]
  ],
  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      themeConfig: {
        docFooter: {
          prev: '上一页',
          next: '下一页'
        },
        lastUpdatedText: '最后更新',
        returnToTopLabel: '返回顶部',
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '主题',
        outline: {
          label: '大纲',
        }
        // 其他需要翻译的文本...
      }
    },
    // 英文配置...
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '主页', link: '/' },
      { text: 'Linux', link: '/linux/linux' },
      { text: 'Windows', link: '/windows/xiaohe' },
    ],
    logo: '/favicon.png',
    sidebar: {
      '/linux': [
        {
          text: 'Linux',
          items: [
            { text: 'Linux', link: '/linux/linux' },
            { text: 'Guacamole', link: '/linux/guacamole' },
          ]
        },
      ],
      '/windows': [
        {
          text: 'Windows',
          items: [
            { text: '小鹤双拼', link: '/windows/xiaohe' },
            { text: '开发环境', link: '/windows/development' },
          ]
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/edwdch/edwdch.github.io' }
    ],
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                }
              }
            }
          }
        }
      }
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Edward Chen'
    }
  },
  markdown: {
    config: (md) => {
      // Use lightbox plugin
      md.use(lightbox, {});
    },
  },
})
