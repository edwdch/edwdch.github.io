# Linux Commands

这里是一些使用 Linux 时可能会用到的命令。

## 端口占用检查

以检查 5173 端口为例，可以使用以下命令：

```bash
# 1. Socket Statistics
ss -tuln | grep :5173

# 2. Netstat 
netstat -tuln | grep :5173

# 3. Lsof
lsof -i:5173
```