import { NEWS_CATEGORIES } from './news'

export const productCategorySections = [
  { key: 'sanitaryware', label: '卫浴产品', group: '卫浴产品', icon: 'lucide:bath', categories: ['面盆龙头', '花洒套装', '坐便器', '浴室柜', '厨房龙头'] },
  { key: 'hardware', label: '卫浴五金', group: '卫浴五金', icon: 'lucide:settings-2', categories: ['卫浴挂件', '阀门配件'] },
  { key: 'installation', label: '安装及配件', group: '安装及配件', icon: 'lucide:wrench', categories: ['排水配件', '安装配件'] }
] as const

export interface ProductItem {
  name: string
  category: string
  // 与 /api/content/products 的返回口径一致；页面用它区分卫浴产品与五金、配件。
  group: '卫浴产品' | '其他产品'
  material: string
  image: string
}

export const navigation = [
  { label: '首页', to: '/' },
  { label: '产品中心', to: '/products' },
  { label: '关于我们', to: '/about' },
  { label: '新闻动态', to: '/news' },
  { label: '案例展示', to: '/cases' },
  { label: '联系我们', to: '/contact' }
]

/** 导航项目标：字符串路径，或带 query 的路径对象 */
export type MenuTarget = string | { path: string; query?: Record<string, string> }

export interface MenuItem {
  label: string
  to: MenuTarget
}

/**
 * 各栏目展开后的菜单项。
 * 顶部导航栏的下拉与页脚的栏目列共用这一份定义，避免两处内容不一致。
 * 产品项由 productCategorySections 展平而来，因此新增分类只需改上面那一处。
 */
export const productMenuItems: MenuItem[] = productCategorySections.flatMap(section =>
  section.categories.map(category => ({
    label: category,
    to: { path: '/products', query: { group: section.group, category } }
  }))
)

export const caseMenuItems: MenuItem[] = ['全部案例', '客户案例', '项目案例', '落地效果']
  .map(category => ({ label: category, to: { path: '/cases', query: { category } } }))

/**
 * 页脚要展开的栏目（顺序与顶部导航一致，不含首页）。
 * items 为函数形式：新闻分类来自 data/news.ts，用函数避免模块间循环依赖。
 */
export const footerMenuColumns: Array<{ label: string; to: string; items: () => MenuItem[] }> = [
  { label: '产品中心', to: '/products', items: () => productMenuItems },
  { label: '关于我们', to: '/about', items: () => [
    { label: '公司简介', to: '/about#company-profile' },
    { label: '品牌文化', to: '/about#brand-culture' },
    { label: '荣誉资质', to: '/about#qualifications' },
    { label: '企业 VI', to: '/about#brand-vi' }
  ] },
  { label: '新闻动态', to: '/news', items: () => NEWS_CATEGORIES.map(category => ({
    label: category,
    to: { path: '/news', query: { category } }
  })) },
  { label: '案例展示', to: '/cases', items: () => caseMenuItems },
  { label: '联系我们', to: '/contact', items: () => [
    { label: '联系方式', to: '/contact#contact-info' },
    { label: '地理位置', to: '/contact#location' },
    { label: '提交采购需求', to: '/contact#inquiry' }
  ] }
]

/**
 * 按目标路径索引的菜单项，供顶部导航的下拉直接使用。
 * 与 footerMenuColumns 同源，保证顶栏与页脚内容一致。
 */
export const menuItemsByRoute: Record<string, MenuItem[]> = Object.fromEntries(
  footerMenuColumns.map(column => [column.to, column.items()])
)
