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

### 新部署的数据库缺少内容（「暂无首页轮播内容」「产品分类下拉为空」）

`database/001_initial.sql` 只建表、**不含任何数据**；`002_news_refresh.sql` 是新闻栏目
迁移脚本（开头会删除非新闻分类下的文章与分类），**不要用它初始化新库**。

全新数据库按顺序导入以下文件（宝塔面板先把数据库切到 `hongcai_wanfu` 再导入）：

| 顺序 | 文件 | 内容 |
| --- | --- | --- |
| 1 | `database/001_initial.sql` | 9 张表结构 |
| 2 | `database/003_seed_categories.sql` | 17 条分类（8 顶层 + 9 产品子分类） |
| 3 | `database/004_seed_content.sql` | 首页轮播 4 条、新闻 6 条、案例 5 条、站点设置 5 项 |

两个种子文件都可**重复导入**：已存在的记录按主键更新，站点设置用 `INSERT IGNORE`
不覆盖后台已保存的内容。分类外键按中文名实时解析，各环境分类 ID 不同也不受影响。

导入后刷新后台（`Ctrl + F5`）即可看到数据。

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

## 服务器维护注意事项

以下几条来自实际线上部署的经验，换服务器或交接时请一并交代。

### 关于 git 还原类命令

仓库**已不再跟踪 `public/uploads/`**（见 `.gitignore`），因此在新克隆的机器上，
`git checkout .` / `git reset --hard` / `git restore` / `git clean -fd` 都是安全的，
不会破坏软链接。

但**若某台服务器是在这一改动之前部署的**，它的 git 记录里仍跟踪着旧的上传文件，
那么 `git status` 会把 `public/uploads` 显示为已删除，此时执行上述命令会把这些
文件重新创建为真实文件、覆盖软链接。遇到这种旧部署，先确认 `git status` 里是否
还有 `public/uploads/...` 的 `D` 记录再决定。

`public/uploads.before-data-migration/` 是某次迁移留下的备份目录，确认无用前不要删除。

### 上传文件与仓库自带图片的区别

| 类别 | 位置 | 是否入库 git |
| --- | --- | --- |
| 网站自带的演示图片（案例配图、关于我们配图等） | `public/assets/images/` | ✅ 入库 |
| 后台后传的图片与 PDF | `public/uploads/` → 软链接到 `/www/wwwroot/data` | ❌ 不入库 |

`public/uploads/` 下只保留 `.gitkeep` 占位，用来确保目录存在。**不要把上传文件提交
到 git**——这正是让 `public/uploads` 能安全地做成软链接的前提。

若演示图片的存放位置发生迁移（例如从 `public/uploads/` 移到 `public/assets/images/`），
数据库 `site_settings` 中记录的路径也需要同步更新，否则前台会请求已不存在的旧路径：

```bash
node scripts/fix-upload-paths.mjs           # 预览
node scripts/fix-upload-paths.mjs --apply   # 写入
```

脚本只替换图片路径字符串，不改动任何文字内容。


### 代码更新方式：逐个文件下载

若服务器无法直连 GitHub（国内常见的 `GnuTLS recv error` 或 `Connection closed`），
不要依赖 `git pull`，改为从镜像下载单个文件覆盖：

```bash
B="https://ghproxy.net/https://raw.githubusercontent.com/gaoxinlin12138/Company-website/master"
curl -fL "$B/要更新的文件路径" -o "要更新的文件路径"
```

镜像可用地址（按顺序尝试）：`ghproxy.net`、`ghfast.top`、`gh-proxy.com`。

**文件名含方括号时必须加 `-g`**，否则 curl 会把 `[...]` 当作字符区间展开：

```bash
curl -gfL "$B/pages/news/[slug].vue" -o "pages/news/[slug].vue"
```

更新完成后仍必须重新构建：

```bash
rm -rf .output .nuxt && pnpm build
```

随后在面板重启 Node 进程。此时 git 记录会与实际文件不一致，属正常现象——
只要功能正常即可，不要为了"对齐 git"而执行还原类命令。

### 配置文件与上传目录的位置

| 内容 | 位置 | 说明 |
| --- | --- | --- |
| 环境变量 | 项目根目录 `.env` | 一行一个变量，`KEY=value`，等号两边不能有空格 |
| 上传的图片 | `/www/wwwroot/data`（项目外） | 通过 `public/uploads` 软链接接入，重新部署不受影响 |
| 数据库 | 本机 MySQL 的 `hongcai_wanfu` | 分类、内容、询价、管理员均在此 |
| 构建产物 | `.output/` | 由 `pnpm build` 生成，可直接删除重建 |

`.env` 的常见书写错误会导致变量静默失效：等号两边有空格、两个变量挤在同一行、
行尾带 Windows 换行符。出现「明明填了却读不到」时，先用规范化脚本检查：

```bash
node scripts/format-env.mjs            # 预览：列出问题，并显示规范后的结构（值不显示）
node scripts/format-env.mjs --write    # 确认后写入，自动生成 .env.bak 备份
```

脚本处理 BOM、CRLF、等号旁空格、变量粘连、行尾空白、连续空行，并提示重复定义的键。
它只调整格式，不改变键名与值的内容；若解析不出任何变量会拒绝写入。

想快速人工核对时也可以用：

```bash
grep -n -E '^[A-Z]' .env | sed 's/=.*/=<已填写>/' | cat -A
```

### 排查配置是否生效

登录后台后访问 `/api/admin/config-status`，可查看数据库、会话密钥、百度翻译、
高德地图等配置是否被应用读取（只返回长度与是否就绪，不返回密钥内容）。

注意：`nuxt build` 只在**构建时**读取 `.env`。修改 `.env` 后必须重新构建才生效，
仅重启进程不够。

### 备案与版权信息

网站底部固定显示 ICP 备案号与版权声明，内容硬编码在 `components/SiteFooter.vue`：

```
COPYRIGHT © 2026 红财万富（温州）科技有限公司 | 浙ICP备2026018014号-2
```

**为什么硬编码**：备案信息属于法定公示内容且极少变动，放在代码里可避免被误改。
修改备案号或公司全称时直接改该文件顶部的 `icpNumber` 与 `companyName` 两个常量，
然后重新构建。

**ICP 备案号**必须链接到工信部备案系统（`https://beian.miit.gov.cn/`），
这是备案义务的一部分。变更域名或主体后需同步更新此处。

**公安备案通过后**需要在同一位置补充公安备案编号与官方图标：

1. 登录 `beian.mps.gov.cn`，系统会生成一段带图标的现成代码
2. 把代码加到 `SiteFooter.vue` 的 `.site-foot__legal` 区块内
3. **图标必须使用官方提供的，不可自行绘制或改色**

**布局注意事项**：右下角 `contact-dock`（Contact us 按钮）是固定定位，最高约占
页面底部 150px。`.site-foot__legal` 因此保留了较大的 `padding-bottom`（桌面
5.5rem、移动端 9rem）；调整该按钮位置或尺寸时需一并复核，避免遮挡备案号。

### 上线检查清单

- [ ] `NUXT_SESSION_SECRET` 为至少 32 位的随机字符串
- [ ] 域名已启用 HTTPS；若仍为 HTTP，才临时保留 `NUXT_COOKIE_SECURE="false"`，
      启用 HTTPS 后必须删除该变量并重新构建
- [ ] 管理后台密码为唯一强密码，且未出现在任何文档或提交记录中
- [ ] 百度翻译、高德地图密钥已填写且有效期正常（避免在聊天或截图中明文传递，
      如需更换请在开放平台重新生成）
- [ ] 底部 ICP 备案号与公司全称正确，且备案号链接可跳转到工信部备案系统
- [ ] 公安备案通过后，其编号与官方图标已补充到页面底部
- [ ] `public/uploads` 软链接指向正确，且 `data` 目录有独立备份
- [ ] MySQL 与 `/www/wwwroot/data` 均已备份，且至少一份不在本机
- [ ] 阿里云安全组仅开放 80/443，未对公网开放 3306 与 Node 内部端口


### 各类数据的存放位置

| 数据 | 存放位置 | 后台维护入口 |
| --- | --- | --- |
| 产品、新闻、案例、轮播、询价 | MySQL | 对应菜单 |
| 关于我们、联系方式、社交、产品图册 | MySQL `site_settings` | 关于我们 / 联系我们 / 社交联系 |
| 上传的图片与 PDF | `/www/wwwroot/data` | 各编辑页上传 |
| 管理员账号 | MySQL `admin_users` | 无界面，用 `scripts/reset-admin.mjs` |

删除产品时会尝试删除对应图片，但仅在**该图片未被其他内容引用**时才真正删除
（代码会扫描全库文本字段判断）。删除文章与案例不会清理其封面图，长期使用后
可在 `/www/wwwroot/data` 中人工清理不再引用的文件。


