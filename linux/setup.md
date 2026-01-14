---
title: Linux 服务器起步
icon: ubuntu.webp
variables:
  - key: GIT_USERNAME
    default: someone
    label: "Git 用户名"
  - key: GIT_EMAIL
    default: someone@example.com
    label: "Git 邮箱"
---

我编写这篇文章时，已经使用 Linux 服务器作为我远程开发的环境有一段时间了，在使用过程中，我逐渐积累了一些经验，也发现了当初的配置存在一些问题。所以希望从一个全新开始的角度，来写一篇 Linux 服务器起步配置的文档。

我使用一台零刻的迷你主机作为我的本地 Linux 服务器，安装了 `Ubuntu Server 22.04.5 LTS` 版本，安全维护可以持续到 2036 年，日常仅需维护基础的软件升级即可。

我的家庭内网使用了软路由接管，配置了科学上网服务，因此接入这个网络的服务器本身不需要额外配置代理，这一点需要注意，因为 Docker 等软件如果不配置代理，大概率是无法安装成功的，也无法拉取官方镜像。

::: warning
如果你的服务器没有访问外网的能力，后续的一些步骤你可能无法完成。
:::

## 安装源配置

我使用的是阿里云的镜像源，在修改之前，务必备份原有的源配置文件：

```bash
sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak
```

接着你就可以修改 `/etc/apt/sources.list` 文件，内容如下：

```bash
deb https://mirrors.aliyun.com/ubuntu/ jammy main restricted universe multiverse
# deb-src https://mirrors.aliyun.com/ubuntu/ jammy main restricted universe multiverse

deb https://mirrors.aliyun.com/ubuntu/ jammy-security main restricted universe multiverse
# deb-src https://mirrors.aliyun.com/ubuntu/ jammy-security main restricted universe multiverse

deb https://mirrors.aliyun.com/ubuntu/ jammy-updates main restricted universe multiverse
# deb-src https://mirrors.aliyun.com/ubuntu/ jammy-updates main restricted universe multiverse

# deb https://mirrors.aliyun.com/ubuntu/ jammy-proposed main restricted universe multiverse
# deb-src https://mirrors.aliyun.com/ubuntu/ jammy-proposed main restricted universe multiverse

deb https://mirrors.aliyun.com/ubuntu/ jammy-backports main restricted universe multiverse
# deb-src https://mirrors.aliyun.com/ubuntu/ jammy-backports main restricted universe multiverse
```

::: info
1. `deb` 表示二进制包源，`deb-src` 表示源代码包源，通常我们只需要二进制包源即可。注释掉源代码包源可以加快 `apt update` 的速度。
2. 启用了 `main`、`security`、`updates` 和 `backports` 软件源，`proposed` 源则不建议启用，因为它包含了未经充分测试的软件包，可能会影响系统稳定性。
:::


修改完成，运行以下命令更新软件包列表：

```bash
sudo apt update
sudo apt upgrade
```

建议在系统安装完成后，第一时间执行上述命令，确保之后的安装步骤顺利进行。有时候更新会需要重启系统，按照提示操作即可。

## Docker

Docker 是服务器一定要装的软件，可以快速部署服务而不必污染系统环境，升级和迁移上面的服务也非常方便。

这里照搬 [官方文档](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository) 的步骤：

```bash
# Add Docker's official GPG key:
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
```

::: info
以上的命令除了安装了几个软件包以外，还写入了 2 个文件。
- `/etc/apt/keyrings/docker.asc`
- `/etc/apt/sources.list.d/docker.sources`
:::

接着就可以安装 Docker 引擎了：

```bash
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

检查版本来验证安装：

```bash
docker --version
docker compose version
```

## Git

运行下面的命令看看有没有预装 Git：

```bash
git --version
```

没安装的话，运行下面的命令安装：

```bash
sudo apt install git
```

初始化 Git 的全局配置：

```bash
git config --global user.name "$[GIT_USERNAME]"
git config --global user.email "$[GIT_EMAIL]"
```

## 目录规划

在你全新 setup 一个服务器时，规划好目录结构是非常重要，尤其是你需要长期维护这个服务器，并且还在上面跑很多服务的时候。

在根目录新建一个 `data` 目录，我们日后所有的数据和配置文件都放在这里，如果你当前用户不是 `root`，就取消注释第二行的命令，把目录的所有权转移给当前用户：

```bash
sudo mkdir /data
# sudo chown $USER:$USER /data
```

data 目录下，我们再新建几个子目录，约定它们的用途：

| 目录名 | 用途 |
|--------|------|
| `docker` | 存放 docker compose 编排文件，每个服务一个子目录(如 `/data/docker/guacamole`)，包含 `docker-compose.yml` 及相关配置 |
| `app` | 有些服务不适合用 docker 部署，可以把它们放在这里，和 `docker` 目录类似，每个服务一个子目录 |
| `projects` | 存放个人项目代码的地方，通常来说，这里面直接就存放你的各个代码仓库，不过有时候我们也有需要拉取别人项目来研究的情况，所以你还可以再分一级，比如按 `github` 的 `username` 来分第一级，然后第二级才是具体的项目；亦或者你可以直接分 2 个文件夹，一个是自己的项目，另一个是别人的项目，我是后面这种分法。 |
| `nginx` | Nginx 的配置文件存放目录，我们日后要修改 nginx.conf 将对应的目录指向这里。 |

清晰的目录可以让你更好地管理服务器上的各种服务和项目，假如你使用 Git 来追踪这些配置的话，更是锦上添花，所以我建议你在 `/data/docker`, `/data/app` 和 `/data/nginx` 目录下都初始化 Git 仓库，并且关联到 Github 上的**私有**仓库


::: danger
一定不要把配置文件放到公开仓库，否则可能会泄露隐私信息。
:::


一旦你通过 Git 来追踪配置文件变更，一来可以在任何时候回滚到之前的版本，在你配置错误时非常有用；二来可以方便地在多台服务器之间同步配置文件，省去重复劳动。

## 推荐服务

下面是一些我推荐你在 Linux 服务器上部署的服务，可以极大提升你的使用体验，直接点击服务名也可以链接过去查看了。

| 服务 | 用途 |
|------|------|
| [Nginx](./nginx) | 高性能的反向代理服务器，可以为你部署的各种服务提供 HTTPS 支持和访问控制。 |
| [VS Code Server](./vscode-server) | VS Code 的 Web 版本，几乎包含桌面版的所有功能 |
| [Authelia](./authelia) | 内网服务的认证方案，可以为你的 Nginx 反向代理提供统一的身份验证和授权服务，如果你需要向外网开放内网服务，强烈建议使用 Authelia 来保护你的服务安全。 |
| [Guacamole](./guacamole) | 基于浏览器的远程桌面服务，可以通过 RDP/VNC/SSH 等协议远程连接到你的其他服务器或电脑，省去了安装各种客户端软件的麻烦。 |
| [Gost](./gost) | 高性能的代理服务器，可以帮助你快速部署 HTTPS 代理服务。| 
| [Dockur](./dockur) | 没有物理机但需要运行 Windows 应用时的解决方案，可以在 Docker 容器中运行 Windows 系统，通过 RDP 远程连接使用。 |
| [ttyd](./ttyd) | 在无法使用 SSH 访问服务器时，通过浏览器访问服务器的命令行界面。 |