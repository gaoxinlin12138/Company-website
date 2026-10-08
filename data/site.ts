export type ProductGroup = '卫浴产品' | '其他产品'

export const productCategorySections = [
  { key: 'sanitaryware', label: '卫浴产品', group: '卫浴产品', icon: 'lucide:bath', categories: ['面盆龙头', '花洒套装', '坐便器', '浴室柜', '厨房龙头'] },
  { key: 'hardware', label: '卫浴五金', group: '卫浴五金', icon: 'lucide:settings-2', categories: ['卫浴挂件', '阀门配件'] },
  { key: 'installation', label: '安装及配件', group: '安装及配件', icon: 'lucide:wrench', categories: ['排水配件', '安装配件'] }
] as const

export interface ProductItem {
  name: string
  category: string
  group: ProductGroup
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
