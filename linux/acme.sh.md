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

## 权限设置

我们计划将证书安装到 `/data/ssl/` 目录下，因此需要确保运行相关服务的用户对该目录有读取权限。

大多数 Linux 发行版自带一个 `ssl-cert` 组，可以将需要访问证书的服务用户添加到该组中。

如果没有这个组，自己建一个：

```bash
# 检查组是否存在
grep ssl-cert /etc/group

# 如果没有，创建它
sudo groupadd ssl-cert
```

将证书目录的所属组改为 `ssl-cert`，并设置合适的权限：

```bash
sudo chgrp -R ssl-cert /data/ssl
sudo chmod -R g+rX /data/ssl
```

::: info
`g+r`: 赋予群组（Group）读取权限。

`X`: 这是一个“智能”权限位。它会给目录加上执行权限（以便能够 cd 进入），但不会给普通的文本文件增加执行权限，这样更安全。
:::

## 安装证书

新建一个脚本文件 `/data/app/acme.sh/reloadcmd.sh`，用于在证书更新后重载相关服务。

```bash
touch /data/app/acme.sh/reloadcmd.sh
chmod +x /data/app/acme.sh/reloadcmd.sh
```

脚本内容可以填入你需要重载的服务命令，例如重载 Nginx：

```bash
#!/bin/bash

# 重新执行权限设置
sudo chgrp -R ssl-cert /data/ssl
sudo chmod -R g+rX /data/ssl

# 测试并重载 Nginx 配置
sudo nginx -t
sudo nginx -s reload
```

以下命令将证书安装到 `/data/ssl/` 目录，并在证书更新后执行 `/data/app/acme.sh/reloadcmd.sh` 脚本来重载相关服务。

```bash
acme.sh --install-cert -d '*.$[domain]' \
  --cert-file      /data/ssl/$[domain].cert.pem \
  --key-file       /data/ssl/$[domain].key.pem \
  --fullchain-file /data/ssl/$[domain].fullchain.pem \
  --reloadcmd     "/data/app/acme.sh/reloadcmd.sh"
```

注意，这个命令还会启动自动更新证书的定时任务。证书过期前会自动更新。



## 证书管理

列出已申请的证书：

```bash
acme.sh --list
```

移除某个域名的证书，参数为 `--list` 列出的 `Main_Domain` 字段，如：

```bash
acme.sh --remove -d "*.$[domain]"
```