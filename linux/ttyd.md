---
title: 'ttyd 终端配置'
icon: 'ttyd.webp'
variables:
  - key: domain
    default: example.com
    label: "主域名"
  - key: ttyd_user
    default: root
    label: "ttyd 运行用户"
refs:
  - nginx
  - tinyauth
---

在无法使用 SSH 访问服务器时，`ttyd` 是一个非常方便的工具。它可以将终端通过网页的形式暴露出来，让你可以通过浏览器访问服务器的命令行界面。

## 项目仓库

<GitHubRepo url="https://github.com/tsl0922/ttyd" />

## 安装

下载 `ttyd` 的二进制文件，并移动到 `/usr/local/bin` 目录。

这里下载的是 1.7.7 版本的 `ttyd`，你可以去 [Releases 页面](https://github.com/tsl0922/ttyd/releases) 查看最新版本。

```bash
sudo wget https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 -O /usr/local/bin/ttyd
sudo chmod +x /usr/local/bin/ttyd
```

## 配置服务

编辑 `/etc/systemd/system/ttyd.service` 文件，配置 `ttyd` 服务。

注意，这里的 `User` 和 `--cwd` 参数需要根据你的实际用户和目录进行修改。

```ini
[Unit]
Description=Start ttyd script

[Service]
Type=simple
User=$[ttyd_user]
ExecStart=/usr/local/bin/ttyd --writable --cwd /data bash
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## 启动服务

启动并启用 `ttyd` 服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable ttyd
sudo systemctl start ttyd
```

## 访问终端

默认情况下，`ttyd` 会监听 `7681` 端口。你可以通过浏览器访问 `http://your-server-ip:7681` 来使用网页终端。

## Nginx 配置

添加 `/data/nginx/conf.d/ttyd.conf` 文件，配置 Nginx 作为反向代理。

```nginx
server {
    listen 443 ssl;
    server_name console.$[domain];

    include /data/nginx/snippets/ssl-$[domain].conf;
    include /data/nginx/snippets/auth.conf;

    location / {
        proxy_pass http://localhost:7681;

        include /data/nginx/snippets/proxy-headers.conf;
        include /data/nginx/snippets/websocket.conf;
    }
}
```
