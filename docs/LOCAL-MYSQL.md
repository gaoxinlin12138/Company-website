# 本地 MySQL 开发环境

当前开发机使用 MySQL 8.4.9 ZIP 版，安装目录为：

```text
E:\software\MySQL
```

数据目录为：

```text
E:\software\MySQL\data
```

配置文件：

```text
E:\software\MySQL\my.ini
```

数据库已经创建：`hongcai_wanfu`，字符集为 `utf8mb4`。

连接参数：

```text
主机：127.0.0.1
端口：3306
用户名：root
```

首次启动时 root 暂时没有密码。连接成功后应立即在 Navicat 中设置 root 密码，不要让空密码长期使用。

当前 MySQL 以开发进程运行，尚未注册为 Windows 服务。若需要开机自启，需要以管理员身份执行：

```powershell
E:\software\MySQL\bin\mysqld.exe --install MySQL84 --defaults-file=E:\software\MySQL\my.ini
Start-Service MySQL84
```

