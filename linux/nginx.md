---
title: 'Nginx 部署与配置'
icon: 'nginx.webp'
variables:
  - key: domain
    default: example.com
    label: "主域名"
---

在 Linux 部署多种服务时，Nginx 是绕不开的一个组件。它是一个高性能的反向代理服务器，可以为你部署的各种服务提供 HTTPS 支持和访问控制。

## 安装 Nginx

```bash
sudo apt update
sudo apt install nginx
```

安装完成后，Nginx 会自动启动并设置为开机自启

## 目录规划

我们约定一下 Nginx 的目录结构和用途：

| 目录 | 用途 |
|------|------|
| `/etc/nginx/conf.d/` | 存放 Nginx 站点配置文件，每个站点一个 `.conf` 文件 |
| `/etc/nginx/ssl/` | 存放 SSL 证书文件 |
| `/etc/nginx/snippets/` | 存放 Nginx 配置片段，方便复用 |

现在我们来调整一下目录设置，检查 `/etc/nginx/nginx.conf` 文件，找到 `include /etc/nginx/sites-enabled/*;` 这一行，在前面加上 `#` 注释掉它：

```nginx
# include /etc/nginx/sites-enabled/*;
```

接下来验证并重启 Nginx：

```bash
sudo nginx -t
sudo systemctl restart nginx
```

注意，这个重启操作每次都必须按顺序来执行，先用 `nginx -t` 检查配置文件是否正确，如果有错误，Nginx 会给出提示并拒绝重启，避免因为配置错误导致服务不可用。

## 申请 HTTPS 证书

使用 [acme.sh](./acme.sh) 来申请免费的 Let's Encrypt 证书。

## 片段配置

我们有很多服务的配置片段是重复的，我们可以新建一些通用的配置片段，方便后续引用。

### SSL 证书片段

::: code-group

```nginx [/etc/nginx/snippets/$[domain]-ssl.conf]
ssl_certificate /etc/nginx/ssl/$[domain].fullchain.pem;
ssl_certificate_key /etc/nginx/ssl/$[domain].key.pem;
```

:::

### WebSocket 片段

::: code-group

```nginx [/etc/nginx/snippets/websocket.conf]
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";

proxy_buffering off;
proxy_connect_timeout 10s;
proxy_send_timeout 3600s;
proxy_read_timeout 3600s;
tcp_nodelay on;
```

:::

### Proxy Header 片段

::: code-group

```nginx [/etc/nginx/snippets/proxy-headers.conf]
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host:$server_port;
```
:::