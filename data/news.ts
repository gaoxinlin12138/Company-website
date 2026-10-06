export const NEWS_CATEGORIES = ['公司新闻', '行业资讯'] as const

export type NewsCategory = typeof NEWS_CATEGORIES[number]

export interface SampleNewsArticle {
  id: string
  slug: string
  date: string
  category: NewsCategory
  categoryEn: string
  title: string
  titleEn: string
  summary: string
  summaryEn: string
  content: string
  contentEn: string
  image: string
}

export const sampleNewsArticles: SampleNewsArticle[] = [
  {
    id: 'sample-company-news-01',
    slug: 'news-centre-category-update',
    date: '2026-10-04',
    category: '公司新闻',
    categoryEn: 'Company news',
    title: '新闻中心完成栏目优化',
    titleEn: 'News centre categories have been streamlined',
    summary: '新闻内容现按公司新闻与行业资讯两条线整理，帮助采购人员更快找到企业动态和选品知识。',
    summaryEn: 'News content is now organised into company updates and industry insights, helping buyers find relevant information more quickly.',
    content: '红财万富网站新闻中心现保留“公司新闻”和“行业资讯”两个栏目。公司新闻用于记录产品资料、网站内容与服务信息的更新；行业资讯用于整理卫浴五金选品和采购沟通中的常见问题。\n\n栏目调整后，访问者可以更直接地区分企业动态与采购知识。后续发布的内容仍以已确认的信息为基础，不使用未经核验的客户、订单、认证或生产数据。',
    contentEn: 'The Hongcai Wanfu website news centre now contains two sections: Company News and Industry Insights. Company News covers updates to product information, website content and service information, while Industry Insights explains common topics in bathroom hardware selection and sourcing communication.\n\nThe simplified structure makes it easier to distinguish company updates from practical sourcing knowledge. Future articles will continue to rely on confirmed information and will not use unverified customer, order, certification or production data.',
    image: '/assets/images/hero-basin-concept.webp'
  },
  {
    id: 'sample-company-news-02',
    slug: 'product-information-framework',
    date: '2026-09-18',
    category: '公司新闻',
    categoryEn: 'Company news',
    title: '产品资料按采购信息框架持续整理',
    titleEn: 'Product information is being organised for sourcing decisions',
    summary: '围绕品类、型号、材质、表面处理与图片等基础信息，逐步形成更便于选品和询价的资料结构。',
    summaryEn: 'Product categories, models, materials, finishes and imagery are being organised into a clearer structure for selection and enquiries.',
    content: '面向批发、外贸与工程采购，产品资料需要先回答“是什么、适合什么需求、还需要确认什么”。网站正在围绕产品品类、型号、材质、表面处理、图片和采购说明等基础字段整理信息。\n\n对于尚未取得正式资料的内容，页面会保留待补充或待确认提示。具体规格、包装、交期与定制条件，应在选定产品后根据实际需求进一步确认。',
    contentEn: 'For wholesale, export and project sourcing, product information should first explain what the item is, which needs it may suit and what still needs confirmation. The website is organising information around product category, model, material, finish, imagery and sourcing notes.\n\nWhere official information is not yet available, the page keeps a pending or to-be-confirmed label. Specifications, packaging, lead time and customisation terms should be confirmed against the selected product and actual requirement.',
    image: '/assets/images/detail-materials.webp'
  },
  {
    id: 'sample-company-news-03',
    slug: 'website-content-for-sourcing',
    date: '2026-08-30',
    category: '公司新闻',
    categoryEn: 'Company news',
    title: '网站内容更新聚焦采购沟通',
    titleEn: 'Website content update focuses on sourcing communication',
    summary: '从产品浏览到提交需求，页面内容围绕采购方向、数量、市场和项目要求组织，减少前期沟通遗漏。',
    summaryEn: 'From browsing to enquiry, content is organised around product direction, quantity, market and project requirements.',
    content: '网站内容更新以采购过程为主线：先浏览产品范围，再按品类查看基础信息，最后提交采购方向、预计数量、目标市场或项目要求。\n\n这些字段用于帮助双方更快确定需要补充的资料。报价、样品、包装与交付安排仍需结合具体产品和实际需求确认，页面不会预设未经核实的承诺。',
    contentEn: 'The website update follows the sourcing process: browse the product range, review basic information by category, and then submit the product direction, estimated quantity, target market or project requirements.\n\nThese fields help both sides identify what information is still needed. Quotations, samples, packaging and delivery arrangements remain subject to the selected product and actual requirement, without unverified commitments on the website.',
    image: '/assets/images/hero-sanitaryware.webp'
  },
  {
    id: 'sample-industry-news-01',
    slug: 'bathroom-hardware-enquiry-checklist',
    date: '2026-09-26',
    category: '行业资讯',
    categoryEn: 'Industry insights',
    title: '卫浴五金询价前应准备哪些信息',
    titleEn: 'What to prepare before requesting a bathroom hardware quotation',
    summary: '产品类别、使用场景、数量、目标市场与时间要求，是提高询价沟通效率的基础信息。',
    summaryEn: 'Product category, application, quantity, target market and schedule form the basis of an efficient quotation request.',
    content: '一份清晰的询价需求通常从产品类别和使用场景开始。例如，需要面盆龙头、花洒套装、厨房龙头，还是卫浴挂件与安装配件；用于批发备货、工程配套，还是其他采购方向。\n\n预计数量、目标市场、期望时间以及需要确认的材质、颜色、包装或标识，也应尽量一并说明。信息越完整，后续选品、资料补充与报价沟通越容易聚焦。具体可行性和交付条件仍应以实际确认结果为准。',
    contentEn: 'A clear enquiry usually starts with product category and application. Specify whether you need basin faucets, shower sets, kitchen faucets, bathroom accessories or installation parts, and whether the requirement is for wholesale stocking, a project or another sourcing route.\n\nEstimated quantity, target market, preferred schedule, material, colour, packaging and branding requirements should also be included where possible. More complete information keeps product selection, document preparation and quotation discussions focused. Feasibility and delivery terms remain subject to actual confirmation.',
    image: '/assets/images/hero-basin-concept.webp'
  },
  {
    id: 'sample-industry-news-02',
    slug: 'compare-faucet-material-and-finish',
    date: '2026-08-26',
    category: '行业资讯',
    categoryEn: 'Industry insights',
    title: '如何比较水龙头的材质与表面处理信息',
    titleEn: 'How to compare faucet material and finish information',
    summary: '比较产品时应区分主体材质、零部件材质与表面效果，并结合使用环境确认具体要求。',
    summaryEn: 'Product comparison should distinguish body material, component materials and surface finish in relation to the intended environment.',
    content: '“材质”和“表面处理”是两个不同维度。采购人员可先确认产品主体与关键零部件的材质说明，再了解表面颜色、纹理和处理方式，避免只根据图片判断。\n\n不同使用环境对清洁、维护、配套颜色和耐用性的关注点并不相同。询价时建议列出需要确认的部位和效果，并索取对应型号的正式资料；检测或认证信息应以可核验文件为准。',
    contentEn: 'Material and surface finish are separate dimensions. Buyers can first confirm the stated materials for the product body and key components, then review colour, texture and finish instead of relying on imagery alone.\n\nCleaning, maintenance, colour coordination and durability priorities vary by environment. An enquiry should list the parts and finishes that need confirmation and request official information for the relevant model. Test and certification information should always be supported by verifiable documents.',
    image: '/assets/images/detail-materials.webp'
  },
  {
    id: 'sample-industry-news-03',
    slug: 'packaging-and-delivery-confirmation',
    date: '2026-07-30',
    category: '行业资讯',
    categoryEn: 'Industry insights',
    title: '包装与交付沟通中的常见确认项',
    titleEn: 'Common checks for packaging and delivery discussions',
    summary: '包装方式、标识要求、数量与运输安排应结合具体产品确认，避免沿用不适合当前采购的默认条件。',
    summaryEn: 'Packaging, labelling, quantity and transport arrangements should be confirmed for the selected products instead of assumed.',
    content: '包装与交付条件通常会受到产品尺寸、组合方式、采购数量、运输路径和标识需求影响。即使是相近品类，也不宜直接套用同一套包装说明。\n\n沟通时可逐项确认单品与组合包装、外箱标识、随附资料、装运方式和期望时间。最终方案与时间应在产品和数量明确后确认，避免把示例信息当作正式承诺。',
    contentEn: 'Packaging and delivery terms can be affected by product size, bundle configuration, sourcing quantity, transport route and labelling requirements. Similar categories should not automatically be assigned the same packaging specification.\n\nDiscuss individual and bundled packaging, carton marks, accompanying documents, shipping method and preferred schedule item by item. The final arrangement and timing should be confirmed after products and quantities are clear, so example information is not mistaken for a commitment.',
    image: '/assets/images/hero-sanitaryware.webp'
  }
]
