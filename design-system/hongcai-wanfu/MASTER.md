# Hongcai Wanfu design system

当前方向：**瓷白 + 浅青绿**。用户于 2026-10-05 明确选定，并排除暖铜色界面。完整规范见 [DESIGN.md](../../docs/DESIGN.md)。

| Role | CSS token | Current value |
|---|---|---|
| 主文字 | --ink | #17343A |
| 次级文字 | --ink-soft | #35564E |
| 页面底色 | --paper / --surface-soft | #F6F8F5 |
| 内容面 | --white / --surface | #FFFFFF |
| 浅青绿分区 | --mist / --sea-glass / --surface-green | #E5F0EB |
| 主操作 | --red / --accent | #37675D |
| 主操作悬停 | --red-deep | #285147 |
| 浅色选中 | --accent-soft | #DFEDE5 |
| 辅助细节 | --steel | #849E94 |
| 说明 | --muted | #526D65 |
| 最终分隔线 | --line | #CFDFD7 |

--red 保留为兼容变量名，其值为绿色。原始红色 Logo、错误与删除的语义颜色保留；实际产品饰面不随界面染色。

前台与后台使用白色、瓷白、浅青绿内容面和深色文字。保持六个公开页面、首页模块顺序、图库、案例轮播、导航、表单和管理行为。沿用 Manrope / Noto Sans SC 字体、胶囊操作、圆角内容面、键盘焦点及现有 reduced-motion 处理。

新场景为明亮日光、白瓷与浅绿石材，搭配银色、黑色、白色产品，仅作示意，不充当真实厂房或交付证据。真实产品、Logo、二维码等上传资产不替换。

实现：assets/css/site.css、home.css、最后加载的 porcelain-green.css 及组件样式。旧 pearl-blue.css 已被本次主题替代。

记录：docs/porcelain-green/README.md（含 1280×720 桌面与 390×844 手机验证）、generated-assets.json 和 replaced-images.json。替换 21 个文件，其中 17 个 WebP；以清单尺寸和字节数为准。备份：.design-backups/before-porcelain-green-20261005。
