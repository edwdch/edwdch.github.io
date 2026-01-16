---
title: '使用 acme.sh 获取免费 SSL 证书'
icon: 'letsencrypt.png'
variables:
  - key: domain
    label: "主域名"
    default: example.com
  - key: email
    label: "电子邮箱"
    default: your-email@example.com
  - key: cf_email
    label: "Cloudflare 邮箱"
    default: your-cf-email@example.com
---

`acme.sh` 是一个用于自动获取和更新 SSL 证书的命令行工具。我们可以通过它来获取免费的 SSL 证书并且保持证书自动更新。通过 SSL 证书，我们可以配置 Nginx 来使用 HTTPS 协议，或者配置 HTTPS 代理。

在我的用例中，我的域名托管在 Cloudflare 上，使用 DNS API 来验证域名所有权。你可以在这里找到原始的中文文档 [acme.sh wiki](https://github.com/acmesh-official/acme.sh/wiki/%E8%AF%B4%E6%98%8E)。

## 项目仓库

<GitHubRepo url="https://github.com/acmesh-official/acme.sh"></GitHubRepo>

## 安装

```bash 
curl https://get.acme.sh | sh -s email=$[email]
source ~/.bashrc
```

## 申请证书

在 Cloudflare 中，获取你的 Global API Key 和 Email。 访问这里可以获取 [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)。


```bash
export CF_Key=""
export CF_Email="$[cf_email]"
```

建议申请通配符证书，这样申请的证书可以匹配所有子域名。
```bash
acme.sh --issue --dns dns_cf -d "*.$[domain]"
```

## 安装证书

以下命令将证书安装到 `/data/nginx/ssl/` 目录，并在证书更新后重启 Nginx 服务。

```bash
acme.sh --install-cert -d '*.$[domain]' \
  --cert-file      /data/nginx/ssl/$[domain].cert.pem \
  --key-file       /data/nginx/ssl/$[domain].key.pem \
  --fullchain-file /data/nginx/ssl/$[domain].fullchain.pem \
  --reloadcmd     "sudo systemctl restart nginx"
```