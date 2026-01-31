---
title: Nginx 端口复用配置
icon: 'nginx.webp'
variables:
  - key: domain
    default: example.com
    label: "主域名"
refs:
  - nginx
---

最近新租用了一台 VPS，部署了多个服务，如 VS Code Server、Tinyauth 以及 Gost 等等，对于 VS Code Server 和 Tinyauth，都可以通过反向代理来使用同一个 443 端口，但是 Gost 作为一个正向代理服务，没办法通过反向代理来实现端口复用。

因此我选择使用 Nginx 的 Stream 模块，将多个服务复用到同一个端口上。这样一来，所有服务都可以通过 443 端口访问，简化了防火墙配置和端口管理。

## Stream 块配置

解释一下这个配置，我们使用 `ssl_preread` 模块来读取客户端发起 TLS 握手时的 SNI（Server Name Indication）信息，根据不同的域名将流量转发到不同的后端服务。

当客户端请求 `proxy.$[domain]` 时，流量会被转发到 `forward_proxy_backend`，也就是 Gost 正向代理服务；

当请求 `home.$[domain]` 时，流量会被转发到 `forward_home_proxy_backend`，这是另一个正向代理服务；

其他所有请求都会被转发到 `reverse_proxy_backend`，也就是 Nginx 反向代理服务。

这样一来，我们就实现了在同一个 443 端口上转发多种服务的需求。

::: info
注意高亮行，我们将反向代理的监听地址改为了 `unix:/run/nginx-mux.sock`，如果不这样做，我们需要让反向代理单独占用一个端口比如 444，这样在某些 Web 服务里会导致一些奇怪的问题。此外，使用 Unix Socket 还能提升性能。
:::

```nginx{9}
stream {
    map $ssl_preread_server_name $backend_name {
        proxy.$[domain]           forward_proxy_backend;
        home.$[domain]            forward_home_proxy_backend;
        default                   reverse_proxy_backend;
    }

    upstream reverse_proxy_backend {
        server unix:/run/nginx-mux.sock;
    }

    upstream forward_proxy_backend {
        server 127.0.0.1:7443;
    }

	upstream forward_home_proxy_backend {
        server 127.0.0.1:8443;
    }

    server {
        listen 443;
        proxy_pass $backend_name;
        ssl_preread on;
    }
}
```

完整的 Nginx 配置如下：

::: details
```
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
	worker_connections 4096;
	multi_accept on;
}

stream {
    map $ssl_preread_server_name $backend_name {
        proxy.$[domain]       forward_proxy_backend;
        home.$[domain]		forward_home_proxy_backend;
        default               		reverse_proxy_backend;
    }

    upstream reverse_proxy_backend {
        server unix:/run/nginx-mux.sock;
    }

    upstream forward_proxy_backend {
        server 127.0.0.1:7443;
    }

	upstream forward_home_proxy_backend {
        server 127.0.0.1:8443;
    }

    server {
        listen 443;
        proxy_pass $backend_name;
        ssl_preread on;
    }
}

http {

	##
	# Basic Settings
	##

	sendfile on;
	tcp_nopush on;
	types_hash_max_size 2048;
	# server_tokens off;

	# server_names_hash_bucket_size 64;
	# server_name_in_redirect off;

	include /etc/nginx/mime.types;
	default_type application/octet-stream;

	##
	# SSL Settings
	##

	ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE
	ssl_prefer_server_ciphers on;

	##
	# Logging Settings
	##

	access_log /var/log/nginx/access.log;
	error_log /var/log/nginx/error.log;

	##
	# Gzip Settings
	##

	gzip on;

	# gzip_vary on;
	# gzip_proxied any;
	# gzip_comp_level 6;
	# gzip_buffers 16 8k;
	# gzip_http_version 1.1;
	# gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

	##
	# Virtual Host Configs
	##

	include /data/nginx/conf.d/*.conf;
	# include /etc/nginx/sites-enabled/*;

	server {
		listen 80 default_server;
		listen [::]:80 default_server;
		server_name _;

		return 302 https://$host$request_uri;
	}
}
```
:::

## 反向代理块配置

注意，这里的反向代理块配置需要监听 Unix Socket，跟上面的配置保持一致：

```nginx{2}
server {
    listen unix:/run/nginx-mux.sock ssl;
    server_name code.$[domain];

    include /data/nginx/snippets/ssl-$[domain].conf;
    include /data/nginx/snippets/auth.conf;

    location / {
        proxy_pass http://localhost:8886;
        
        include /data/nginx/snippets/proxy-headers.conf;
        include /data/nginx/snippets/websocket.conf;
    }
}
```
