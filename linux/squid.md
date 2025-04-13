# Squid

::: tip
建议使用 [Gost](./gost.md) 来替代 Squid，配置更简单。
:::

Squid 是一个代理服务器，我们可以通过它实现访问控制等功能。当我们需要暴露局域网内的服务给外网访问时，可以使用 Squid 来实现。

本文将介绍如何在 Ubuntu 20.04 上安装和配置 Squid。

## 安装

推荐直接安装在服务器上，而不是 Docker 容器中。尤其当你的内网仅通过 Squid 代理服务器暴露服务时，一旦你的 Docker 出现问题，你的所有服务都将无法访问。

你也可以参考 [Ubuntu 官方文档](https://ubuntu.com/server/docs/how-to-install-a-squid-server) 安装和配置 Squid。

```bash
sudo apt install squid
```

## 配置

首先备份原有配置文件：

```bash
sudo cp /etc/squid/squid.conf /etc/squid/squid.conf.bak
```

使用 htpasswd 生成密码文件。账号为 `squid`，密码为 `squid_pass`，并将文件移动到 `/etc/squid/`。

```bash
htpasswd -bc ./passwd squid squid_pass
sudo mv ./passwd /etc/squid/
```

编辑 Squid 配置文件 `/etc/squid/squid.conf`，替换为以下内容：

```
http_port 3128
auth_param basic program /usr/lib/squid/basic_ncsa_auth /etc/squid/passwd
auth_param basic realm proxy
acl authenticated proxy_auth REQUIRED
http_access allow authenticated
```

## 启动服务

```bash
sudo systemctl enable squid
sudo systemctl start squid
```

## 检查状态

```bash
sudo systemctl status squid
```