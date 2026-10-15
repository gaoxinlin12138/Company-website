# 管理后台使用与部署

## 后台怎么打开

- 本地：先双击 `启动项目.py`，再打开 `http://127.0.0.1:8126/admin/login`。
- 线上：在网站域名后加 `/admin/login`，例如 `https://你的域名/admin/login`。
- 登录页会预填管理员账号，只需输入密码。页面没有注册、找回密码或新增管理员入口。

## 第一次部署前的服务器配置

在阿里云面板的 Node 项目环境变量或项目根目录的服务器 `.env` 中配置：

```env
DATABASE_URL="mysql://数据库用户:数据库密码@127.0.0.1:3306/hongcai_wanfu"
NUXT_SESSION_SECRET="至少32位、不可猜测的随机字符串"
ADMIN_USERNAME="你的管理员用户名"
ADMIN_PASSWORD="至少12位的唯一强密码"
```

`.env` 只保存在服务器，不上传到公开仓库。全新数据库第一次访问后台时会创建一个管理员；数据库已有管理员时，环境变量不会覆盖原账号或密码。

## 日常怎么使用

1. 从 `/admin/login` 登录。
2. 左侧菜单分别维护首页轮播、推荐产品、产品、关于我们、新闻、案例、联系方式、社交联系和询价记录。
3. 新内容先保存为草稿并在前台检查，确认图片、中文和英文无误后再发布。
4. 询价记录按“新询价、处理中、已完成”更新状态，内部备注不要填写银行卡、证件或密码等敏感信息。
5. 操作结束后点击左下角“退出登录”，不要在公共电脑保存密码。

后台修改产品、文案和询价状态时，数据直接写入线上 MySQL，一般不需要重新部署。修改 Vue、TypeScript、CSS、图片固定资源或服务端代码时，才需要重新构建和部署。

## 源代码为什么能运行

上传文件本身不会自动运行。阿里云面板中的 Node 项目已经保存了项目目录和启动命令，所以面板能够启动一个持续运行的 Node 进程：

1. `package.json` 告诉包管理器这是 Nuxt 项目，并定义 `build`、`dev` 等命令。
2. `pnpm build` 让 Nuxt 扫描 `pages/`、`layouts/`、`components/` 和 `server/api/`，生成 `.output/`。
3. 生产环境运行 `node .output/server/index.mjs`，这个文件才是实际的服务器启动入口。
4. 面板用进程管理器守护该命令，进程异常时可以重启，并通过反向代理把域名请求转给 Node 端口。

因此不是面板随意“猜到了某个页面入口”。它依据已经配置好的启动命令运行 Nuxt 的构建产物；`app.vue` 是应用根组件，`pages/` 按文件名生成网址，`server/api/` 按文件名生成接口。

## 修改源代码后的线上更新

1. 先备份服务器 `.env`、MySQL 数据库和 `public/uploads/`。
2. 上传本次修改过的源码；不要用本地空目录覆盖服务器上传文件。
3. 在项目目录执行 `pnpm install --frozen-lockfile`。
4. 执行 `pnpm typecheck`，再执行 `pnpm build`。
5. 在阿里云面板重启 Node 项目，启动命令应为 `node .output/server/index.mjs`。
6. 检查前台、`/admin/login`、图片上传和询价提交，再用 `Ctrl + F5` 强制刷新浏览器缓存。

若只上传了源码但没有重新执行 `pnpm build` 并重启进程，线上通常仍会运行旧的 `.output`。

## 安全底线

- 域名必须启用 HTTPS；不要通过 HTTP 输入后台密码。
- 阿里云安全组不要向公网开放 MySQL 3306 和 Node 内部端口，只开放 80/443，并让 Nginx 反向代理 Node。
- 管理员密码不要与邮箱、微信或服务器密码相同，建议由密码管理器生成并保存。
- 定期备份 MySQL 和 `public/uploads/`，至少保留一份不在服务器本机的备份。
- 登录连续失败会被临时限流；会话 Cookie 仅供服务器读取、限制同站使用，并在 12 小时后失效。

## 常见故障处理

### 能登录但一直跳回登录页（HTTP 环境）

会话 Cookie 在生产环境默认带 `Secure` 标记，浏览器只在 HTTPS 下接受它。若域名暂时只能走 HTTP
（例如 ICP 备案已通过、公安备案尚未完成、证书还没签发），会出现"登录接口返回成功、但不跳转、
也不报错"的现象：Cookie 被浏览器丢弃，跳转后服务端读不到会话，于是退回登录页。

临时放行方式，在服务器 `.env` 或面板环境变量中增加：

```env
NUXT_COOKIE_SECURE="false"
```

然后重启 Node 进程。**证书签发并强制 HTTPS 后必须删除这一行**，恢复默认的强制 HTTPS ——
否则后台密码与会话 Cookie 会以明文经过网络。

判断当前是否受此影响：浏览器 `F12` → Application → Cookies，看是否存在
`hongcai_admin_session`。HTTP 访问时它不会出现。

### 登录报 401 账号或密码不正确

`ADMIN_USERNAME` / `ADMIN_PASSWORD` **只在 `admin_users` 表为空时**用于创建第一个管理员。
表里已有记录时这两个变量会被忽略，登录只认 `created_at` 最早的那一条记录。

用恢复脚本重置密码（在项目根目录执行）：

```bash
node scripts/reset-admin.mjs                       # 生成随机强密码，只打印一次
node scripts/reset-admin.mjs --password '自定义密码'  # 指定密码
```

脚本会先列出所有管理员及创建顺序，指出登录实际使用的是哪一个。

### 登录报 503 管理员账号尚未在服务器配置

说明 `NUXT_SESSION_SECRET` 未设置或短于 32 位。在面板环境变量中补上后重启 Node 进程。

### 登录报 429 登录尝试过多

连续失败 5 次会触发 15 分钟限流。等待 15 分钟，或重启 Node 进程立即解除。

### 构建产物启动即报 file:///_entry.js

症状：`node .output/server/index.mjs` 立即退出，报
`TypeError: The argument 'filename' must be a file URL object...Received 'file:///_entry.js'`。

原因是 `@nuxt/icon` 生成的图标加载代码走了运行时 `require` 分支，而该分支依赖的
`globalThis._importMeta_.url` 在共享 chunk 中尚未赋值。触发条件是**构建时 `nuxt.options.dev`
被判为真**（最常见于 `pnpm dev` 同时占用同一个 `.nuxt` 目录的情况下执行 `pnpm build`）。

处理：

```bash
# 先停掉开发服务器，确认没有 dev 进程占用端口
rm -rf .output .nuxt
pnpm build
```

### 更新上传的图片前

`public/uploads/` 是指向项目外部目录的软链接时，重新部署不会影响它；若不是软链接，
则每次覆盖 `.output` 都会丢掉线上新增的图片，务必先备份。

