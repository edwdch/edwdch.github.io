---
title: TinyAuth - 轻量级认证方案
icon: tinyauth.webp
variables:
  - key: domain
    default: example.com
    label: "主域名"
---

`TinyAuth` 是一个轻量级的认证方案，适用于需要简单用户认证的场景。它专门处理同在一域名下的多个服务的统一认证问题。

## 项目仓库

<GitHubRepo url="https://github.com/steveiliop56/tinyauth" />

## 部署

运行以下命令来生成指定用户名和密码的哈希值：

```bash
docker run -i -t --rm ghcr.io/steveiliop56/tinyauth:v4 user create --docker --username edward --password edward-pwd
```

以上命令会输出类似如下的内容：

```log
2026-01-18T09:49:54Z INF cmd/create.go:85 > Creating user username=edward
2026-01-18T09:49:54Z INF cmd/create.go:98 > User created user=edward:$$2a$$10$$bRboZICTvAeWy.Uc3G3.weLgzjrdk15zbGbVniNZ8Kujukfv2el3C
```

添加 `/data/docker/tinyauth/docker-compose.yaml` 文件，将刚刚生成的哈希值填入 `USERS` 环境变量中，完整内容如下：

::: code-group

```yaml [/data/docker/tinyauth/docker-compose.yaml]
services:
  tinyauth:
    image: ghcr.io/steveiliop56/tinyauth:v4
    restart: always
    container_name: tinyauth
    environment:
      - APP_URL=https://auth.$[domain]
      - USERS=user=edward:$$2a$$10$$bRboZICTvAeWy.Uc3G3.weLgzjrdk15zbGbVniNZ8Kujukfv2el3C
    ports:
      - "13000:3000"
```

:::

::: tip
如果有多个用户，可以用逗号分隔再填入 `USERS` 环境变量中。
:::

## 启动

```bash
cd /data/docker/tinyauth
docker compose up -d
```

## Nginx 配置

添加 nginx 配置文件 `/data/nginx/conf.d/tinyauth.conf`，内容如下：

::: code-group
```nginx [/data/nginx/conf.d/tinyauth.conf]
server {
    listen 443 ssl http2;
    server_name auth.$[domain];
    include /data/nginx/snippets/ssl-$[domain].conf;

    location / {
        proxy_pass http://127.0.0.1:13000;
        
        include /data/nginx/snippets/proxy-headers.conf;
        include /data/nginx/snippets/websocket.conf;
    }
}
```
:::

添加 Snippets 便于其他服务集成认证：

::: code-group
```nginx [/data/nginx/snippets/auth.conf]
auth_request /auth-validate;

location = /auth-validate {
    internal;
    proxy_pass http://127.0.0.1:13000/api/auth/nginx;
    proxy_pass_request_body off;
    proxy_set_header Content-Length "";
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header x-forwarded-host $http_host;
    proxy_set_header x-forwarded-uri $request_uri;
    
    auth_request_set $auth_resp_jwt $upstream_http_x_auth_jwt;
    auth_request_set $auth_resp_err $upstream_http_x_auth_err;
}

error_page 401 = @error401;
location @error401 {
    return 302 https://auth.$[domain]/login?redirect_uri=$scheme://$http_host$request_uri;
}
```
:::

## 集成到其他服务

在需要认证的 server{} 里引入这个 snippet：

```nginx
server {
    listen 443 ssl;
    server_name www.$[domain];

    include /data/nginx/snippets/auth.conf;
    ...
}
```