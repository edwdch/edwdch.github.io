# VS Code Server

有时候我们需要在远程服务器上进行开发，这时候就需要一个远程的编辑器。VS Code Server 就是一个基于浏览器的远程编辑器，可以在浏览器中使用 VS Code 的功能。

本文介绍如何在 Ubuntu 22.04 上安装 VS Code Server。

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

## 创建服务

1. 创建一个新的 systemd 服务文件 `/etc/systemd/system/code-server.service`。

- 这里使用了 root 账户启动，如果需要使用其他账户，需要修改 `User` 字段。
- 启动命令中配置了 `--without-connection-token`，这意味没有连接令牌，任何人都可以连接到服务器。如果暴露到公网，需要先使用 nginx 等反向代理进行安全配置。

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

2. 启动并设置开机自启。

```bash
sudo systemctl daemon-reload
sudo systemctl enable code-server
sudo systemctl start code-server
```

3. 现在可以通过 `http://<server_ip>:8886` 访问 VS Code Server 的 Web 页面。

## Nginx 配置

在 HTTP 环境下，VS Code 的部分功能将受到限制。建议使用 Nginx 反向代理 VS Code Server，添加 HTTPS 支持和 Basic Auth 认证。

1. 生成密钥

这里使用 htpasswd 生成一个密码文件。账号为 `coder`，密码为 `coder_pass`，并将文件移动到 `/etc/nginx/`。

```bash
htpasswd -bc ./passwd coder coder_pass
sudo mv ./passwd /etc/nginx/
```

2. 配置 Nginx

```nginx
server {
    listen 443 ssl;
    server_name code.example.com;

    auth_basic "Restricted Area";
    auth_basic_user_file /etc/nginx/.htpasswd;

    ssl_certificate /etc/nginx/ssl/code.example.com.fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/code.example.com.key.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';

    location / {
        proxy_pass http://localhost:8886;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host:$server_port;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_buffering off;
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 86400s;
    }
}
```

## 注意事项

VS Code Server 每次启动时都会检查并更新服务端，有些情况下可能会出现客户端和服务端版本不一致导致无法访问的问题，这时候需要更新客户端。

```bash
sudo apt update
sudo apt upgrade code
```
