---
title: 'Gost - 使用 HTTPS 代理访问你的内网'
publishedAt: '2026-01-11'
refs:
  - acme.sh
variables:
  - key: domain
    default: example.com
    label: "主域名"
  - key: username
    default: username
    label: "代理用户名"
  - key: password
    default: password
    label: "代理密码"
---

`Gost` 是一个用于代理和加密的工具。你可以参考 [Gost 官方文档](https://github.com/ginuerzh/gost) 来拓展更多使用场景。

我使用 `Gost` 来替代 Squid 来代理 HTTP 和 HTTPS 请求，这里使用的是 V2 版本。

## 项目仓库

<GitHubRepo url="https://github.com/go-gost/gost" />

## 安装

下载 `Gost` 的二进制文件，并移动到 `/usr/local/bin` 目录。

```bash
cd /tmp/
curl -L https://github.com/ginuerzh/gost/releases/download/v2.12.0/gost_2.12.0_linux_amd64.tar.gz -o gost.tar.gz
tar -xzf gost.tar.gz
chmod +x gost
mv gost /usr/local/bin/
```

## 配置服务

编辑 `/etc/systemd/system/gost.service` 文件，我们来配置一个 HTTPS 代理服务。

以下配置使用 `username:password` 作为代理认证信息，并使用 `$[domain]` 通配符证书。

```ini
[Unit]
Description=GOST Proxy Server
After=network.target
Wants=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/gost -L "http2://$[username]:$[password]@0.0.0.0:443?cert=/data/nginx/ssl/$[domain].fullchain.pem&key=/data/nginx/ssl/$[domain].key.pem"
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

NoNewPrivileges=true
ProtectHome=true
ProtectSystem=full
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

启动服务。

```bash
sudo systemctl daemon-reload
sudo systemctl enable gost
sudo systemctl start gost
```

## 配置客户端

在客户端配置代理，使用 `https://username:password@example.com:443` 作为代理地址。

## 定时重启

SSL 证书更新时，需要重启 `Gost` 服务来加载新的证书。我们可以通过定时任务来实现自动重启。

```bash
sudo crontab -e
``` 

添加以下内容，每周六早上 8 点重启一次 `Gost` 服务。

```cron
0 8 * * 6 /usr/bin/systemctl restart gost >> /var/log/gost-restart.log 2>&1
```

## 卸载

首先停止服务、删除服务文件。

```bash
sudo systemctl stop gost
sudo systemctl disable gost
sudo rm /etc/systemd/system/gost.service
```

然后删除 `Gost` 的二进制文件。

```bash
sudo rm /usr/local/bin/gost
```