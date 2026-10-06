export type CaseItem = {
  id: string
  isConcept?: boolean
  category: string
  categoryEn?: string
  title: string
  titleEn?: string
  summary?: string
  summaryEn?: string
  type: string
  typeEn?: string
  location?: string
  locationEn?: string
  products: string
  productsEn?: string
  image: string
}

export const caseStudies: CaseItem[] = [
  {
    id: 'fixed-hospitality-case',
    isConcept: true,
    category: '客户案例',
    categoryEn: 'Customer case',
    title: '精品酒店客房卫浴焕新方案',
    titleEn: 'Boutique hotel guest bathroom renewal',
    summary: '围绕标准客房、套房与公共区域的差异，统一龙头、花洒与五金配件的设计语言，在控制型号数量的同时兼顾舒适体验、清洁维护与后续补货。',
    summaryEn: 'A coordinated faucet, shower and hardware package for standard rooms, suites and shared areas, balancing guest comfort, maintenance efficiency and future replenishment.',
    type: '酒店客房配套',
    typeEn: 'Hospitality fit-out',
    location: '标准客房、套房与公共区域',
    locationEn: 'Guest rooms, suites and shared areas',
    products: '面盆龙头、花洒套装、地漏、卫浴挂件',
    productsEn: 'Basin faucets, shower sets, drains and bathroom accessories',
    image: '/uploads/cases/concept-hospitality.webp'
  },
  {
    id: 'fixed-commercial-case',
    isConcept: true,
    category: '项目案例',
    categoryEn: 'Project case',
    title: '商业综合体公共卫浴耐用配置',
    titleEn: 'Durable public washroom package for a commercial complex',
    summary: '针对高客流公共空间，把耐用结构、便捷清洁和检修效率放在首位，通过统一规格的龙头、阀门和排水配件减少现场安装差异，也方便后续维护替换。',
    summaryEn: 'A high-traffic specification prioritising durable construction, efficient cleaning and service access, with coordinated faucets, valves and drainage parts that simplify installation and replacement.',
    type: '商业公共空间',
    typeEn: 'Commercial public space',
    location: '公共卫生间与配套服务区',
    locationEn: 'Public washrooms and amenity zones',
    products: '面盆龙头、角阀、地漏、排水及安装配件',
    productsEn: 'Basin faucets, angle valves, drains and installation parts',
    image: '/uploads/cases/concept-commercial.webp'
  },
  {
    id: 'fixed-residential-case',
    isConcept: true,
    category: '落地效果',
    categoryEn: 'Installed result',
    title: '住宅精装全屋卫浴统一方案',
    titleEn: 'Coordinated whole-home bathroom specification',
    summary: '按照主卫、客卫与厨房的不同使用需求进行分级配置，以统一材质和表面处理串联全屋产品，并提前核对台面开孔、墙内预埋和安装顺序。',
    summaryEn: 'A tiered specification for master bath, guest bath and kitchen, linked by consistent materials and finishes with early checks for cut-outs, concealed services and installation sequence.',
    type: '住宅精装配套',
    typeEn: 'Residential fit-out',
    location: '主卫、客卫与厨房空间',
    locationEn: 'Master bath, guest bath and kitchen',
    products: '面盆龙头、淋浴花洒、厨房龙头、卫浴挂件',
    productsEn: 'Basin faucets, shower systems, kitchen faucets and bathroom accessories',
    image: '/uploads/cases/concept-residential.webp'
  },
  {
    id: 'fixed-workplace-case',
    isConcept: true,
    category: '项目案例',
    categoryEn: 'Project case',
    title: '商务办公空间卫浴配套优化',
    titleEn: 'Workplace bathroom package optimisation',
    summary: '以简洁耐看的外观和通用规格为基础，区分公共区域与重点接待空间的配置层级，减少不必要的型号分散，让采购、安装和后续替换更容易管理。',
    summaryEn: 'A restrained package based on common specifications, with controlled upgrades for client-facing zones and fewer unnecessary SKUs across procurement, installation and maintenance.',
    type: '商务办公空间',
    typeEn: 'Workplace amenities',
    location: '公共区域与重点接待空间',
    locationEn: 'Shared and client-facing zones',
    products: '水龙头、角阀、地漏、挂件与安装配件',
    productsEn: 'Faucets, angle valves, drains, accessories and installation parts',
    image: '/uploads/cases/concept-workplace.webp'
  },
  {
    id: 'fixed-resort-spa-case',
    isConcept: true,
    category: '客户案例',
    categoryEn: 'Customer case',
    title: '度假酒店 SPA 卫浴体验升级',
    titleEn: 'Resort spa bathroom experience upgrade',
    summary: '以放松体验和空间氛围为核心，围绕泡浴、淋浴与梳洗三类使用动线组织产品配置，通过自然质感表面、柔和出水体验与统一五金语言，形成从客房到 SPA 区域连续而舒适的感受。',
    summaryEn: 'A wellness-led package organised around bathing, showering and vanity routines, using natural finishes, comfortable water delivery and coordinated hardware to connect guest rooms with the spa experience.',
    type: '度假酒店与康养配套',
    typeEn: 'Resort and wellness hospitality',
    location: '景观客房、独立泡浴区与 SPA 空间',
    locationEn: 'View rooms, private bathing zones and spa spaces',
    products: '浴缸龙头、恒温淋浴、手持花洒、地漏与配套五金',
    productsEn: 'Bath fillers, thermostatic showers, hand showers, drains and coordinated hardware',
    image: '/uploads/cases/concept-resort-spa.webp'
  },
  {
    id: 'fixed-serviced-apartment-case',
    isConcept: true,
    category: '客户案例',
    categoryEn: 'Customer case',
    title: '服务式公寓紧凑卫浴高效配置',
    titleEn: 'Efficient compact bathrooms for serviced apartments',
    summary: '针对面积有限、周转频率较高的服务式公寓，优先解决收纳、干湿分区与清洁效率。壁挂式产品和简洁五金减少视觉占用，常用规格则让批量安装、日常维护与后期替换更容易。',
    summaryEn: 'Designed for compact, frequently serviced apartments, this direction prioritises storage, wet-dry zoning and cleaning efficiency. Wall-mounted products and common specifications simplify installation, maintenance and replacement.',
    type: '长租与服务式公寓',
    typeEn: 'Long-stay and serviced apartments',
    location: '单间公寓、一居室与标准套房',
    locationEn: 'Studios, one-bedroom units and standard suites',
    products: '壁挂面盆龙头、淋浴套装、置物五金、角阀与排水配件',
    productsEn: 'Wall-mounted basin faucets, shower sets, storage hardware, angle valves and drainage parts',
    image: '/uploads/cases/concept-serviced-apartment.webp'
  },
  {
    id: 'fixed-campus-case',
    isConcept: true,
    category: '项目案例',
    categoryEn: 'Project case',
    title: '校园公共卫生间安全耐用方案',
    titleEn: 'Safe and durable washrooms for education spaces',
    summary: '面向教学楼、图书馆和活动中心等高频空间，从安全、节水、易识别和集中维护出发规划配置。耐磨表面、圆润细节与可快速检修的通用部件，有助于降低日常管理压力。',
    summaryEn: 'A high-traffic education specification built around safety, water efficiency, clarity and centralised maintenance, with durable finishes, softened details and serviceable common components.',
    type: '教育公共空间',
    typeEn: 'Education public facilities',
    location: '教学楼、图书馆与活动中心卫生间',
    locationEn: 'Washrooms in teaching buildings, libraries and activity centres',
    products: '节水龙头、感应类选型、角阀、地漏与无障碍配件',
    productsEn: 'Water-saving faucets, sensor-ready options, angle valves, drains and accessible accessories',
    image: '/uploads/cases/concept-campus.webp'
  },
  {
    id: 'fixed-wellness-club-case',
    isConcept: true,
    category: '项目案例',
    categoryEn: 'Project case',
    title: '康体会所更衣淋浴系统配置',
    titleEn: 'Changing and shower systems for a wellness club',
    summary: '围绕高峰时段连续使用、私密性与湿区维护进行分区设计，将恒温控制、淋浴体验和快速排水放在同一套配置中，并通过统一面板和五金表面强化会所空间的完整感。',
    summaryEn: 'Zoned for peak-time use, privacy and wet-area maintenance, this package combines thermostatic control, shower comfort and fast drainage with a consistent panel and hardware finish.',
    type: '健身与康体会所',
    typeEn: 'Fitness and wellness club',
    location: '更衣区、独立淋浴间与湿区通道',
    locationEn: 'Changing areas, private showers and wet-zone circulation',
    products: '恒温阀、顶喷与手持花洒、线性地漏、挂件及检修配件',
    productsEn: 'Thermostatic valves, overhead and hand showers, linear drains, accessories and service parts',
    image: '/uploads/cases/concept-wellness-club.webp'
  },
  {
    id: 'fixed-compact-home-case',
    isConcept: true,
    category: '落地效果',
    categoryEn: 'Installed result',
    title: '小户型住宅卫浴空间释放方案',
    titleEn: 'Space-releasing bathroom direction for compact homes',
    summary: '通过悬浮式台盆、透明淋浴隔断和墙面收纳减少拥挤感，在有限尺度内保留清晰的洗漱、淋浴和储物路径。短出水嘴、灵活花洒与紧凑排水组合进一步提升空间利用率。',
    summaryEn: 'Floating vanities, transparent shower screens and wall storage reduce visual weight while preserving clear vanity, shower and storage zones. Compact fittings make better use of the limited footprint.',
    type: '小户型住宅优化',
    typeEn: 'Compact residential optimisation',
    location: '小面积主卫、客卫与改造型卫生间',
    locationEn: 'Compact master baths, guest baths and renovation layouts',
    products: '紧凑型面盆龙头、升降花洒、墙面挂件、地漏与角阀',
    productsEn: 'Compact basin faucets, rail showers, wall accessories, drains and angle valves',
    image: '/uploads/cases/concept-compact-home.webp'
  },
  {
    id: 'fixed-family-bathroom-case',
    isConcept: true,
    category: '落地效果',
    categoryEn: 'Installed result',
    title: '家庭友好型共享卫浴配置',
    titleEn: 'Family-friendly shared bathroom specification',
    summary: '兼顾成人、儿童与长辈的不同使用习惯，通过圆角五金、防烫控制、双台盆与分层收纳提升共同使用效率。产品高度、握持手感和清洁死角在选型阶段同步核对，让日常使用更安心。',
    summaryEn: 'Designed for adults, children and older family members, this package uses rounded hardware, anti-scald control, double basins and layered storage to make shared routines safer and more efficient.',
    type: '家庭住宅卫浴',
    typeEn: 'Family residential bathroom',
    location: '家庭主卫、儿童卫浴与共享洗漱区',
    locationEn: 'Family master baths, children’s bathrooms and shared vanity zones',
    products: '双台盆龙头、防烫淋浴、浴缸龙头、扶手与收纳挂件',
    productsEn: 'Double-basin faucets, anti-scald showers, bath fillers, grab bars and storage accessories',
    image: '/uploads/cases/concept-family-bathroom.webp'
  }
]

export const caseImageDimensions: Record<string, { width: number; height: number }> = {
  '/uploads/cases/concept-hospitality.webp': { width: 1254, height: 1254 },
  '/uploads/cases/concept-commercial.webp': { width: 1254, height: 1254 },
  '/uploads/cases/concept-residential.webp': { width: 1254, height: 1254 },
  '/uploads/cases/concept-workplace.webp': { width: 1254, height: 1254 },
  '/uploads/cases/concept-resort-spa.webp': { width: 1254, height: 1254 },
  '/uploads/cases/concept-serviced-apartment.webp': { width: 1254, height: 1254 },
  '/uploads/cases/concept-campus.webp': { width: 1254, height: 1254 },
  '/uploads/cases/concept-wellness-club.webp': { width: 1254, height: 1254 },
  '/uploads/cases/concept-compact-home.webp': { width: 1254, height: 1254 },
  '/uploads/cases/concept-family-bathroom.webp': { width: 1254, height: 1254 }
}

export const getCaseImageDimensions = (image: string) => caseImageDimensions[image] || { width: 1600, height: 1066 }
