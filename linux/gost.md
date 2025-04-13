# Gost

`Gost` 是一个用于代理和加密的工具。你可以参考 [Gost 官方文档](https://github.com/ginuerzh/gost) 来拓展更多使用场景。

我使用 `Gost` 来替代 Squid 来代理 HTTP 和 HTTPS 请求，这里使用的是 V2 版本。

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

编辑 `/etc/systemd/system/gost.service` 文件，我们来配置一个 HTTPS 代理服务。如果需要证书，请参考 [acme.sh](./acme.sh.md) 来申请证书。

以下配置使用 `username:password` 作为代理认证信息，并使用 `example.com` 通配符证书。

```ini
[Unit]
Description=GOST Proxy Server
After=network.target
Wants=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/gost -L "http2://username:password@0.0.0.0:443?cert=/etc/nginx/ssl/example.com.fullchain.pem&key=/etc/nginx/ssl/example.com.key.pem"
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