---
name: 红财万富 / Hongcai Wanfu
description: 现有卫浴网站的瓷白与浅青绿视觉系统
colors:
  primary: "#37675d"
  primary-deep: "#285147"
  porcelain: "#f6f8f5"
  white: "#ffffff"
  sea-glass: "#e5f0eb"
  accent-soft: "#dfede5"
  ink: "#17343a"
  ink-soft: "#35564e"
  muted: "#526d65"
  steel: "#849e94"
  divider: "#cfdfd7"
typography:
  display:
    fontFamily: 'Manrope, Noto Sans SC, Microsoft YaHei, sans-serif'
    fontSize: 'clamp(2.6rem, 4.7vw, 4.8rem)'
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: '-0.035em'
  headline:
    fontSize: 'clamp(1.9rem, 3.2vw, 3rem)'
    lineHeight: 1.08
    letterSpacing: '-0.03em'
  body:
    fontFamily: 'Manrope, Noto Sans SC, Microsoft YaHei, sans-serif'
    lineHeight: 1.65
  navigation:
    fontSize: '0.875rem'
    fontWeight: 600
rounded:
  pill: '999px'
  menu: '14px'
  panel: '16px'
  image: '18px'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.white}'
    rounded: '{rounded.pill}'
    padding: '0.8rem 1.2rem'
  button-primary-hover:
    backgroundColor: '{colors.primary-deep}'
  button-ghost:
    backgroundColor: '{colors.white}'
    textColor: '{colors.ink}'
    rounded: '{rounded.pill}'
    padding: '0.8rem 1.2rem'
  chip-selected:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.white}'
    rounded: '{rounded.pill}'
    padding: '0.3rem 0.62rem'
  admin-panel:
    backgroundColor: '{colors.white}'
    textColor: '{colors.ink}'
    rounded: '{rounded.panel}'
---

# Design System: 红财万富

## Overview

**Creative North Star: "瓷白与浅青绿"**

用户于 2026-10-05 明确选定瓷白、浅青绿，并排除暖铜色界面。本次已授权配色更新取代此前雾蓝方向：明亮背景、低饱和绿色分区、深色文字。前台支持浏览与询盘，后台支持内容管理，沿用相同颜色而保留各自的信息密度。

保持当前内容、页面结构、导航、产品图库和案例轮播。真实红色 Logo、产品实拍及二维码不随主题染色。

**Key Characteristics:**
- 瓷白内容面、浅青绿分区、深色文字。
- 深绿主操作，浅色导航与后台工作区。
- 明亮场景与自然银色、黑色、白色产品。
- 延续已有圆角、悬停、焦点与响应式行为。

## Colors

### Primary

深绿 primary 用于按钮、当前导航、选中状态及链接；primary-deep 用于主操作悬停。sea-glass 和 accent-soft 提供分区与选择背景，不代替深色正文。

### Neutral

porcelain 是页面底色，white 用于内容、导航、表单和后台卡片。ink、ink-soft、muted 分别承担主文字、次级文字和说明；divider 划分内容；steel 用于辅助细节。实际色值以前置 tokens 为准。

**The Natural Finish Rule.** 界面配色不能变成产品颜色：真实产品饰面保持原样。暖铜色不用于本主题的按钮、强调色或新生成场景；此要求不授权修改真实产品颜色。

**The Semantic Color Rule.** 红色 Logo 保留品牌身份，错误和删除保留独立语义红色。历史 --red 是绿色操作色的兼容变量名。

## Typography

沿用 Manrope、Noto Sans SC，回退 Microsoft YaHei、sans-serif。历史 --serif 与 --sans 指向相同字体栈，不代表衬线标题体系。首页主标题使用 display，首页分区标题使用 headline；正文按模块保留既有字号，基础行高为 body。

手机首页标题在 720px 以下缩放，在 430px 以下进一步收敛；询盘输入在手机上保持 1rem。

## Layout

通用内容宽度为 min(1520px, calc(100vw - 96px))，首页主容器为 min(1320px, calc(100vw - 96px))。首页在 1100px 以下使用 24px 两侧边距，720px 以下使用 16px。导航在 1120px 以下切换移动布局，1121–1440px 隐藏品牌旁说明避免拥挤。

本次保留首页首屏、关于介绍、产品图库、采购优势、案例与新闻、页脚顺序，保留六个公开页面和后台结构。这是此次改色的范围约束，不是未来页面的通用构图模板。手机继续使用图片在上、文案在下的首屏和纵向内容。

## Elevation & Depth

主要通过白色、瓷白、浅青绿色面建立层级，柔影辅助浮层与操作。共享浮层阴影为 0 12px 32px rgba(23,52,58,.08)；按钮默认柔和绿色阴影，悬停略增强。首页、内页和案例轮播使用浅色照片遮罩保障深色文字可读。

## Shapes

沿用胶囊按钮与筛选、14px 菜单、16px 后台面板、18px 图片与案例圆角。询盘字段仍为直角，不把所有组件强制改为同一圆角。

## Components

### Buttons

首页主按钮为深绿底白字，桌面最小高度 48px；次按钮为白底深字和绿色系描边。保留悬停上移 3px、箭头轻微位移与深绿悬停色；430px 以下最小高度 46px。禁用降低透明度并取消上移。

### Chips

产品筛选是胶囊形浅灰绿背景，选中为深绿底白字；悬停与焦点以绿色文字和边框提示。

### Cards / Containers

后台编辑、设置与资源表是白色圆角内容面；页头、表头、导航选中项以浅绿区分。前台保留原有产品、新闻和案例尺寸与交互，不额外为产品图片加主题滤镜。

### Inputs / Fields

询盘字段为浅底细边框，聚焦变绿并显示柔和外圈。搜索框保持胶囊形。全局键盘焦点为偏移 4px 的 3px 绿色轮廓，组件自身焦点继续生效。

### Navigation

桌面导航包括未滚动状态均为近乎不透明白底深字。当前项与悬停项有绿色下划线，悬停增加浅绿底；下拉菜单为白色圆角浮层。后台为白色侧栏、浅绿选中项和深绿操作。

### Imagery and motion

新场景使用白瓷、浅青绿石材和自然日光，展示银色或黑色五金，属于概念示意，不作为真实厂房、展厅、客户或交付证据。真实上传素材保持原样。已有转场使用 cubic-bezier(.16, 1, .3, 1)；保留现有 reduced-motion 处理，不宣称所有动画完全禁用。

## Do's and Don'ts

### Do:
- **Do** 以 site.css、home.css、最终加载的 porcelain-green.css 及组件级联为实际来源。
- **Do** 保持现有结构、功能、文字和真实上传资产。
- **Do** 用深绿表示操作、浅青绿表示背景、深色文字保证可读性。
- **Do** 将生成图片作为场景示意并保留来源和替换清单。

### Don't:
- **Don't** 恢复暖铜色界面或旧雾蓝主题。
- **Don't** 将产品统一染成绿色、铜色或其他主题色。
- **Don't** 将已有英文眉题、字符图标等未在本次修复的细节提升为新组件规范。
- **Don't** 将生成场景称为已证实的公司场所或交付案例。

记录：[预览与验证](porcelain-green/README.md)、[来源](porcelain-green/generated-assets.json)、[替换清单](porcelain-green/replaced-images.json)。旧源文件和场景图片备份在 .design-backups/before-porcelain-green-20261005。
