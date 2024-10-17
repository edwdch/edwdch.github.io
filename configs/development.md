# 开发环境

快速配置开发环境中常用的工具。

## Node.js

我们使用 NVM 来管理 Node.js 版本，Windows 下可以使用 [nvm-windows](https://github.com/coreybutler/nvm-windows/releases/latest) 直接安装。Linux 下使用 [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) 安装。

### 镜像加速

#### Windows

对于 Windows 可以直接通过 NVM 配置相关镜像。

```bash
nvm node_mirror https://npmmirror.com/mirrors/node
nvm npm_mirror https://npmmirror.com/mirrors/npm
```

也可以单独给 npm 配置镜像。

```bash
npm config set registry http://registry.npmmirror.com
```

如果希望恢复默认镜像，可以使用以下命令。

```bash
nvm node_mirror https://nodejs.org/dist
nvm npm_mirror https://registry.npmjs.org
npm config set registry https://registry.npmjs.org
```
#### Linux

对于 Linux，将以下内容添加到 `~/.bashrc` 文件中，通过配置环境变量的方式来加速

```bash
# === NPM BINARY CHINA ===
# https://github.com/cnpm/binary-mirror-config/blob/master/package.json#L49
export COREPACK_NPM_REGISTRY="https://registry.npmmirror.com"
export EDGEDRIVER_CDNURL="https://npmmirror.com/mirrors/edgedriver"
export NODEJS_ORG_MIRROR="https://cdn.npmmirror.com/binaries/node"
export NVM_NODEJS_ORG_MIRROR="https://cdn.npmmirror.com/binaries/node"
export PHANTOMJS_CDNURL="https://cdn.npmmirror.com/binaries/phantomjs"
export CHROMEDRIVER_CDNURL="https://cdn.npmmirror.com/binaries/chromedriver"
export OPERADRIVER_CDNURL="https://cdn.npmmirror.com/binaries/operadriver"
export CYPRESS_DOWNLOAD_PATH_TEMPLATE="https://cdn.npmmirror.com/binaries/cypress/\${version}/\${platform}-\${arch}/cypress.zip"
export ELECTRON_MIRROR="https://cdn.npmmirror.com/binaries/electron/"
export ELECTRON_BUILDER_BINARIES_MIRROR="https://cdn.npmmirror.com/binaries/electron-builder-binaries/"
export SASS_BINARY_SITE="https://cdn.npmmirror.com/binaries/node-sass"
export SWC_BINARY_SITE="https://cdn.npmmirror.com/binaries/node-swc"
export NWJS_URLBASE="https://cdn.npmmirror.com/binaries/nwjs/v"
export PUPPETEER_DOWNLOAD_HOST="https://cdn.npmmirror.com/binaries/chrome-for-testing"
export PUPPETEER_DOWNLOAD_BASE_URL="https://cdn.npmmirror.com/binaries/chrome-for-testing"
export PLAYWRIGHT_DOWNLOAD_HOST="https://cdn.npmmirror.com/binaries/playwright"
export SENTRYCLI_CDNURL="https://cdn.npmmirror.com/binaries/sentry-cli"
export SAUCECTL_INSTALL_BINARY_MIRROR="https://cdn.npmmirror.com/binaries/saucectl"
export RE2_DOWNLOAD_MIRROR="https://cdn.npmmirror.com/binaries/node-re2"
export RE2_DOWNLOAD_SKIP_PATH="true"
export PRISMA_ENGINES_MIRROR="https://cdn.npmmirror.com/binaries/prisma"
export npm_config_better_sqlite3_binary_host="https://cdn.npmmirror.com/binaries/better-sqlite3"
export npm_config_keytar_binary_host="https://cdn.npmmirror.com/binaries/keytar"
export npm_config_sharp_binary_host="https://cdn.npmmirror.com/binaries/sharp"
export npm_config_sharp_libvips_binary_host="https://cdn.npmmirror.com/binaries/sharp-libvips"
export npm_config_robotjs_binary_host="https://cdn.npmmirror.com/binaries/robotjs"
```

## Git

为仓库单独配置用户名和邮箱。

```bash
git config user.name "Edward Chen"
git config user.email "hi@example.com"
```
