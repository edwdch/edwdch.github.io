---
title: 基于浏览器的远程开发解决方案
icon: chrome.webp
variables:
  domain: example.com
---

本文介绍一个基于浏览器的远程开发解决方案，允许你在任何设备上通过浏览器访问完整的开发环境，而无需安装任何本地软件。

环境配置完成后，访问时，你所需要的只是一个 Chrome 浏览器，如果你不在局域网内访问，还需要 [ZeroOmega](https://github.com/zero-peak/ZeroOmega) 插件加上公网 IP。

## 推荐配置流程顺序

1. 阅读 <PostLink href="./setup" /> 来完成基础环境的搭建。
2. 阅读 <PostLink href="./nginx" /> 和 <PostLink href="./acme.sh" /> 来配置好 Nginx 和 SSL 证书。
3. 阅读 <PostLink href="./authelia" /> 来配置好内网统一认证方案，保护你的开发环境不被未授权访问。
4. 阅读 <PostLink href="./vscode-server" /> 配置好网页版本的 VS Code，你便可以通过浏览器来访问服务器，方便后面的配置。
5. 阅读 <PostLink href="./ttyd" /> 来配置好通过网页访问终端，防止 VS Code 无法访问时，紧急情况下还能通过网页终端进行维护。

### Windows 访问

阅读 <PostLink href="./guacamole" /> 来配置好 Windows 远程桌面访问。

如果你没有 Windows 物理机，阅读 <PostLink href="./dockur" /> 来配置基于容器的 Windows。

### 外网访问

如果你有公网 IP，阅读 <PostLink href="./gost" /> 来配置 HTTPS 代理，这样你在外网就可以通过 `ZeroOmega` 插件配置代理来访问你的内网开发环境。

## DNS 配置

假设你有一个域名 `$[domain]`，我建议你为每个服务都配置一个子域名。

首先是内网的 DNS 解析，先给 linux 服务器 IP 配置一个内网域名 `dev.$[domain]`，然后给每个服务配置子域名：

| 服务       | 子域名                     | 类型 | 指向       |
| ---------- | -------------------------- | ---- | ----------- |
| Linux | dev.$[domain]       | A    | 内网 IP |
| Gost | gost.$[domain]      | A | 公网 IP |
| VS Code    | code.$[domain]     | CNAME| dev.$[domain] |
| Apache Guacamole | rdp.$[domain]      | CNAME| dev.$[domain] |
| Authelia  | auth.$[domain]     | CNAME| dev.$[domain] |
| TTYD       | console.$[domain]  | CNAME| dev.$[domain] |