---
title: HAProxy - 负载均衡器和反向代理服务器
icon: 'haproxy.png'
variables:
  - key: domain
    default: example.com
    label: "主域名"
  - key: username
    default: admin
    label: "Basic Auth 用户名"
  - key: password
    default: your_secure_password
    label: "Basic Auth 密码"
---

HAProxy 是一个高性能的负载均衡器和反向代理服务器。在我的项目中，我使用它来做基于 SNI 和其他规则的流量分发，部分替代 nginx 的功能。

一个非常有用的功能是，我们可以**复用同一个域名和同一个端口**，既用来做 web 页面，又用来做 HTTPS 代理。这样一来，代理服务器就可以在外部扫描时隐藏在 web 服务器后面，增加安全性。

## 安装

```bash
sudo apt update
sudo apt install haproxy
```

## 配置

HAProxy 的配置文件默认位于 `/etc/haproxy/haproxy.cfg`，并且包含一个 `global` 部分和一个 `defaults` 部分。在我们的配置中，不会改动这两部分。

HAProxy 的证书格式有特殊要求，如果你跟我一样使用 acme.sh 生成证书，你可以使用以下命令来生成 HAProxy 需要的证书格式：

```bash
cat /data/ssl/$[domain].fullchain.pem /data/ssl/$[domain].key.pem > /data/ssl/$[domain].haproxy.pem
chmod 600 /data/ssl/$[domain].haproxy.pem
```


## 示例

### HTTPS 反向代理

以下示例为基础的反向代理，`www.$[domain]` 的 HTTPS 流量会被代理到本地的 80 端口

```config
frontend https_in
    bind *:443 ssl crt /data/ssl/$[domain].haproxy.pem alpn h2,http/1.1
    mode http

    compression algo gzip
    compression type text/html text/plain text/css application/javascript application/json
    
    # sni
    acl is_www_sni ssl_fc_sni -i www.$[domain]
    use_backend nginx_backend if is_www_sni

backend nginx_backend
    server blog_app 127.0.0.1:80 check
```

### Basic Auth 保护

以下示例为在反向代理的基础上增加了 Basic Auth 认证，访问 `code.$[domain]` 的 HTTPS 流量会被代理到本地的 8886 端口，并且需要输入用户名和密码

```config
userlist my_auth_users
    user $[username] insecure-password $[password]

frontend https_in
    bind *:443 ssl crt /data/ssl/$[domain].haproxy.pem alpn h2,http/1.1
    mode http

    compression algo gzip
    compression type text/html text/plain text/css application/javascript application/json
    
    # sni
    acl is_code_sni ssl_fc_sni -i code.$[domain]

    http-request auth realm "My Tech" if is_code_sni !{ http_auth(my_auth_users) }

    use_backend code_backend if is_code_sni

backend code_backend
    server local_app 127.0.0.1:8886 check
```

### HTTPS 代理与 Web 服务复用

以下示例为展示如何在同一个域名和端口上复用 HTTPS 代理和 Web 服务，访问 `blog.$[domain]` 的 HTTPS 流量会被代理到本地的 80 端口，而访问 `blog.$[domain]` 的代理请求会被转发到本地的 8080 端口 ( HTTP 代理服务器)。

注意，代理服务器本身并不是 HTTPS 的，而是 HTTP 的，它只需要处理 HTTP 请求，而 HAProxy 则是接受 HTTPS 请求并将其解密后转发给代理服务器。而认证环节本身也是由代理服务器来处理的，HAProxy 只是将请求转发给代理服务器。

```config
frontend https_in
    bind *:443 ssl crt /data/ssl/$[domain].haproxy.pem alpn h2,http/1.1
    mode http

    compression algo gzip
    compression type text/html text/plain text/css application/javascript application/json
    
    # sni
    acl is_blog_sni ssl_fc_sni -i blog.$[domain]

    # proxy
    acl has_proxy_auth hdr(Proxy-Authorization) -m found
    acl is_connect_method method CONNECT

    use_backend proxy_backend if is_blog_sni has_proxy_auth
    use_backend proxy_backend if is_blog_sni is_connect_method

    use_backend nginx_backend if is_blog_sni

backend nginx_backend
    server blog_app 127.0.0.1:80 check

backend proxy_backend
    option http-server-close
    server proxy_srv 127.0.0.1:8080 check
```

## 验证和重载

```bash
haproxy -c -f /etc/haproxy/haproxy.cfg
systemctl reload haproxy
```
