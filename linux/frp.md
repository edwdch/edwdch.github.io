---
title: 'Frp - 内网穿透方案'
icon: 'frp.svg'
variables:
  - key: domain
    default: example.com
    label: "主域名"
  - key: frp_token
    default: your_secure_token
    label: "frp 认证 Token"
---

很多时候，我们的家庭宽带并不提供公网 IP 地址，因此使用公网服务器作为中转，实现内网穿透是一个不错的选择。

本文提到的服务端就是指拥有公网 IP 地址的服务器，客户端则是指位于内网中的设备。

## 项目仓库

<GitHubRepo url="https://github.com/fatedier/frp" />

## 服务端防火墙

在开始一切之前，需要确保服务端的防火墙允许正常端口通信，同时屏蔽其他端口以保证安全性。这是内网穿透服务的基础，必须做好。

| 授权策略 | 优先级 | 协议 | 端口 | 说明 |
| -------- | ------ | ---- | ---- | ---- |
| 允许     | 高     | TCP  | 22  | SSH 登录 |
| 允许     | 高     | TCP  | 443 | HTTPS 服务 |
| 允许     | 高     | TCP  | 7000 | frp 服务端 |
| 允许    | 高     | ICMP | | 允许 Ping |
| 拒绝     | 低     | ALL  | ALL  | 拒绝其他所有流量 |

## 服务端安装

前往 [Releases 页面](https://github.com/fatedier/frp/releases) 查看最新版本，下载对应的 Linux 版本。

```bash
wget https://github.com/fatedier/frp/releases/download/v0.66.0/frp_0.66.0_linux_amd64.tar.gz -O /tmp/frp.tar.gz
tar -xzvf /tmp/frp.tar.gz
mv /tmp/frp_0.66.0_linux_amd64/frps /usr/local/bin/frps
chmod +x /usr/local/bin/frps
mkdir -p /data/app/frp/
```

新建配置文件 `/data/app/frp/frps.toml`，内容如下：

```toml
bindPort = 7000
kcpBindPort = 7000
auth.token = "$[frp_token]"
```

> 记得使用 [随机密码生成工具](https://tool.chinaz.com/tools/randompwd) 生成 `auth.token`，以保证安全性

新建 frp systemd 服务 `/etc/systemd/system/frps.service`：

```ini
[Unit]
Description = frp server
After = network.target syslog.target
Wants = network.target

[Service]
Type = simple
Restart = on-failure
RestartSec = 5s
ExecStart = /usr/local/bin/frps -c /data/app/frp/frps.toml

[Install]
WantedBy = multi-user.target
```

加载并启动 frp 服务：

```bash
systemctl daemon-reload
systemctl enable frps
systemctl start frps
systemctl status frps
```

## 客户端安装

与 [服务端安装](#服务端安装) 选择对应的 Linux 版本下载：

```bash
wget https://github.com/fatedier/frp/releases/download/v0.66.0/frp_0.66.0_linux_amd64.tar.gz -O /tmp/frp.tar.gz
tar -xzvf /tmp/frp.tar.gz
mv /tmp/frp_0.66.0_linux_amd64/frpc /usr/local/bin/frpc
chmod +x /usr/local/bin/frpc
mkdir -p /data/app/frp/
```

> 注意，客户端用的是 `frpc`

新建配置文件 `/data/app/frp/frpc.toml`，内容如下：

```toml
serverAddr = "frp.$[domain]"
serverPort = 7000
auth.token = "$[frp_token]"
transport.protocol = "kcp"

[[proxies]]
name = "vscode-tcp"
type = "tcp"
localIP = "127.0.0.1"
localPort = 8886
remotePort = 8886

[[proxies]]
name = "rdp-tcp"
type = "tcp"
localIP = "127.0.0.1"
localPort = 11000
remotePort = 11000
```

> 记得将 `serverAddr` 替换为你的服务器地址，`auth.token` 替换为服务端配置的 token

这里我们绑定了两个端口：

| 代理名称    | 说明                     |
| ----------- | ------------------------ |
| vscode-tcp  | 将服务器的 8886 端口映射到本地的 8886 端口，用于 VS Code 远程开发 |
| rdp-tcp     | 将服务器的 11000 端口映射到本地的 11000 端口，用于远程桌面连接 |

新建 frp systemd 服务 `/etc/systemd/system/frpc.service`：

```ini
[Unit]
Description = frp client
After = network.target syslog.target
Wants = network.target

[Service]
Type = simple
Restart = on-failure
RestartSec = 5s
ExecStart = /usr/local/bin/frpc -c /data/app/frp/frpc.toml

[Install]
WantedBy = multi-user.target
```

加载并启动 frp 服务：

```bash
systemctl daemon-reload
systemctl enable frpc
systemctl start frpc
```

稍等一会儿，运行以下命令查看状态：

```bash
systemctl status frpc
```

应该可以看到类似的连接日志：

```log
Jan 13 21:31:50 ubuntu-server systemd[1]: Started frp client.
Jan 13 21:31:50 ubuntu-server frpc[3107491]: 2026-01-13 21:31:50.169 [I] [sub/root.go:142] start frpc service for config file [/data/app/frp/frpc.toml]
Jan 13 21:31:50 ubuntu-server frpc[3107491]: 2026-01-13 21:31:50.169 [I] [client/service.go:295] try to connect to server...
Jan 13 21:31:50 ubuntu-server frpc[3107491]: 2026-01-13 21:31:50.366 [I] [client/service.go:287] [874b671bec7c9728] login to server success, get run id [874b671bec7c9728]
Jan 13 21:31:50 ubuntu-server frpc[3107491]: 2026-01-13 21:31:50.367 [I] [proxy/proxy_manager.go:173] [874b671bec7c9728] proxy added: [vscode-tcp rdp-tcp]
Jan 13 21:31:50 ubuntu-server frpc[3107491]: 2026-01-13 21:31:50.432 [I] [client/control.go:168] [874b671bec7c9728] [rdp-tcp] start proxy success
Jan 13 21:31:50 ubuntu-server frpc[3107491]: 2026-01-13 21:31:50.432 [I] [client/control.go:168] [874b671bec7c9728] [vscode-tcp] start proxy success
```

现在，你可以通过连接服务器的 8886 端口来使用 VS Code 远程开发功能，或者通过连接服务器的 11000 端口来使用远程桌面功能了。