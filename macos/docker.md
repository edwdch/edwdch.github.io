# <DocTitle icon="logos:docker-icon" title="Docker Cli" />

我使用的 Mac Mini M4 版本仅有 16GB 的内存，所以采用 Docker Cli 远程连接到另外一台内存充足的 Linux 服务器来使用 Docker。

## 安装

```bash
brew install docker
```

## 配置连接至远程 Docker 服务器

```bash
docker context create remote-ssh --docker host=ssh://user@host
docker context use remote-ssh
```

至此，可以像使用本地 Docker 一样使用远程 Docker 了。

```bash
docker ps
```


