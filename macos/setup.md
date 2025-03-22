# Setup

## 安装 Homebrew

[Homebrew](https://brew.sh/) 是 macOS 上的包管理工具，可以方便地安装和管理软件。

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## 安装 NVM 和 Node.js

[NVM](https://github.com/nvm-sh/nvm) 是 Node.js 的版本管理工具，可以方便地安装和管理 Node.js 的版本。

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
```

安装 Node.js

```bash
nvm install 20
```

设置 Node.js 的默认版本

```bash
nvm use 20
```