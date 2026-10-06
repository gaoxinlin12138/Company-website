import type { HomeHeroSlide } from '~/types/content'

export const homeHeroSlides: HomeHeroSlide[] = [
  {
    id: 'shower-systems',
    category: { zh: '花洒系统 / Shower systems', en: 'Shower systems' },
    titleLead: { zh: '一套好花洒，', en: 'Comfort starts' },
    titleEmphasis: { zh: '让淋浴更舒适。', en: 'with the shower.' },
    summary: { zh: '围绕安装方式、出水配置、表面颜色和采购数量整理产品信息，帮助客户更快确认选型与报价需求。', en: 'Compare installation, water-flow options, finishes and quantities in one clear path from product selection to quotation.' },
    image: '/assets/images/hero-sanitaryware.webp',
    primaryAction: { zh: '查看花洒系列', en: 'Explore shower systems', to: '/products?group=卫浴产品&category=花洒套装' },
    secondaryAction: { zh: '询问产品资料', en: 'Request product details' },
    sortOrder: 1,
    status: 'published'
  },
  {
    id: 'basin-faucets',
    category: { zh: '面盆龙头 / Basin faucets', en: 'Basin faucets' },
    titleLead: { zh: '选对面盆龙头，', en: 'Find the right' },
    titleEmphasis: { zh: '从搭配开始。', en: 'basin faucet.' },
    summary: { zh: '按台盆搭配、龙头高度、表面颜色和使用场景梳理选择，让型号比较与采购沟通更直接。', en: 'Compare basin pairings, faucet heights, finishes and use cases to make model selection and sourcing conversations more direct.' },
    image: '/assets/images/hero-basin-concept.webp',
    primaryAction: { zh: '查看面盆龙头', en: 'Explore basin faucets', to: '/products?group=卫浴产品&category=面盆龙头' },
    secondaryAction: { zh: '索取产品目录', en: 'Request the catalogue' },
    sortOrder: 2,
    status: 'published'
  },
  {
    id: 'faucet-collection',
    category: { zh: '水龙头系列 / Faucet collection', en: 'Faucet collection' },
    titleLead: { zh: '产品选择，', en: 'Choose from a' },
    titleEmphasis: { zh: '从清晰分类开始。', en: 'clear faucet range.' },
    summary: { zh: '围绕面盆、淋浴、浴缸与厨房等使用场景归类产品，方便客户快速浏览、比较并提交采购需求。', en: 'Browse faucets by basin, shower, bath and kitchen applications, then compare options and send sourcing requirements with less back-and-forth.' },
    image: '/assets/images/hero-faucet-concept.webp',
    primaryAction: { zh: '浏览水龙头系列', en: 'Browse faucet ranges', to: '/products?group=卫浴产品' },
    secondaryAction: { zh: '提交采购需求', en: 'Send sourcing needs' },
    sortOrder: 3,
    status: 'published'
  },
  {
    id: 'kitchen-faucets',
    category: { zh: '厨房龙头 / Kitchen faucets', en: 'Kitchen faucets' },
    titleLead: { zh: '选对厨房龙头，', en: 'Match the right' },
    titleEmphasis: { zh: '先看安装方式。', en: 'kitchen faucet.' },
    summary: { zh: '覆盖立式、万向与壁挂等常见方向，结合空间、使用习惯和采购数量，帮助客户更快确定产品范围。', en: 'Compare deck-mounted, swivel and wall-mounted options by space, use and quantity to narrow the right kitchen faucet range faster.' },
    image: '/assets/images/hero-kitchen-wall-concept.webp',
    primaryAction: { zh: '查看厨房龙头', en: 'Explore kitchen faucets', to: '/products?group=卫浴产品&category=厨房龙头' },
    secondaryAction: { zh: '咨询产品系列', en: 'Ask about the range' },
    sortOrder: 4,
    status: 'published'
  }
]

