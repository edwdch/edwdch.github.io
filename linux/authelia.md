# <DocTitle icon="local:authelia" title="Authelia" />

家庭内网中的服务如果需要向外网开放，通常会面临安全性的问题，所以鉴权是一个重要的环节。

使用 Nginx auth basic 进行简单的用户名密码验证虽然方便，但是不支持 SSO（单点登录），用户体验较差。Authelia 是一个开源的身份验证和授权服务器，支持多种认证方式（如双因素认证），并且可以与 Nginx 集成，实现更安全和灵活的访问控制。

## 工作原理

Authelia 作为一个独立的服务运行，负责处理用户的身份验证请求。当用户尝试访问受保护的资源时，Nginx 会将请求转发给 Authelia 进行验证。Authelia 会根据配置的策略决定是否允许访问，并返回相应的响应给 Nginx。

如果页面需要登录，Authelia 会重定向用户到登录页面，成功登录后，用户会被重定向回原始请求的页面。

## 安装 Authelia

推荐直接使用 Docker 来部署 Authelia，这里使用了 9091 作为 Authelia 的服务端口。

```yaml
services:
  authelia:
    image: authelia/authelia
    container_name: authelia
    volumes:
      - ./config:/config
    environment:
      - TZ=Asia/Shanghai
    depends_on:
      - redis
    # 关键修改：将端口映射到宿主机的 127.0.0.1
    # 这样只有宿主机的 Nginx 能访问它，外网无法绕过 Nginx 直接访问
    ports:
      - "127.0.0.1:9091:9091"
    restart: always

  redis:
    image: redis:alpine
    container_name: authelia_redis
    restart: always
```

## 基础配置

Authelia 的配置文件位于 `./config/configuration.yaml`，启动前请确保已经创建并配置好该文件。

- 涉及到安全性的密钥（如 session secret、encryption key、jwt secret）**必须随机生成**，推荐使用密码管理工具（如 [1Password](https://1password.com/password-generator)）的密码生成功能来生成这些密钥，确保它们的强度和唯一性。

- `example.com` 请替换为你自己的域名。

- `auth.example.com` 请替换为你部署 Authelia 的域名。

- `www.example.com` 为你实际需要保护的域名，当新增需要认证的域名时，请确保在 access_control.rules 添加相应的规则。

```yaml
server:
  address: "tcp://0.0.0.0:9091"

log:
  level: info

session:
  name: authelia_session
  # 必须随机生成
  secret: rZDNF1QEFPHLvxNXhPqu
  expiration: 3600
  cookies:
    - domain: example.com
      authelia_url: https://auth.example.com
      default_redirection_url: https://www.example.com
  redis:
    host: redis # 注意：这里要跟 docker-compose 里的 service name 保持一致
    port: 6379

storage:
  # 必须随机生成
  encryption_key: rZDNF1QEFPHLvxNXhPqu
  local:
    path: /config/db.sqlite3

authentication_backend:
  file:
    path: /config/users_database.yml

notifier:
  filesystem:
    filename: /config/notification.txt

identity_validation:
  reset_password:
    # 必须随机生成
    jwt_secret: rZDNF1QEFPHLvxNXhPqu

access_control:
  default_policy: deny
  rules:
    - domain: "auth.example.com"
      policy: bypass
    - domain: "www.example.com"
      policy: one_factor
```

## 用户配置

使用这个命令来生成密码哈希：`docker run --rm authelia/authelia authelia crypto hash  generate  argon2 --password "password1"`。

配置了以下账户之后，可以使用用户名 `edward` 和密码 `password1` 登录 Authelia。

```yaml
users:
  edward:
    displayname: "Edward"
    # 密码是 "password1"，生产环境请务必修改    
    password: "$argon2id$v=19$m=65536,t=3,p=4$c9Vf/xT21WTm8GxbjhXJTA$jObZ3mU+sWXSwvGSIvr93R8LMF6nnUXrkvLnOelAHmU"
    email: hi@example.com
    groups:
      - admins
      - dev
```

## Nginx 集成

我们新增一个 snippet 文件 `/etc/nginx/snippets/authelia.conf`，内容如下：

```nginx
auth_request /authelia;

# 注意：把 http://auth.example.com 改成你的实际 Authelia 域名
error_page 401 =302 https://auth.example.com/?rd=$target_url;

location = /authelia {
    internal;
    proxy_pass http://127.0.0.1:9091/api/verify;
    
    proxy_pass_request_body off;
    proxy_set_header Content-Length "";
    
    proxy_set_header X-Original-URL $scheme://$http_host$request_uri;
    proxy_set_header X-Forwarded-Method $request_method;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $http_host;
    proxy_set_header X-Forwarded-URI $request_uri;
    proxy_set_header X-Forwarded-For $remote_addr;
}

set $target_url $scheme://$http_host$request_uri;

auth_request_set $user $upstream_http_remote_user;
auth_request_set $groups $upstream_http_remote_groups;
auth_request_set $name $upstream_http_remote_name;
auth_request_set $email $upstream_http_remote_email;

proxy_set_header Remote-User $user;
proxy_set_header Remote-Groups $groups;
proxy_set_header Remote-Name $name;
proxy_set_header Remote-Email $email;
```

在需要认证的 server{} 里引入这个 snippet：

```nginx
server {
    listen 443 ssl;
    server_name www.example.com;

    include /etc/nginx/snippets/authelia.conf;

    ...
}
```