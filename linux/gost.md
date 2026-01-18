---
title: 'Gost - 使用 HTTPS 代理访问你的内网'
icon: gost.webp
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
export GOST_VERSION="3.2.6"
cd /tmp
wget https://github.com/go-gost/gost/releases/download/v${GOST_VERSION}/gost_${GOST_VERSION}_linux_amd64.tar.gz
tar -zxvf ./gost_${GOST_VERSION}_linux_amd64.tar.gz
mv ./gost /usr/local/bin/gost
chmod +x /usr/local/bin/gost
```

我们下载安装的是 `v3.2.6` 版本，你可以根据需要下载最新版本，下载地址在 [Releases 页面](https://github.com/go-gost/gost/releases)。

升级时，仅需要修改 `GOST_VERSION` 变量，然后重新执行上述命令即可。

## 配置文件

我们使用配置文件来配置 `Gost` 服务，创建 `/data/app/gost/gost.yaml` 文件，内容如下：

::: code-group

```yaml [/data/app/gost/gost.yaml]
services:
  - name: https-proxy
    addr: 0.0.0.0:7443
    handler:
      type: http2
      auth:
        username: $[username]
        password: $[password]
      metadata:
        knock: www.google.com
        probeResist: code:404
    listener:
      type: http2
      tls:
        certFile: /data/ssl/$[domain].fullchain.pem
        keyFile: /data/ssl/$[domain].key.pem
      metadata:
        knock: www.google.com
        probeResist: code:404
    metadata:
      knock: www.google.com
      probeResist: code:404
```

:::

这份配置文件定义了一个 HTTPS 代理服务，监听在 `7443` 端口，使用 HTTP/2 协议，并启用了用户名和密码认证。

::: tip
注意，这份配置还启用了探测防御功能，收到探测请求时返回 `404` 状态码，仅当访问主机名为 `www.google.com` 时才响应请求。当你在 `Switch Omega` 插件中使用时，需要先访问一次 `www.google.com`，然后再使用代理访问其他网站。
:::
## 权限约束

Gost 作为一个向外部开放的代理服务，一旦被攻破，可能会被用来进行恶意活动。因此，我们需要对 Gost 进程进行权限约束，限制其访问权限。

创建一个专用用户 `gost` 来运行 Gost 服务，配置数据目录的权限，并加入 `ssl-cert` 组以访问 SSL 证书。

```bash
sudo useradd -rs /bin/false gost
sudo chown -R gost:gost /data/app/gost
sudo chmod 700 /data/app/gost
sudo usermod -aG ssl-cert gost
```

## 配置服务

我们添加一个 `/etc/systemd/system/gost.service` 文件，内容如下：

```ini
[Unit]
Description=GOST Proxy Server
After=network.target
Wants=network.target

[Service]
Type=simple
User=gost
Group=gost
ExecStart=/usr/local/bin/gost -C /data/app/gost/gost.yaml
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

# 允许非 root 用户绑定特权端口 (如 80, 443)
AmbientCapabilities=CAP_NET_BIND_SERVICE
CapabilityBoundingSet=CAP_NET_BIND_SERVICE

NoNewPrivileges=true
ProtectHome=true
ProtectSystem=full
PrivateTmp=true
ProtectControlGroups=true
ProtectKernelModules=true
ProtectKernelTunables=true
RestrictRealtime=true

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable gost
sudo systemctl start gost
```

查看日志：

```bash
sudo journalctl -u gost.service -fc
```

## 配置客户端

在客户端配置代理，使用 `https://username:password@example.com:7443` 作为代理地址。

## 定时重启

修改 `/data/app/acme.sh/reloadcmd.sh` 脚本，**添加**重启 `Gost` 服务的命令。

```bash
# 重启 Gost 服务
sudo systemctl restart gost
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