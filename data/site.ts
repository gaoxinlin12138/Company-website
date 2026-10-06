export type ProductGroup = '卫浴产品' | '其他产品'

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

export const products: ProductItem[] = [
  { name: '面盆龙头', category: '面盆龙头', group: '卫浴产品', material: '铜', image: '/assets/images/hero-basin-concept.webp' },
  { name: '淋浴花洒套装', category: '花洒套装', group: '卫浴产品', material: '不锈钢', image: '/assets/images/hero-sanitaryware.webp' },
  { name: '坐便器系列', category: '坐便器', group: '卫浴产品', material: '陶瓷', image: '/assets/images/detail-materials.webp' },
  { name: '浴室柜组合', category: '浴室柜', group: '卫浴产品', material: '待确认', image: '/assets/images/hero-faucet-concept.webp' },
  { name: '厨房龙头', category: '厨房龙头', group: '卫浴产品', material: '不锈钢', image: '/assets/images/hero-basin-concept.webp' },
  { name: 'LTA-822 花洒', category: '花洒套装', group: '卫浴产品', material: '待确认', image: '/assets/images/lta-822.png' },
  { name: '毛巾架', category: '卫浴挂件', group: '其他产品', material: '不锈钢', image: '/assets/images/detail-materials.webp' },
  { name: '置物架', category: '卫浴挂件', group: '其他产品', material: '铝合金', image: '/assets/images/hero-faucet-concept.webp' },
  { name: '三角阀', category: '阀门配件', group: '其他产品', material: '铜', image: '/assets/images/hero-basin-concept.webp' },
  { name: '进水阀', category: '阀门配件', group: '其他产品', material: '待确认', image: '/assets/images/detail-materials.webp' },
  { name: '地漏', category: '排水配件', group: '其他产品', material: '不锈钢', image: '/assets/images/hero-sanitaryware.webp' },
  { name: '安装配件', category: '安装配件', group: '其他产品', material: '待确认', image: '/assets/images/hero-faucet-concept.webp' }
]

