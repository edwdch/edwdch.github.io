# acme.sh

`acme.sh` 是一个用于自动获取和更新 SSL 证书的命令行工具。我们可以通过它来获取免费的 SSL 证书并且保持证书自动更新。通过 SSL 证书，我们可以配置 Nginx 来使用 HTTPS 协议，或者配置 HTTPS 代理。

在我的用例中，我的域名托管在 Cloudflare 上，使用 DNS API 来验证域名所有权。你可以在这里找到原始的中文文档 [acme.sh wiki](https://github.com/acmesh-official/acme.sh/wiki/%E8%AF%B4%E6%98%8E)。

## 安装

```bash
curl https://get.acme.sh | sh -s email=your-email@example.com
```

## 配置 DNS API 来申请证书

在 Cloudflare 中，获取你的 Global API Key 和 Email。 访问这里可以获取 [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)。


```bash
export CF_Key=""
export CF_Email=""
```

建议申请通配符证书，这样申请的证书可以匹配所有子域名。
```bash
HOSTNAME="example.com"
acme.sh --issue --dns dns_cf -d "*.${HOSTNAME}"
```

## 安装证书

以下命令将证书安装到 `/etc/nginx/ssl/` 目录，如果你将证书用于 nginx，请取消注销 `--reloadcmd` 命令。

```bash
acme.sh --install-cert -d '*.${HOSTNAME}' \
  --cert-file      /etc/nginx/ssl/${HOSTNAME}.cert.pem \
  --key-file       /etc/nginx/ssl/${HOSTNAME}.key.pem \
  --fullchain-file /etc/nginx/ssl/${HOSTNAME}.fullchain.pem \
  # --reloadcmd     "sudo systemctl restart nginx"
```