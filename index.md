---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Hey, I'm Edward"
  text: "这里会记录一些开发中遇到的问题和解决方案"
  image:
    src: /cat.svg
    alt: 是的，这是一只猫
  actions:
    - theme: brand
      text: Linux
      link: /linux/commands
    - theme: alt
      text: Windows
      link: /windows/xiaohe
    - theme: alt
      text: macOS
      link: /macos/setup

features:
  - title: 极简复现
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g fill="none"><path fill="url(#SVGba0yobxr)" d="M2 9a1 1 0 0 1 1-1h26a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1"/><path fill="url(#SVGHfjgxJZi)" d="M2 9a1 1 0 0 1 1-1h26a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1"/><path fill="url(#SVG6UgtrcuR)" d="M2 9a1 1 0 0 1 1-1h26a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1"/><path fill="url(#SVGba0yobxr)" d="M30 23a1 1 0 0 0-1-1H3a1 1 0 1 0 0 2h26a1 1 0 0 0 1-1"/><path fill="url(#SVGHfjgxJZi)" d="M30 23a1 1 0 0 0-1-1H3a1 1 0 1 0 0 2h26a1 1 0 0 0 1-1"/><path fill="url(#SVG6UgtrcuR)" d="M30 23a1 1 0 0 0-1-1H3a1 1 0 1 0 0 2h26a1 1 0 0 0 1-1"/><path fill="url(#SVG55C22wdi)" d="M16.028 23a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0"/><path fill="url(#SVGbcI8cvYM)" d="M24.973 9a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0"/><defs><radialGradient id="SVGHfjgxJZi" cx="0" cy="0" r="1" gradientTransform="matrix(6.33333 0 0 4.22088 20.667 9)" gradientUnits="userSpaceOnUse"><stop offset=".549" stop-color="#70777d"/><stop offset="1" stop-color="#70777d" stop-opacity="0"/></radialGradient><radialGradient id="SVG6UgtrcuR" cx="0" cy="0" r="1" gradientTransform="matrix(6 0 0 3.99873 11.5 23)" gradientUnits="userSpaceOnUse"><stop offset=".549" stop-color="#70777d"/><stop offset="1" stop-color="#70777d" stop-opacity="0"/></radialGradient><linearGradient id="SVGba0yobxr" x1="31.75" x2="18.413" y1="25.6" y2="-3.834" gradientUnits="userSpaceOnUse"><stop stop-color="#8c959b"/><stop offset="1" stop-color="#a3acb5"/></linearGradient><linearGradient id="SVG55C22wdi" x1="7.927" x2="15.127" y1="18.5" y2="27.5" gradientUnits="userSpaceOnUse"><stop stop-color="#29b4fb"/><stop offset="1" stop-color="#2764e7"/></linearGradient><linearGradient id="SVGbcI8cvYM" x1="16.873" x2="24.073" y1="4.5" y2="13.5" gradientUnits="userSpaceOnUse"><stop stop-color="#29b4fb"/><stop offset="1" stop-color="#2764e7"/></linearGradient></defs></g></svg>
    details: 尽量保持简洁，只记录解决问题的关键步骤
  - title: 忠于官方
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g fill="none"><path fill="url(#SVGC8X8MVfE)" d="M10 19.313V29a1 1 0 0 0 1.515.858L16 27.166l4.485 2.692A1 1 0 0 0 22 29v-9.687A11.45 11.45 0 0 1 16 21c-2.199 0-4.253-.617-6-1.687"/><path fill="url(#SVGdw2MdzHB)" d="M22 20a9.96 9.96 0 0 1-6 2a9.96 9.96 0 0 1-6.36-2.283A9.98 9.98 0 0 1 6 12C6 6.477 10.477 2 16 2s10 4.477 10 10a9.99 9.99 0 0 1-4 8"/><path fill="url(#SVGnMTNYb2L)" d="m16.336 7.21l1.34 2.72l3.003.434c.307.044.43.422.207.64l-2.171 2.115l.513 2.99a.375.375 0 0 1-.544.394L16 15.09l-2.684 1.413a.375.375 0 0 1-.544-.395l.516-2.99l-2.174-2.115a.375.375 0 0 1 .207-.639l3.003-.434l1.34-2.72a.375.375 0 0 1 .672 0"/><defs><radialGradient id="SVGC8X8MVfE" cx="0" cy="0" r="1" gradientTransform="matrix(0 16.8444 -26.4886 0 16 17.646)" gradientUnits="userSpaceOnUse"><stop stop-color="#163697"/><stop offset="1" stop-color="#29c3ff"/></radialGradient><radialGradient id="SVGdw2MdzHB" cx="0" cy="0" r="1" gradientTransform="rotate(56.615 44.518 -68.546)scale(111.635 95.6102)" gradientUnits="userSpaceOnUse"><stop offset=".772" stop-color="#ffcd0f"/><stop offset=".991" stop-color="#e67505"/></radialGradient><radialGradient id="SVGnMTNYb2L" cx="0" cy="0" r="1" gradientTransform="rotate(253.34 15.41 1.386)scale(17.4399 25.1609)" gradientUnits="userSpaceOnUse"><stop stop-color="#b03111"/><stop offset="1" stop-color="#e67505"/></radialGradient></defs></g></svg>
    details: 尽量使用官方文档和工具，维持一致性
  - title: 保持更新
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g fill="none"><path fill="url(#SVGkV19xcse)" d="M15.75 8c.69 0 1.25.56 1.25 1.25V15h3.75a1.25 1.25 0 1 1 0 2.5h-5c-.69 0-1.25-.56-1.25-1.25v-7c0-.69.56-1.25 1.25-1.25"/><path fill="url(#SVGGpymabsz)" d="M16 5.5c5.799 0 10.5 4.701 10.5 10.5S21.799 26.5 16 26.5S5.5 21.799 5.5 16q0-.34.021-.674a1.25 1.25 0 0 0-2.495-.157Q3 15.582 3 16c0 7.18 5.82 13 13 13s13-5.82 13-13S23.18 3 16 3c-3.25 0-6.222 1.193-8.5 3.164V4.25a1.25 1.25 0 1 0-2.5 0v5c0 .69.56 1.25 1.25 1.25h5a1.25 1.25 0 1 0 0-2.5H9.199A10.46 10.46 0 0 1 16 5.5"/><defs><linearGradient id="SVGkV19xcse" x1="13.234" x2="31.423" y1="26.13" y2="18.86" gradientUnits="userSpaceOnUse"><stop stop-color="#d373fc"/><stop offset="1" stop-color="#6d37cd"/></linearGradient><linearGradient id="SVGGpymabsz" x1="3" x2="9.979" y1="4.529" y2="33.75" gradientUnits="userSpaceOnUse"><stop stop-color="#0fafff"/><stop offset="1" stop-color="#0067bf"/></linearGradient></defs></g></svg>
    details: 保持更新，尽量使用最新的工具和技术
---
