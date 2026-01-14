---
title: 'VS Code Server 部署与配置'
icon: 'vscode.webp'
variables:
  - key: domain
    default: example.com
    label: "主域名"
refs:
  - setup
  - nginx
  - authelia
---

我们需要在远程服务器上进行开发，这时候就需要一个远程的编辑器。VS Code Server 就是一个基于浏览器的远程编辑器，可以在浏览器中使用 VS Code 的功能。

## 安装 VS Code

以下命令来自 [VS Code Server 官方文档](https://code.visualstudio.com/docs/setup/linux#_debian-and-ubuntu-based-distributions)。如果是其他发行版，也可以参考这个链接自行安装。

```bash
sudo apt-get install wget gpg
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg
echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" |sudo tee /etc/apt/sources.list.d/vscode.list > /dev/null
rm -f packages.microsoft.gpg

sudo apt install apt-transport-https
sudo apt update
sudo apt install code
```

::: info
以上的命令除了安装了几个软件包以外，还写入了 2 个文件。

- `/etc/apt/keyrings/microsoft.gpg`
- `/etc/apt/sources.list.d/vscode.list`
:::

## 创建服务

新建一个 `systemd` 服务文件 `/etc/systemd/system/code-server.service`。

```ini
[Unit]
Description=VS Code Server
After=network.target

[Service]
Type=simple
User=root
Environment="SHELL=/bin/bash"
ExecStart=/usr/bin/code serve-web --host=0.0.0.0 --port=8886 --without-connection-token --accept-server-license-terms
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

::: info
1. 这里使用了 root 账户启动，如果需要使用其他账户，需要修改 `User` 字段。但是这也会限制启动后的 VS Code 的访问权限。
2. 启动命令中配置了 `--without-connection-token`，这意味没有连接令牌，任何人都可以连接到服务器。如果暴露到公网，需要先使用 nginx 等反向代理进行安全配置。
:::

启动并设置开机自启。

```bash
sudo systemctl daemon-reload
sudo systemctl enable code-server
sudo systemctl start code-server
```

现在可以通过 `http://<server_ip>:8886` 访问 VS Code Server 的 Web 页面。

## Nginx 配置

在 HTTP 环境下，VS Code 的部分功能将受到限制。需要使用 Nginx 反向代理 VS Code Server，添加 HTTPS 支持。

添加 Nginx 配置文件 `/data/nginx/conf.d/code-server.conf`。

```nginx
server {
    listen 443 ssl;
    server_name code.$[domain];

    include /data/nginx/snippets/$[domain]-ssl.conf;
    include /data/nginx/snippets/authelia.conf;

    location / {
        proxy_pass http://localhost:8886;
        
        include /data/nginx/snippets/proxy-headers.conf;
        include /data/nginx/snippets/websocket.conf;
    }
}
```

## 注意更新

VS Code Server 每次启动时都会检查并更新服务端，有些情况下可能会出现客户端和服务端版本不一致导致无法访问的问题，这时候需要更新客户端。

```bash
sudo apt update
sudo apt upgrade code
```

## PATH 配置

不管你使用 Node.js 还是 Go，为了让 VS Code 能够正确识别命令行工具的路径，你需要修改 `/etc/systemd/system/code-server.service` 文件中的 `Environment` 字段，添加相应的路径。

例如，你是用了 `nvm` 安装了 v20.18.3 版本的 Node.js，假设该版本的路径是 `/root/.nvm/versions/node/v20.18.3/bin`，那么你需要把这个路径添加到 `PATH` 环境变量中。

```ini
Environment="PATH=/root/.nvm/versions/node/v20.18.3/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
```

该路径后面还跟了系统默认的 `PATH`，以确保其他命令行工具也能被正确识别。

如果缺失了这一步，VS Code 自带的 debug 功能将无法正常工作。