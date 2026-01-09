# <DocTitle icon="vscode-icons:file-type-vscode" title="VS Code Server" />

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

> [!NOTE]
> 以上的命令除了安装了几个软件包以外，还写入了 2 个文件。
> ```bash
> root@ubuntu-server:~# ll /etc/apt/keyrings | grep 'microsoft'
> -rw-r--r-- 1 root root 3817 Aug  1  2024 microsoft.gpg
> 
> root@ubuntu-server:~# ll /etc/apt/sources.list.d/ | grep 'vscode'
> -rw-r--r-- 1 root root  112 Aug 15  2024 vscode.list
> ```

## 创建服务

新建一个 `systemd` 服务文件 `/etc/systemd/system/code-server.service`。

::: code-group

```ini [/etc/systemd/system/code-server.service]
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

:::

> [!IMPORTANT]
> 1. 这里使用了 root 账户启动，如果需要使用其他账户，需要修改 `User` 字段。但是这也会限制启动后的 VS Code 的访问权限。
> 2. 启动命令中配置了 `--without-connection-token`，这意味没有连接令牌，任何人都可以连接到服务器。如果暴露到公网，需要先使用 nginx 等反向代理进行安全配置。

启动并设置开机自启。

```bash
sudo systemctl daemon-reload
sudo systemctl enable code-server
sudo systemctl start code-server
```

::: details 如果你不熟悉 systemd 的话，点这里查看
1. `daemon-reload` 命令会重新加载 `systemd` 的配置文件，以便识别新添加或修改的服务文件。每次你添加或修改服务文件后，都需要运行这个命令。
2. `enable` 命令会设置服务在系统启动时自动运行。
3. `start` 命令会立即启动服务。
:::

现在可以通过 `http://<server_ip>:8886` 访问 VS Code Server 的 Web 页面。

## Nginx 配置

在 HTTP 环境下，VS Code 的部分功能将受到限制。建议使用 Nginx 反向代理 VS Code Server，添加 HTTPS 支持和 Basic Auth 认证。

这里使用 htpasswd 生成一个密码文件。账号为 `coder`，密码为 `coder_pass`，并将文件移动到 `/etc/nginx/`。

```bash
htpasswd -bc ./passwd coder coder_pass
sudo mv ./passwd /etc/nginx/
```

添加 Nginx 配置文件 `/etc/nginx/conf.d/code-server.conf`。

::: code-group

```nginx [/etc/nginx/conf.d/code-server.conf]
server {
    listen 443 ssl;
    server_name code.example.com;

    auth_basic "Restricted Area";
    auth_basic_user_file /etc/nginx/.htpasswd;

    include /etc/nginx/snippets/example.com-ssl.conf;

    location / {
        proxy_pass http://localhost:8886;
        
        include /etc/nginx/snippets/proxy-headers.conf;
        include /etc/nginx/snippets/websocket.conf;
    }
}
```

:::

::: info
代码里用到的 `example.com-ssl.conf`, `proxy-headers.conf` 和 `websocket.conf` 片段配置请参考 [Nginx 章节](./nginx.md#片段配置)。
:::

## 注意事项

VS Code Server 每次启动时都会检查并更新服务端，有些情况下可能会出现客户端和服务端版本不一致导致无法访问的问题，这时候需要更新客户端。

```bash
sudo apt update
sudo apt upgrade code
```
