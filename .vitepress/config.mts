import { defineConfig } from "vitepress";
import lightbox from "vitepress-plugin-lightbox";
import Components from "unplugin-vue-components/vite";
import UnoCSS from "unocss/vite";
import { injectDocTitle } from "./theme/plugins/injectDocTitle";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Edward's Blog",
  lang: "zh-CN",
  description: "经验之谈",
  cleanUrls: false,
  lastUpdated: true,
  head: [["link", { rel: "icon", href: "/favicon.webp" }]],
  locales: {
    root: {
      label: "中文",
      lang: "zh-CN",
      themeConfig: {
        docFooter: {
          prev: "上一页",
          next: "下一页",
        },
        lastUpdatedText: "最后更新",
        returnToTopLabel: "返回顶部",
        sidebarMenuLabel: "菜单",
        darkModeSwitchLabel: "主题",
        outline: {
          label: "大纲",
        },
        // 其他需要翻译的文本...
      },
    },
    // 英文配置...
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "主页", link: "/" },
      { text: "Linux", link: "/linux/" },
      { text: "Apple", link: "/apple/" },
    ],
    logo: "/favicon.webp",
    socialLinks: [{ icon: "github", link: "https://github.com/edwdch/edwdch.github.io" }],
    search: {
      provider: "local",
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: "搜索文档",
                buttonAriaLabel: "搜索文档",
              },
              modal: {
                noResultsText: "无法找到相关结果",
                resetButtonTitle: "清除查询条件",
                footer: {
                  selectText: "选择",
                  navigateText: "切换",
                  closeText: "关闭",
                },
              },
            },
          },
        },
      },
    },
    // footer: {
    //   message: "Released under the MIT License.",
    //   copyright: "Copyright © 2024-present Edward Chen",
    // },
  },
  markdown: {
    config: (md) => {
      // Use lightbox plugin
      md.use(lightbox, {});
      // Inject DocTitle component for h1 with frontmatter
      md.use(injectDocTitle);
    },
  },
  vite: {
    plugins: [
      UnoCSS(),
      Components({
        dirs: [".vitepress/theme/components"], // 指定组件目录
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/], // 关键：让 Markdown 文件也能识别组件
      }),
    ],
  },
});
