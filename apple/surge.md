---
title: Surge
icon: 'surge.webp'
---


[Surge](https://apps.apple.com/us/app/surge-5/id1442620678) 是我目前为止购买过最贵的 iOS 代理软件了。

价格方面，首次购买需要 49.99 美元，享受一年的更新服务，一年后的新功能需要再次购买更新服务，价格为 14.99 美元。

这个收费模式有点类似于 Jetbrains 的订阅模式，用户在付款的时候等于买断了当前版本到未来一年的所有更新，之后如果想继续使用新功能则需要续费。详细的收费说明可以参考 [Surge 官网的说明](https://kb.nssurge.com/surge-knowledge-base/zh/license/ios-fus)。

由于国区无法上架，所以 App Store 需要切换到其他区比如美区才能购买。

## 官方网站

[Surge 官方中文指引：理解 Surge 原理](https://manual.nssurge.com/book/understanding-surge/cn/)

[Surge 官方知识库](https://kb.nssurge.com/surge-knowledge-base/zh)

## 协议支持

需要注意购买的机场是否支持以下协议，如果是自建，可以使用 `Snell`

- HTTP/HTTPS
- SOCKS5/SOCKS5-TLS
- Shadowsocks
- SNELL
- VMess
- Trojan
- WireGuard
- SSH
- TUIC/TUIC-V5
- HYSTERIA2
- AnyTLS

## 外部资源

### 分流规则

<GitHubRepo url="https://github.com/blackmatrix7/ios_rule_script/tree/master/rule/Surge " />

### 图标集

右键复制链接地址，然后在 Surge 中导入图标集。

- [Qure 彩色风格](https://raw.githubusercontent.com/Koolson/Qure/master/Other/QureColor-All.json)
- [Qure 简约风格](https://raw.githubusercontent.com/Koolson/Qure/master/Other/Quremini.json)
- [Orz-3 彩色风格](https://github.com/edwdch/geosite/raw/refs/heads/master/icons/orz-3-mini.color.json)
- [Orz-3 白色风格](https://github.com/edwdch/geosite/raw/refs/heads/master/icons/orz-3-mini.alpha.json)
- [EDC Country](https://raw.githubusercontent.com/erdongchanyo/icon/main/edc-country-icon-gallery.json)
- [EDC Filter](https://raw.githubusercontent.com/erdongchanyo/icon/main/edc-filter-icon-gallery.json)

### 模块

- [LoonKissSurge](https://surge.qingr.moe) 提供了从 Loon 转换到 Surge 的模块。
- [Nut Repo](https://nutrepo.com) Egen 的模块中心，兼容 Surge。

## 我的规则

我在家庭内网中部署了软路由并且配置了科学上网，所以在家庭内网下的流量全部走直连。

```ini
[Rule]
SUBNET,SSID:WIFI_NAME,DIRECT // 家庭内网下所有流量直连
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/TikTok/TikTok.list,Tiktok,extended-matching // Tiktok
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Telegram/Telegram.list,Telegram,extended-matching
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Gemini/Gemini.list,AI,extended-matching // Gemini
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/OpenAI/OpenAI.list,AI,extended-matching // OpenAI
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Claude/Claude.list,AI,extended-matching // Claude
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Apple/Apple_All_No_Resolve.list,DIRECT,extended-matching // Apple
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/GitHub/GitHub.list,Proxy,no-resolve // Github
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Microsoft/Microsoft.list,Microsoft
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Proxy/Proxy_All_No_Resolve.list,Proxy,extended-matching
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/ChinaMax/ChinaMax_All.list,DIRECT,extended-matching // China
RULE-SET,LAN,DIRECT
GEOIP,CN,DIRECT
FINAL,Proxy,dns-failed
```

## 我的策略组

我配置了一个 All Proxy 的订阅组，其中 include 了所有我购买的机场，节点组则 include 了 All Proxy。

这样配置有一个好处，就是当我购买新的机场后，只需要将新的机场添加到订阅组中，节点组会自动包含新的机场节点。而当我想要移除某个机场时，也只需要将该机场从订阅组中移除即可，不需要修改 HK/SG/US/JP/TW 等节点组。

此外，订阅组的 `type` 被我设置为 `smart`，这样的话，你可以直接在 UI 上设置隐藏，否则其他 `type` 下，隐藏选项不存在。不过即使如此，你也可以手动修改配置文件来隐藏订阅组。

```ini
[Proxy Group]
# > 策略组
Proxy = select, HK, US, JP, TW, SG, icon-url=https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/02ProxySoftLogo/Surge(8).png, no-alert=0, hidden=0, include-all-proxies=0
AI = select, Proxy, US, JP, TW, SG, icon-url=https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/gemini(1).png, no-alert=0, hidden=0, include-all-proxies=0
Telegram = select, Proxy, HK, SG, US, JP, TW, no-alert=0, hidden=0, include-all-proxies=0, icon-url=https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/Telegrampremium.png
Microsoft = select, Proxy, DIRECT, HK, SG, US, JP, TW, no-alert=0, hidden=0, include-all-proxies=0, icon-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Microsoft.png
Tiktok = select, JP, SG, US, TW, no-alert=0, hidden=0, include-all-proxies=0, icon-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/TikTok.png
Emby = select, Proxy, JP, US, no-alert=0, hidden=0, include-all-proxies=0, icon-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Emby.png

# > 节点组
HK = smart, include-other-group=All Proxy, update-interval=0, no-alert=0, hidden=1, include-all-proxies=0, policy-regex-filter=(🇭🇰)|(香港)|(Hong)|(HK), icon-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png
SG = smart, include-other-group=All Proxy, update-interval=0, no-alert=0, hidden=1, include-all-proxies=0, policy-regex-filter=(🇸🇬)|(新加坡)|(Singapore)|(SG), icon-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png
US = smart, include-other-group=All Proxy, update-interval=0, no-alert=0, hidden=1, include-all-proxies=0, policy-regex-filter=(🇺🇸)|(美国)|(States)|(US), icon-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png
JP = smart, include-other-group=All Proxy, update-interval=0, no-alert=0, hidden=1, include-all-proxies=0, policy-regex-filter=(🇯🇵)|(日本)|(Japan)|(JP), icon-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png
TW = smart, include-other-group=All Proxy, update-interval=0, no-alert=0, hidden=1, include-all-proxies=0, policy-regex-filter=(🇨🇳)|(台湾)|(Tai)|(TW), icon-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Taiwan.png

# > 订阅组
机场1 = smart, policy-path=https://example-1.com, update-interval=0, no-alert=0, hidden=1, include-all-proxies=0
机场2 = smart, policy-path=https://example-2.com, update-interval=0, no-alert=0, hidden=1, include-all-proxies=0
机场3 = smart, policy-path=https://example-3.com, update-interval=0, no-alert=0, hidden=1, include-all-proxies=0
All Proxy = smart, no-alert=0, hidden=1, include-all-proxies=0, include-other-group="机场1, 机场2, 机场3", icon-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Global.png
```

## Snell

Snell 是 Surge 独有的协议，如果你使用的是自建服务器，可以考虑使用 Snell 协议。

下载 Snell 服务端:

```bash
sudo apt install unzip wget -y
wget https://dl.nssurge.com/snell/snell-server-v5.0.1-linux-amd64.zip -O /tmp/snell-server.zip
unzip /tmp/snell-server.zip
mv /tmp/snell-server /usr/local/bin/snell-server
chmod +x /usr/local/bin/snell-server
```

> 这里下载的是 5.0.1 的 amd64 版本，需要其他版本可以前往 [Snell 发布页面](https://kb.nssurge.com/surge-knowledge-base/zh/release-notes/snell)

生成 Snell 配置文件：

```bash
mkdir -p /data/snell
snell-server --wizard -c /data/snell/snell-server.conf
```
> 生成文件时，需要按 `Y` 确认写入该文件

添加一个不允许登录的 snell 用户并设置权限：

```bash
sudo useradd -r -s /usr/sbin/nologin snell
sudo chown snell:snell /usr/local/bin/snell-server
sudo chown -R snell:snell /data/snell/
```

新建 Snell systemd 服务 `/etc/systemd/system/snell-server.service`：

```ini
[Unit]
Description=Snell Proxy Service
After=network.target

[Service]
Type=simple
Restart=on-failure
RestartSec=5s
User=snell
Group=snell
LimitNOFILE=51200
ExecStart=/usr/local/bin/snell-server -c /data/snell/snell-server.conf
# 允许绑定低位端口 (如 80/443)，如果不需要低位端口可注释掉
AmbientCapabilities=CAP_NET_BIND_SERVICE
ProtectSystem=full
SyslogIdentifier=snell-server

[Install]
WantedBy=multi-user.target
```

加载并启动 Snell 服务：

```bash
systemctl daemon-reload
systemctl enable snell-server
systemctl start snell-server
systemctl status snell-server
```

在 Surge 中直接使用 Snell 协议连接即可，其中端口和 psk 可以在 `/data/snell/snell-server.conf` 文件中查看。

记得要在服务器的防火墙中开放 Snell 使用的端口，确保 TCP 和 UDP 都已开放。