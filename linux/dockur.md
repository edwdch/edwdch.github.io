---
title: 'Dockur - 在 Docker 上运行 Windows'
icon: 'dockur.png'
---

Dockur 是一个开源项目，可以让你在 Linux 上通过 Docker 容器运行 Windows 系统。

当你不想在物理机上直接安装 Windows 但是你又不得不运行 Windows 应用时，这是一个非常好的选择。

## 项目仓库

<GitHubRepo url="https://github.com/dockur/windows" />

## 配置 Dockur

新建文件 `/data/docker/windows/docker-compose.yml`，内容如下：

```yaml
services:
  windows:
    image: dockurr/windows
    container_name: windows
    restart: always
    environment:
      VERSION: "11"
      RAM_SIZE: "8G"
      CPU_CORES: "8"
      REGION: "zh-CN"
      KEYBOARD: "en-US"
      LANGUAGE: "zh-CN"
    devices:
      - /dev/kvm
    cap_add:
      - NET_ADMIN
    ports:
      - 8006:8006
      - 3389:3389/tcp
      - 3389:3389/udp
    stop_grace_period: 2m
    volumes:
      - ./data:/storage
```

配置详情如下：

| 配置项 | 说明 |
| --- | --- |
| VERSION | 我们用最新的 Windows 11 |
| RAM_SIZE | 分配给 Windows 的内存大小 |
| CPU_CORES | 分配给 Windows 的 CPU 核心数 |
| REGION | Windows 的区域设置 |
| KEYBOARD | Windows 的键盘布局 |
| LANGUAGE | Windows 的语言 |
| VOLUMES | 我们将 Windows 的数据存储在宿主机的 `./data` 目录下，防止重启后数据丢失 | 

## 启动服务

```bash
cd /data/docker/windows
docker-compose up -d
```

## 访问服务

1. 通过浏览器访问 `https://your-domain.com:8006`，可以进入 Dockurr 的 Web 界面。
2. 通过 RDP 连接 `your-domain.com:3389`，可以远程连接到 Windows 系统。建议搭配 [Guacamole](./guacamole) 使用。