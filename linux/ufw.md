---
title: 'UFW - 简单易用的防火墙工具'
icon: 'ubuntu.webp'
---

UFW (Uncomplicated Firewall) 是一个简单易用的防火墙工具，适用于 Ubuntu 和其他基于 Debian 的系统。它提供了一个命令行界面，使用户能够轻松地管理防火墙规则。

当你的 VPS 提供商没有提供防火墙功能时，务必使用 UFW 来保护你的服务器安全。

## 安装

在 Ubuntu 上，UFW 通常已经预装。如果没有，可以使用以下命令安装：

```bash
sudo apt update
sudo apt install ufw
```

## 基本使用

在启用之前，建议先配置基本的规则，防止误操作导致无法访问服务器。

1. 允许 SSH 连接：

```bash
sudo ufw allow 22/tcp
```

2. 允许 HTTP 和 HTTPS 连接：

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

3. 默认拒绝外部主动连入的请求，默认允许内部主动连出的请求：

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

4. 一切配置完成后，启用 UFW：

```bash
sudo ufw enable
```

5. 查看 UFW 状态和规则：

```bash
sudo ufw status verbose
```