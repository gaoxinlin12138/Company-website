# 红财万富公司网站

红财万富卫浴产品与五金企业网站。项目采用 **Nuxt 3 + Vue 3 + TypeScript + MySQL**，包含中英文切换、响应式导航、产品筛选、新闻、案例、联系询价和管理控制台。

## 快速启动

### 一键启动（Windows）

双击根目录的 `启动项目.py`，或在 PowerShell 中运行：

```powershell
python .\启动项目.py
```

脚本会尝试启动本地 MySQL、安装依赖并在 `127.0.0.1:8126` 启动 Nuxt 开发服务。若不希望自动打开浏览器：

```powershell
python .\启动项目.py --no-browser
```

### 手动启动

需要 Node.js、pnpm、Python 3 和 MySQL。先准备环境变量（可复制 `.env.example` 为 `.env`），再执行：

```powershell
pnpm install
pnpm dev --host 127.0.0.1 --port 8126
```

打开 <http://127.0.0.1:8126/>。管理后台入口为 <http://127.0.0.1:8126/admin/login>。

本地 MySQL 的安装目录、数据库和启动方式见 [docs/LOCAL-MYSQL.md](docs/LOCAL-MYSQL.md)。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm typecheck` | 执行 TypeScript / Vue 类型检查 |
| `pnpm build` | 生成生产版本 |
| `pnpm preview` | 预览已生成的生产版本 |

## 页面路由

| 页面 | 地址 | 主要源文件 |
| --- | --- | --- |
| 首页 | `/` | `pages/index.vue` |
| 产品中心 | `/products` | `pages/products.vue` |
| 关于我们 | `/about` | `pages/about.vue` |
| 新闻动态 | `/news` | `pages/news/index.vue` |
| 新闻文章 | `/news/:slug` | `pages/news/[slug].vue` |
| 案例展示 | `/cases` | `pages/cases.vue` |
| 联系我们 | `/contact` | `pages/contact.vue` |
| 管理总览 | `/admin` | `pages/admin/index.vue` |
| 管理登录 | `/admin/login` | `pages/admin/login.vue` |
| 产品管理 | `/admin/products` | `pages/admin/products/index.vue` |
| 新闻管理 | `/admin/articles` | `pages/admin/articles.vue` |
| 案例管理 | `/admin/cases` | `pages/admin/cases.vue` |
| 首页内容 | `/admin/home` | `pages/admin/home.vue` |
| 推荐产品 | `/admin/home-products` | `pages/admin/home-products.vue` |
| 询价管理 | `/admin/inquiries` | `pages/admin/inquiries.vue` |

旧 `.html` 地址的兼容跳转规则位于 `nuxt.config.ts` 的 `routeRules` 中。

## 项目结构

```text
公司网站/
├─ app.vue                         # Nuxt 应用入口
├─ nuxt.config.ts                  # Nuxt 配置、运行时环境变量和旧地址跳转
├─ package.json                    # 依赖和项目命令
├─ 启动项目.py                     # Windows 一键启动脚本
├─ assets/css/                     # 全局、首页和主题样式
├─ components/                     # 前台与后台共享组件
├─ composables/                    # 语言状态等可复用逻辑
├─ data/                           # 服务异常时使用的本地兜底数据
├─ layouts/                        # 页面布局
├─ pages/                          # 前台、新闻和后台路由
├─ plugins/                        # 浏览器端插件
├─ public/assets/images/           # 网站直接访问的图片资源
├─ server/api/                     # 内容、询价和管理 API
├─ database/                       # MySQL 初始化和示例数据脚本
├─ prisma/schema.prisma            # 数据模型参考
├─ types/                          # TypeScript 内容类型
├─ docs/                           # 产品、设计、数据和环境说明
└─ design-system/                  # 设计系统速查表
```

`.nuxt/`、`.output/`、`node_modules/` 等目录由工具生成，不属于需要手工维护的源码，也不应提交到 GitHub。

## 数据与管理后台

公开页面优先从 `/api/content/*` 读取已发布内容；服务不可用时使用 `data/` 中的本地兜底数据。产品、新闻、案例、首页内容和询价均通过 MySQL API 持久化，数据库表结构与初始化数据位于 `database/`，连接由 `DATABASE_URL` 配置。

管理后台不提供公开注册或网页端创建账号。全新数据库首次启动时，服务端读取 `ADMIN_USERNAME` 与 `ADMIN_PASSWORD` 创建唯一的初始管理员；已有管理员时不会覆盖。登录页只预填用户名，密码不得写入源码、文档或浏览器。部署前必须设置至少 32 位的随机 `NUXT_SESSION_SECRET` 和至少 12 位的唯一管理员密码。

后台中文内容保存时可调用百度翻译生成英文。翻译凭证只放在本地 `.env`，不要提交到仓库：

```env
BAIDU_TRANSLATE_APP_ID="your-app-id"
BAIDU_TRANSLATE_SECRET_KEY="your-secret-key"
```

翻译调用只发生在服务端，密钥不会发送到浏览器。询价表单会提交到 `/api/inquiries` 并写入 MySQL；邮件、企业微信或 WhatsApp 通知仍需按上线渠道另行配置。

## 常见修改位置

- 产品与案例兜底数据：`data/site.ts`
- 新闻兜底数据：`data/news.ts`
- 页面文案与语言状态：`composables/useSiteLanguage.ts`
- 导航和页脚：`components/SiteHeader.vue`、`components/SiteFooter.vue`
- 页面样式：`assets/css/site.css`、`assets/css/home.css`、`assets/css/porcelain-green.css`
- 图片资源：`public/assets/images/`

新增图片后，在页面中使用 `/assets/images/文件名.webp` 这样的公开路径；建议使用清晰、稳定的英文文件名，并优先采用 WebP。

### 图片文件与部署

网站运行时只会读取项目目录里的公开资源，不会读取 Codex 的临时生成目录。当前需要随项目一起部署的媒体文件包括：

- `public/assets/images/`：页面固定使用的 Logo、主题横幅、场景图和产品图。
- `public/uploads/`：管理后台上传的产品图片、关于我们图片、案例图片和产品图册 PDF。
- `public/favicon.png`、`public/favicon.ico`：浏览器标签页图标。

`C:/Users/2026/.codex/output/imagegen/` 只是生成过程的临时输出目录，不参与网站运行；已经被网站使用的图片都已转换并复制到上述项目目录。部署或上传 GitHub 时，请保留整个 `public/` 目录，并对 `public/uploads/` 做独立备份。

## 项目文档

- [产品上下文](docs/PRODUCT.md)：技术方向、用户、内容边界和产品原则。
- [设计规范](docs/DESIGN.md)：瓷白与浅青绿主题、字体、组件和无障碍约束。
- [内容模型](docs/CONTENT-MODEL.md)：后台字段、状态和前后台职责边界。
- [本地 MySQL](docs/LOCAL-MYSQL.md)：Windows 本地数据库配置。
- [后台使用与部署](docs/ADMIN-GUIDE.md)：后台入口、日常操作、安全配置和阿里云面板更新步骤。
- [主题验证记录](docs/porcelain-green/README.md)：最近一次视觉更新的验证结论和相关素材索引。
- [设计系统速查表](design-system/hongcai-wanfu/MASTER.md)：前端实现时常用的颜色和组件令牌。

## 构建与部署

```powershell
pnpm typecheck
pnpm build
node .output/server/index.mjs
```

生产环境至少应配置 `DATABASE_URL`、`NUXT_SESSION_SECRET`、`ADMIN_USERNAME`、`ADMIN_PASSWORD` 和实际使用的第三方服务密钥。部署前确认 `.env`、数据库密码、管理员密码、上传目录和日志不会被公开；不要把 `.env`、`node_modules/`、`.nuxt/` 或 `.output/` 提交到 GitHub。

## 常见问题

### 端口被占用

可使用启动脚本指定其他端口：

```powershell
python .\启动项目.py --port 8127
```

### 修改后页面没有更新

先强制刷新浏览器（`Ctrl + F5`）；仍未更新时停止开发服务器后重新运行。

### 图片显示不出来

确认文件位于 `public/assets/images/`，并检查代码中的文件名、扩展名和大小写是否一致。

### GitHub 上传前检查

确认已复制 `.env.example` 为本地 `.env`，但不要提交 `.env`；确认没有把数据库密码、翻译密钥、地图密钥或管理员凭证写入 Markdown、源码和提交记录。
