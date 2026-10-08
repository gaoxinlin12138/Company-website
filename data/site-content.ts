export type AboutPrinciple = {
  titleZh: string
  titleEn: string
  detailZh: string
  detailEn: string
  icon: string
}

export type AboutHighlight = {
  titleZh: string
  titleEn: string
  detailZh: string
  detailEn: string
  icon: string
  to?: string
}

export type AboutImage = {
  image: string
  titleZh: string
  titleEn: string
  captionZh: string
  captionEn: string
  altZh: string
  altEn: string
}

export type AboutProfileBlockType = 'text' | 'image'

export type AboutProfileBlock = {
  id: string
  type: AboutProfileBlockType
  bodyZh: string
  bodyEn: string
  image: string
  titleZh: string
  titleEn: string
  captionZh: string
  captionEn: string
  altZh: string
  altEn: string
}

export type AboutFlowContent = {
  paragraphsZh?: string[]
  paragraphsEn?: string[]
  image?: string
  imageAltZh?: string
  imageAltEn?: string
  gallery?: AboutImage[]
  contentBlocks?: AboutProfileBlock[]
}

export function buildProfileContentBlocks(profile: AboutFlowContent, idPrefix = 'legacy-profile'): AboutProfileBlock[] {
  if (Array.isArray(profile.contentBlocks)) return profile.contentBlocks

  const images: AboutImage[] = []
  const seenImages = new Set<string>()
  const appendImage = (item: AboutImage) => {
    if (!item.image || seenImages.has(item.image)) return
    seenImages.add(item.image)
    images.push(item)
  }

  if (profile.image) {
    appendImage({
      image: profile.image,
      titleZh: '',
      titleEn: '',
      captionZh: '示意素材 / 待替换',
      captionEn: 'Concept visual / pending replacement',
      altZh: profile.imageAltZh || '',
      altEn: profile.imageAltEn || ''
    })
  }
  for (const item of profile.gallery || []) appendImage(item)

  const paragraphsZh = profile.paragraphsZh || []
  const paragraphsEn = profile.paragraphsEn || []
  const count = Math.max(paragraphsZh.length, paragraphsEn.length, images.length)
  const blocks: AboutProfileBlock[] = []

  for (let index = 0; index < count; index += 1) {
    const image = images[index]
    const bodyZh = paragraphsZh[index] || ''
    const bodyEn = paragraphsEn[index] || ''
    if (bodyZh || bodyEn) {
      blocks.push({
        id: `${idPrefix}-text-${index + 1}`,
        type: 'text',
        bodyZh,
        bodyEn,
        image: '',
        titleZh: '',
        titleEn: '',
        captionZh: '',
        captionEn: '',
        altZh: '',
        altEn: ''
      })
    }
    if (image) {
      blocks.push({
        id: `${idPrefix}-image-${index + 1}`,
        type: 'image',
        bodyZh: '',
        bodyEn: '',
        image: image.image,
        titleZh: image.titleZh,
        titleEn: image.titleEn,
        captionZh: image.captionZh,
        captionEn: image.captionEn,
        altZh: image.altZh,
        altEn: image.altEn
      })
    }
  }

  return blocks
}

export type QualificationItem = {
  titleZh: string
  titleEn: string
  detailZh: string
  detailEn: string
  statusLabelZh: string
  statusLabelEn: string
  fileUrl: string
}

export const defaultAboutContent = {
  companyProfile: {
    titleZh: '公司简介', titleEn: 'Company profile',
    introZh: '围绕卫浴产品、五金与安装配件，提供清晰、可信、便于采购决策的信息与合作支持。',
    introEn: 'Clear, reliable product information and cooperation support for better sourcing decisions across bathroom products, hardware and installation accessories.',
    highlights: [
      { icon: 'lucide:target', titleZh: '品牌定位', titleEn: 'Positioning', detailZh: '面向批发、外贸和工程采购的卫浴合作品牌。', detailEn: 'A bathroom partner for wholesale, export and project procurement.' },
      { icon: 'lucide:briefcase-business', titleZh: '服务范围', titleEn: 'Service scope', detailZh: '覆盖批发、外贸、工程采购及项目资料协同。', detailEn: 'Supporting wholesale, export, project sourcing and document coordination.' },
      { icon: 'lucide:layers-3', titleZh: '产品类别', titleEn: 'Product range', detailZh: '卫浴产品、卫浴五金与安装配件。', detailEn: 'Bathroom products, bathroom hardware and installation accessories.', to: '/products' },
      { icon: 'lucide:messages-square', titleZh: '采购支持', titleEn: 'Sourcing support', detailZh: '从选型、样品到报价与资料跟进。', detailEn: 'From selection and samples to quotations and document follow-up.', to: '/contact#inquiry' }
    ] as AboutHighlight[],
    paragraphsZh: ['红财万富专注于卫浴产品、卫浴五金与安装配件的供应，面向批发、外贸与工程采购客户，按照真实采购流程整理产品信息和合作入口。', '我们从采购人员最常确认的产品范围、型号、材质、表面处理与应用方向出发，把分散的产品资料整理成更容易浏览、比较和沟通的内容。', '从样品确认、报价沟通到项目资料跟进，我们希望让每一次合作都建立在清晰的信息基础上。公司规模、生产能力与认证信息将在取得正式资料后补充。'],
    paragraphsEn: ['Hongcai Wanfu focuses on bathroom products, hardware and installation accessories for wholesale, export and project sourcing clients.', 'We organise the information buyers need to confirm first — product range, model, material, finish and application — so scattered product details are easier to browse, compare and discuss.', 'From sample confirmation and quotation to project follow-up, we want every cooperation conversation to start with clear information. Company scale, manufacturing capability and certifications will be added after formal confirmation.'],
    image: '/assets/images/hero-basin-concept.webp', imageAltZh: '卫浴产品场景示意', imageAltEn: 'Bathroom product scene',
    contentBlocks: [
      { id: 'profile-positioning', type: 'text', bodyZh: '红财万富专注于卫浴产品、卫浴五金与安装配件的供应与采购协同，服务于批发、外贸及工程采购等合作场景。我们不把公司简介写成空泛的口号，而是从买家真正关心的问题出发：产品是否适配使用场景，型号与材质是否清楚，表面处理、安装方式和配套关系是否便于确认。', bodyEn: 'Hongcai Wanfu focuses on the supply and sourcing coordination of bathroom products, bathroom hardware and installation accessories for wholesale, international trade and project procurement. Rather than relying on broad claims, we start with the questions buyers actually need answered: whether a product suits its application, whether its model and material are clear, and whether its finish, installation method and matching components can be confirmed efficiently.', image: '', titleZh: '', titleEn: '', captionZh: '', captionEn: '', altZh: '', altEn: '' },
      { id: 'profile-showroom', type: 'image', bodyZh: '', bodyEn: '', image: '/uploads/about/company-profile-showroom.webp', titleZh: '从真实使用场景理解产品', titleEn: 'Understanding products through real applications', captionZh: '瓷白、矿物黑与品牌红构成清晰克制的产品场景', captionEn: 'Porcelain white, mineral black and brand red create a clear, restrained product setting.', altZh: '卫浴空间与产品陈列示意', altEn: 'Bathroom setting and product display' },
      { id: 'profile-product-range', type: 'text', bodyZh: '围绕龙头、花洒、面盆、阀件、软管与安装配件等品类，我们持续梳理产品范围和资料结构。面对不同市场、项目和渠道需求，我们会优先确认用途、尺寸、材质、表面效果和组合方式，让选品从“看起来合适”进一步走向“信息可以比较、细节可以沟通”。', bodyEn: 'Across faucets, showers, basins, valves, hoses and installation accessories, we continuously organise the product range and its supporting information. For different markets, projects and sales channels, we first clarify application, dimensions, material, finish and configuration—moving product selection from “looks suitable” to information that can be compared and details that can be discussed.', image: '', titleZh: '', titleEn: '', captionZh: '', captionEn: '', altZh: '', altEn: '' },
      { id: 'profile-details', type: 'image', bodyZh: '', bodyEn: '', image: '/uploads/about/company-profile-details.webp', titleZh: '把材质与配套细节说清楚', titleEn: 'Making materials and matching details clear', captionZh: '龙头、阀件、软管及连接配件的材质与结构示意', captionEn: 'A closer look at the materials and structures of faucets, valves, hoses and connectors.', altZh: '卫浴五金与安装配件细节', altEn: 'Bathroom hardware and installation accessory details' },
      { id: 'profile-process', type: 'text', bodyZh: '一项采购往往不只是选择单个产品，还需要在样品、报价、交期、包装与项目资料之间反复核对。我们的工作方式是把这些关键节点逐步整理清楚：先理解需求，再围绕已确认的信息提供产品建议和资料支持；对尚未取得正式依据的参数、认证或能力说明，明确保留为待确认内容。', bodyEn: 'Sourcing often involves more than choosing a single product. Samples, quotations, lead times, packaging and project documents all need to be checked together. We organise these key stages step by step: first understanding the requirement, then providing product suggestions and information support based on what has been confirmed. Parameters, certifications or capability statements without formal evidence remain clearly marked as pending confirmation.', image: '', titleZh: '', titleEn: '', captionZh: '', captionEn: '', altZh: '', altEn: '' },
      { id: 'profile-sourcing', type: 'image', bodyZh: '', bodyEn: '', image: '/uploads/about/company-profile-sourcing.webp', titleZh: '让选品和资料跟进更有条理', titleEn: 'A more organised approach to selection and follow-up', captionZh: '围绕产品样品、材质选项和项目资料开展选品沟通', captionEn: 'Product discussions organised around samples, material options and project documentation.', altZh: '产品选型与资料整理', altEn: 'Product selection and information organisation' },
      { id: 'profile-follow-up', type: 'text', bodyZh: '从首次咨询到后续跟进，我们重视回应的准确性和资料的一致性。无论是常规备选方案，还是具体项目的阶段性需求，都希望通过清晰的记录、真实的说明和持续的沟通，减少重复确认，让合作双方更快找到重点。', bodyEn: 'From the first enquiry through ongoing follow-up, we value accurate responses and consistent information. Whether the need is a standard alternative or a project-specific requirement at a particular stage, clear records, truthful explanations and continuous communication help reduce repeated checks and keep both sides focused on what matters.', image: '', titleZh: '', titleEn: '', captionZh: '', captionEn: '', altZh: '', altEn: '' },
      { id: 'profile-long-term', type: 'text', bodyZh: '我们相信，长期合作始于一次不夸大的介绍，也建立在每一项细节都经得起核对之上。随着真实企业资料、产品文件和合作案例完成整理，本网站也会持续补充和更新，为采购伙伴提供更完整、更可靠的了解入口。', bodyEn: 'We believe long-term cooperation begins with an honest introduction and grows from details that stand up to verification. As verified company information, product documents and cooperation cases are organised, this website will continue to be updated to give sourcing partners a more complete and reliable way to understand us.', image: '', titleZh: '', titleEn: '', captionZh: '', captionEn: '', altZh: '', altEn: '' }
    ] as AboutProfileBlock[],
    gallery: [
      { image: '/assets/images/hero-basin-concept.webp', titleZh: '卫浴产品场景', titleEn: 'Bathroom product scene', captionZh: '示意素材 / 待替换', captionEn: 'Concept visual / pending replacement', altZh: '卫浴产品场景示意', altEn: 'Bathroom product scene' },
      { image: '/assets/images/detail-materials.webp', titleZh: '材质与细节', titleEn: 'Materials and details', captionZh: '示意素材 / 待替换', captionEn: 'Concept visual / pending replacement', altZh: '卫浴材质细节示意', altEn: 'Bathroom materials detail' }
    ] as AboutImage[]
  },
  brandCulture: {
    titleZh: '品牌文化', titleEn: 'Brand culture',
    introZh: '红财万富以真实产品信息为基础，以清晰协作为方法，以长期共进为方向，致力于成为值得采购伙伴持续信任的卫浴品牌。',
    introEn: 'Hongcai Wanfu is building a bathroom brand that sourcing partners can trust over time—grounded in verified product information, clear collaboration and long-term progress.',
    image: '/assets/images/detail-materials.webp', imageAltZh: '红财万富卫浴产品材质与品牌场景示意', imageAltEn: 'Illustrative Hongcai Wanfu bathroom product materials and brand setting',
    paragraphsZh: ['红财万富的品牌定位，不是面向终端零售的潮流标签，而是服务批发、外贸与工程采购的专业卫浴合作品牌。我们的使命，是把分散的产品、材质、安装和配套信息整理得更清楚，让合作伙伴能够更高效地选品、比较和推进项目；核心价值则落实为真实、清晰、负责与长期。', '品牌理念需要通过看得见、摸得着的载体被持续识别。现有品牌标志以品牌红作为识别信号，以矿物黑传达专业与稳定，以瓷白保持卫浴空间的洁净感。网站、产品资料、包装、展陈与办公环境将遵循统一的中英文名称、色彩和信息层级；在真实素材尚未完成前，不以虚构场景代替正式展示。', '红财万富的品牌建设伴随产品体系和采购资料的整理逐步展开。早期重点是明确卫浴产品、卫浴五金与安装配件的范围；当前阶段进一步建立中英文内容、图片、型号、材质和应用信息的统一表达；未来将随着真实包装、办公环境、产品文件和合作案例的完善，持续补充可验证的品牌记录。每一步更新都应有真实资料作为依据。', '我们的独特性不在夸张承诺，而在用采购视角组织品牌内容：把产品范围、型号、材质、表面处理、安装方式与配套关系放进同一套信息框架，并通过中英文内容同步，让信息能够持续维护。对尚未确认的参数和能力说明明确标注状态，这种以透明度提升协作效率的方式，是我们持续优化的方向。', '品牌文化最终要落到合作体验。无论访客是寻找常规品类、比较备选方案，还是推进具体项目，我们都希望清晰导航、易读内容、真实图片和明确联系入口帮助他们快速找到下一步。通过每一次准确回应、每一轮资料确认和每一个问题的持续跟进，让品牌不只被看见，更在合作中被理解与信任。'],
    paragraphsEn: ['Hongcai Wanfu is positioned not as a trend-led retail label, but as a professional bathroom-products partner for wholesale, international trade and project procurement. Our mission is to organise fragmented product, material, installation and compatibility information more clearly, helping partners select, compare and move projects forward efficiently. Our core values are honesty, clarity, responsibility and long-term commitment.', 'A brand idea becomes recognisable through visible and tangible expressions. Our current identity uses brand red as its recognition signal, mineral black to convey professionalism and stability, and porcelain white to reflect the clean character of bathroom spaces. The website, product documents, packaging, displays and office environment will follow consistent Chinese and English names, colours and information hierarchy. Until authentic materials are available, fictional scenes will not be presented as formal brand evidence.', 'Hongcai Wanfu’s brand development is progressing alongside the organisation of its product system and sourcing information. The first priority was to define the scope of bathroom products, bathroom hardware and installation accessories. The current stage establishes a consistent bilingual structure for copy, imagery, models, materials and applications. As authentic packaging, workplace materials, product documents and cooperation cases become available, verifiable brand records will continue to be added. Every update should be supported by real evidence.', 'Our distinction does not come from exaggerated promises, but from organising brand content through a sourcing perspective. Product scope, models, materials, finishes, installation methods and compatible components sit within one information framework, while bilingual content keeps that information maintainable. Clearly labelling the status of unconfirmed parameters and capability statements is part of our continuing effort to improve collaboration through transparency.', 'Brand culture ultimately lives in the cooperation experience. Whether visitors are exploring standard categories, comparing alternatives or advancing a specific project, clear navigation, readable content, authentic imagery and direct contact paths should help them identify the next step quickly. Through accurate responses, careful document confirmation and consistent follow-up, the brand becomes not only visible, but understood and trusted through cooperation.'],
    contentBlocks: [
      { id: 'culture-positioning', type: 'text', bodyZh: '红财万富的品牌定位，不是面向终端零售的潮流标签，而是服务批发、外贸与工程采购的专业卫浴合作品牌。我们的使命，是把分散的产品、材质、安装和配套信息整理得更清楚，让合作伙伴能够更高效地选品、比较和推进项目；核心价值则落实为真实、清晰、负责与长期。', bodyEn: 'Hongcai Wanfu is positioned not as a trend-led retail label, but as a professional bathroom-products partner for wholesale, international trade and project procurement. Our mission is to organise fragmented product, material, installation and compatibility information more clearly, helping partners select, compare and move projects forward efficiently. Our core values are honesty, clarity, responsibility and long-term commitment.', image: '', titleZh: '', titleEn: '', captionZh: '', captionEn: '', altZh: '', altEn: '' },
      { id: 'culture-visual-language', type: 'image', bodyZh: '', bodyEn: '', image: '/assets/images/detail-materials.webp', titleZh: '品牌视觉与材质语言', titleEn: 'Visual identity and material language', captionZh: '以品牌红、矿物黑和瓷白构成统一、克制的视觉识别（场景示意）', captionEn: 'Brand red, mineral black and porcelain white form a consistent, restrained visual identity. Illustrative scene.', altZh: '红财万富品牌色彩与卫浴材质场景示意', altEn: 'Illustrative Hongcai Wanfu brand colours and bathroom materials' },
      { id: 'culture-material-carriers', type: 'text', bodyZh: '品牌理念需要通过看得见、摸得着的载体被持续识别。现有品牌标志以品牌红作为识别信号，以矿物黑传达专业与稳定，以瓷白保持卫浴空间的洁净感。网站、产品资料、包装、展陈与办公环境将遵循统一的中英文名称、色彩和信息层级；在真实素材尚未完成前，不以虚构场景代替正式展示。', bodyEn: 'A brand idea becomes recognisable through visible and tangible expressions. Our current identity uses brand red as its recognition signal, mineral black to convey professionalism and stability, and porcelain white to reflect the clean character of bathroom spaces. The website, product documents, packaging, displays and office environment will follow consistent Chinese and English names, colours and information hierarchy. Until authentic materials are available, fictional scenes will not be presented as formal brand evidence.', image: '', titleZh: '', titleEn: '', captionZh: '', captionEn: '', altZh: '', altEn: '' },
      { id: 'culture-application', type: 'image', bodyZh: '', bodyEn: '', image: '/assets/images/hero-faucet-concept.webp', titleZh: '产品应用与空间表达', titleEn: 'Product application and spatial expression', captionZh: '围绕产品应用、安装关系与空间感受建立一致的品牌表达（场景示意）', captionEn: 'A consistent brand expression shaped around product use, installation relationships and spatial experience. Illustrative scene.', altZh: '卫浴产品应用与品牌空间场景示意', altEn: 'Illustrative bathroom product application and branded space' },
      { id: 'culture-development', type: 'text', bodyZh: '红财万富的品牌建设伴随产品体系和采购资料的整理逐步展开。早期重点是明确卫浴产品、卫浴五金与安装配件的范围；当前阶段进一步建立中英文内容、图片、型号、材质和应用信息的统一表达；未来将随着真实包装、办公环境、产品文件和合作案例的完善，持续补充可验证的品牌记录。每一步更新都应有真实资料作为依据。', bodyEn: 'The development of the Hongcai Wanfu brand is progressing alongside the organisation of its product system and sourcing information. The first priority was to define the scope of bathroom products, bathroom hardware and installation accessories. The current stage establishes a consistent bilingual structure for copy, imagery, models, materials and applications. As authentic packaging, workplace materials, product documents and cooperation cases become available, verifiable brand records will continue to be added. Every update should be supported by real evidence.', image: '', titleZh: '', titleEn: '', captionZh: '', captionEn: '', altZh: '', altEn: '' },
      { id: 'culture-innovation', type: 'text', bodyZh: '我们的独特性不在夸张承诺，而在用采购视角组织品牌内容：把产品范围、型号、材质、表面处理、安装方式与配套关系放进同一套信息框架，并通过中英文内容同步，让信息能够持续维护。对尚未确认的参数和能力说明明确标注状态，这种以透明度提升协作效率的方式，是我们持续优化的方向。', bodyEn: 'Our distinction does not come from exaggerated promises, but from organising brand content through a sourcing perspective. Product scope, models, materials, finishes, installation methods and compatible components sit within one information framework, while bilingual content keeps that information maintainable. Clearly labelling the status of unconfirmed parameters and capability statements is part of our continuing effort to improve collaboration through transparency.', image: '', titleZh: '', titleEn: '', captionZh: '', captionEn: '', altZh: '', altEn: '' },
      { id: 'culture-experience', type: 'text', bodyZh: '品牌文化最终要落到合作体验。无论访客是寻找常规品类、比较备选方案，还是推进具体项目，我们都希望清晰导航、易读内容、真实图片和明确联系入口帮助他们快速找到下一步。通过每一次准确回应、每一轮资料确认和每一个问题的持续跟进，让品牌不只被看见，更在合作中被理解与信任。', bodyEn: 'Brand culture ultimately lives in the cooperation experience. Whether visitors are exploring standard categories, comparing alternatives or advancing a specific project, clear navigation, readable content, authentic imagery and direct contact paths should help them identify the next step quickly. Through accurate responses, careful document confirmation and consistent follow-up, the brand becomes not only visible, but understood and trusted through cooperation.', image: '', titleZh: '', titleEn: '', captionZh: '', captionEn: '', altZh: '', altEn: '' }
    ] as AboutProfileBlock[],
    gallery: [
      { image: '/assets/images/detail-materials.webp', titleZh: '品牌视觉与材质语言', titleEn: 'Visual identity and material language', captionZh: '以品牌红、矿物黑和瓷白构成统一、克制的视觉识别（场景示意）', captionEn: 'Brand red, mineral black and porcelain white form a consistent, restrained visual identity. Illustrative scene.', altZh: '红财万富品牌色彩与卫浴材质场景示意', altEn: 'Illustrative Hongcai Wanfu brand colours and bathroom materials' },
      { image: '/assets/images/hero-faucet-concept.webp', titleZh: '产品应用与空间表达', titleEn: 'Product application and spatial expression', captionZh: '围绕产品应用、安装关系与空间感受建立一致的品牌表达（场景示意）', captionEn: 'A consistent brand expression shaped around product use, installation relationships and spatial experience. Illustrative scene.', altZh: '卫浴产品应用与品牌空间场景示意', altEn: 'Illustrative bathroom product application and branded space' }
    ] as AboutImage[],
    principles: [
      { icon: 'lucide:scan-search', titleZh: '定位清晰', titleEn: 'Clear positioning', detailZh: '面向批发、外贸和工程采购，围绕专业选品与项目协作建立品牌价值。', detailEn: 'Brand value is built around professional product selection and project collaboration for wholesale, international trade and project procurement.' },
      { icon: 'lucide:palette', titleZh: '视觉一致', titleEn: 'Visual consistency', detailZh: '让标志、标准色、中英文名称及信息层级在网站、资料、包装和空间中保持统一。', detailEn: 'The mark, standard colours, bilingual naming and information hierarchy remain consistent across the website, documents, packaging and physical spaces.' },
      { icon: 'lucide:badge-check', titleZh: '发展有据', titleEn: 'Evidence-based development', detailZh: '以已确认的产品资料、品牌素材和合作记录呈现发展过程，不用虚构故事填补空白。', detailEn: 'Confirmed product information, brand materials and cooperation records document progress without filling gaps with fictional stories.' },
      { icon: 'lucide:workflow', titleZh: '信息创新', titleEn: 'Information innovation', detailZh: '以采购逻辑组织产品信息，并通过中英文内容同步提升沟通效率。', detailEn: 'Product information follows sourcing logic, while bilingual content improves communication efficiency.' },
      { icon: 'lucide:route', titleZh: '体验连贯', titleEn: 'A coherent experience', detailZh: '让访客从认识品牌、理解产品到提出需求都能快速找到重点和清晰的下一步。', detailEn: 'Visitors can identify the key information and a clear next step from brand discovery and product understanding through to enquiry.' }
    ] as AboutPrinciple[]
  },
  qualifications: {
    titleZh: '荣誉资质', titleEn: 'Qualifications',
    introZh: '只呈现真实、有效、可核验的企业与产品资料。',
    introEn: 'Only authentic, valid and verifiable company and product materials are presented.',
    noticeZh: '本区域用于后续展示经核验的证书与荣誉。现阶段不使用示例证书，也不以未经确认的信息代替正式资质。',
    noticeEn: 'This area is reserved for verified certificates and honours. No sample certificate or unconfirmed claim is used as a placeholder.',
    items: [
      { titleZh: '企业与商标资料', titleEn: 'Company and trademark records', detailZh: '相关资料将在完成整理并确认可公开范围后上传。', detailEn: 'Documents will be uploaded after review and confirmation of their public scope.', statusLabelZh: '待补充真实资料', statusLabelEn: 'Pending verified material', fileUrl: '' },
      { titleZh: '产品与品质文件', titleEn: 'Product and quality documents', detailZh: '检测报告、认证和品质文件以正式、可核验资料为准。', detailEn: 'Test reports, certifications and quality documents are subject to formal, verifiable files.', statusLabelZh: '待补充真实资料', statusLabelEn: 'Pending verified material', fileUrl: '' },
      { titleZh: '合作所需文件', titleEn: 'Cooperation documents', detailZh: '涉及具体产品或项目的文件，可在采购沟通阶段按需提供。', detailEn: 'Product- or project-specific documents can be provided during sourcing discussions when applicable.', statusLabelZh: '待补充真实资料', statusLabelEn: 'Pending verified material', fileUrl: '' }
    ] as QualificationItem[]
  },
  brandVi: {
    titleZh: '企业 VI', titleEn: 'Visual identity',
    items: [] as { image: string; titleZh: string; titleEn: string }[]
  }
}

export const defaultContactContent = {
  channels: {
    phone: '', phoneHoursZh: '工作时间：待补充', phoneHoursEn: 'Service hours: pending',
    email: '', emailNoteZh: '欢迎发送产品需求、项目资料或合作咨询', emailNoteEn: 'Product requests, project files and cooperation enquiries are welcome.',
    social: '', socialNoteZh: '添加我们，随时沟通', socialNoteEn: 'Connect with us for ongoing communication.',
    serviceHoursZh: '待补充', serviceHoursEn: 'Pending', serviceNoteZh: '非服务时间的留言将在工作时段依次处理', serviceNoteEn: 'Messages outside service hours will be handled in order.'
  },
  location: {
    addressZh: '', addressEn: '', noteZh: '欢迎预约到访', noteEn: 'Visits are welcome by appointment.', mapEmbedUrl: '', mapLink: '', latitude: 28.008387, longitude: 120.646399, zoom: 14
  },
  inquiry: {
    introZh: '请填写以下信息，让我们更好地了解您的需求。', introEn: 'Please share a few details so we can understand your sourcing needs.',
    privacyZh: '我们会妥善保管您的信息，仅用于商务沟通。', privacyEn: 'Your information is kept securely and used only for business communication.'
  }
}

export type SocialContactChannel = {
  id: 'wechat' | 'wecom' | 'whatsapp' | 'douyin' | 'tiktok'
  icon: string
  nameZh: string
  nameEn: string
  qrImage: string
  enabled: boolean
}

export const defaultSocialContactContent = {
  channels: [
    { id: 'wechat', icon: 'simple-icons:wechat', nameZh: '微信', nameEn: 'WeChat', qrImage: '', enabled: true },
    { id: 'wecom', icon: 'ri:wechat-2-fill', nameZh: '企业微信', nameEn: 'WeCom', qrImage: '', enabled: true },
    { id: 'whatsapp', icon: 'simple-icons:whatsapp', nameZh: 'WhatsApp', nameEn: 'WhatsApp', qrImage: '', enabled: true },
    { id: 'douyin', icon: 'ri:tiktok-fill', nameZh: '抖音', nameEn: 'Douyin', qrImage: '', enabled: true },
    { id: 'tiktok', icon: 'simple-icons:tiktok', nameZh: 'TikTok', nameEn: 'TikTok', qrImage: '', enabled: true }
  ] as SocialContactChannel[]
}

export const defaultProductCatalogueContent = {
  fileUrl: '',
  titleZh: '产品电子图册',
  titleEn: 'Product catalogue'
}

export const defaultHomeProductContent = {
  // An empty selection keeps the public homepage product gallery empty until
  // an administrator explicitly chooses products.
  productIds: [] as string[]
}

export type AboutContent = typeof defaultAboutContent
export type ContactContent = typeof defaultContactContent
export type SocialContactContent = typeof defaultSocialContactContent
export type ProductCatalogueContent = typeof defaultProductCatalogueContent
export type HomeProductContent = typeof defaultHomeProductContent
