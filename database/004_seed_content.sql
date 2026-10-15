-- 补充内容数据：首页轮播 / 新闻文章 / 案例 / 站点设置
--
-- 背景：001_initial.sql 只建表、不含任何数据，新部署的库里这些表都是空的，
-- 表现为后台「暂无首页轮播内容」「新闻列表为空」「案例为空」，而前台因为
-- 有代码兜底数据所以看着正常。
--
-- 用法：宝塔面板先把数据库切到 hongcai_wanfu，再导入本文件。
-- 可重复导入：按主键 UPSERT；站点设置用 INSERT IGNORE，不会覆盖你已保存的设置。
-- 分类外键按中文名实时解析，因此不受各环境分类 ID 不同的影响。

START TRANSACTION;

-- ========== 首页轮播（固定 4 个位置）==========
-- 共 4 条

-- [1] 花洒系统 / Shower systems / 一套好花洒，让淋浴更舒适。
INSERT INTO home_hero_slides (id, category_zh, category_en, title_lead_zh, title_lead_en, title_emphasis_zh, title_emphasis_en, summary_zh, summary_en, image, primary_label_zh, primary_label_en, primary_to, secondary_label_zh, secondary_label_en, meta, sort_order, status)
VALUES (
  'shower-systems',
  '花洒系统 / Shower systems', '花洒系统 / Shower systems',
  '一套好花洒，', 'Comfort starts',
  '让淋浴更舒适。', 'with the shower.',
  '围绕安装方式、出水配置、表面颜色和采购数量整理产品信息，帮助客户更快确认选型与报价需求。', 'Compare installation, water-flow options, finishes and quantities in one clear path from product selection to quotation.',
  '/assets/images/hero-sanitaryware.webp',
  '查看产品系列', 'Explore products', '/products',
  '提交采购需求', 'Send sourcing needs',
  '[{"en":"Product selection","zh":"产品选型"},{"en":"Volume quotation","zh":"批量询价"}]', 1, 'DRAFT'
)
ON DUPLICATE KEY UPDATE
  category_zh = VALUES(category_zh), category_en = VALUES(category_en),
  title_lead_zh = VALUES(title_lead_zh), title_lead_en = VALUES(title_lead_en),
  title_emphasis_zh = VALUES(title_emphasis_zh), title_emphasis_en = VALUES(title_emphasis_en),
  summary_zh = VALUES(summary_zh), summary_en = VALUES(summary_en),
  image = VALUES(image), primary_to = VALUES(primary_to),
  sort_order = VALUES(sort_order), status = VALUES(status);

-- [2] 面盆龙头 / Basin faucets / 选对面盆龙头，从搭配开始。
INSERT INTO home_hero_slides (id, category_zh, category_en, title_lead_zh, title_lead_en, title_emphasis_zh, title_emphasis_en, summary_zh, summary_en, image, primary_label_zh, primary_label_en, primary_to, secondary_label_zh, secondary_label_en, meta, sort_order, status)
VALUES (
  'basin-faucets',
  '面盆龙头 / Basin faucets', '面盆龙头 / Basin faucets',
  '选对面盆龙头，', 'Find the right',
  '从搭配开始。', 'basin faucet.',
  '按台盆搭配、龙头高度、表面颜色和使用场景梳理选择，让型号比较与采购沟通更直接。', 'Compare basin pairings, faucet heights, finishes and use cases to make model selection and sourcing conversations more direct.',
  '/assets/images/hero-basin-concept.webp',
  '查看产品系列', 'Explore products', '/products',
  '提交采购需求', 'Send sourcing needs',
  '[{"en":"Product selection","zh":"产品选型"},{"en":"Volume quotation","zh":"批量询价"}]', 2, 'DRAFT'
)
ON DUPLICATE KEY UPDATE
  category_zh = VALUES(category_zh), category_en = VALUES(category_en),
  title_lead_zh = VALUES(title_lead_zh), title_lead_en = VALUES(title_lead_en),
  title_emphasis_zh = VALUES(title_emphasis_zh), title_emphasis_en = VALUES(title_emphasis_en),
  summary_zh = VALUES(summary_zh), summary_en = VALUES(summary_en),
  image = VALUES(image), primary_to = VALUES(primary_to),
  sort_order = VALUES(sort_order), status = VALUES(status);

-- [3] 水龙头系列 / Faucet collection / 产品选择，从清晰分类开始。
INSERT INTO home_hero_slides (id, category_zh, category_en, title_lead_zh, title_lead_en, title_emphasis_zh, title_emphasis_en, summary_zh, summary_en, image, primary_label_zh, primary_label_en, primary_to, secondary_label_zh, secondary_label_en, meta, sort_order, status)
VALUES (
  'faucet-collection',
  '水龙头系列 / Faucet collection', '水龙头系列 / Faucet collection',
  '产品选择，', 'Choose from a',
  '从清晰分类开始。', 'clear faucet range.',
  '围绕面盆、淋浴、浴缸与厨房等使用场景归类产品，方便客户快速浏览、比较并提交采购需求。', 'Browse faucets by basin, shower, bath and kitchen applications, then compare options and send sourcing requirements with less back-and-forth.',
  '/assets/images/hero-faucet-concept.webp',
  '查看产品系列', 'Explore products', '/products',
  '提交采购需求', 'Send sourcing needs',
  '[{"en":"Product selection","zh":"产品选型"},{"en":"Volume quotation","zh":"批量询价"}]', 3, 'DRAFT'
)
ON DUPLICATE KEY UPDATE
  category_zh = VALUES(category_zh), category_en = VALUES(category_en),
  title_lead_zh = VALUES(title_lead_zh), title_lead_en = VALUES(title_lead_en),
  title_emphasis_zh = VALUES(title_emphasis_zh), title_emphasis_en = VALUES(title_emphasis_en),
  summary_zh = VALUES(summary_zh), summary_en = VALUES(summary_en),
  image = VALUES(image), primary_to = VALUES(primary_to),
  sort_order = VALUES(sort_order), status = VALUES(status);

-- [4] 厨房龙头 / Kitchen faucets / 选对厨房龙头，先看安装方式。
INSERT INTO home_hero_slides (id, category_zh, category_en, title_lead_zh, title_lead_en, title_emphasis_zh, title_emphasis_en, summary_zh, summary_en, image, primary_label_zh, primary_label_en, primary_to, secondary_label_zh, secondary_label_en, meta, sort_order, status)
VALUES (
  'kitchen-faucets',
  '厨房龙头 / Kitchen faucets', '厨房龙头 / Kitchen faucets',
  '选对厨房龙头，', 'Match the right',
  '先看安装方式。', 'kitchen faucet.',
  '覆盖立式、万向与壁挂等常见方向，结合空间、使用习惯和采购数量，帮助客户更快确定产品范围。', 'Compare deck-mounted, swivel and wall-mounted options by space, use and quantity to narrow the right kitchen faucet range faster.',
  '/assets/images/hero-kitchen-wall-concept.webp',
  '查看产品系列', 'Explore products', '/products',
  '提交采购需求', 'Send sourcing needs',
  '[{"en":"Product selection","zh":"产品选型"},{"en":"Volume quotation","zh":"批量询价"}]', 4, 'DRAFT'
)
ON DUPLICATE KEY UPDATE
  category_zh = VALUES(category_zh), category_en = VALUES(category_en),
  title_lead_zh = VALUES(title_lead_zh), title_lead_en = VALUES(title_lead_en),
  title_emphasis_zh = VALUES(title_emphasis_zh), title_emphasis_en = VALUES(title_emphasis_en),
  summary_zh = VALUES(summary_zh), summary_en = VALUES(summary_en),
  image = VALUES(image), primary_to = VALUES(primary_to),
  sort_order = VALUES(sort_order), status = VALUES(status);

-- ========== 新闻文章 ==========
-- 共 6 条

-- 包装与交付沟通中的常见确认项 (行业资讯)
INSERT INTO articles (id, title_zh, title_en, slug, category_id, summary_zh, summary_en, content_zh, content_en, cover_image, published_at, status, sort_order)
VALUES ('news_sample_industry_03', '包装与交付沟通中的常见确认项', 'Common checks for packaging and delivery discussions', 'packaging-and-delivery-confirmation', (SELECT id FROM categories WHERE name_zh = '行业资讯' LIMIT 1),
  '包装方式、标识要求、数量与运输安排应结合具体产品确认，避免沿用不适合当前采购的默认条件。', 'Packaging, labelling, quantity and transport arrangements should be confirmed for the selected products instead of assumed.',
  '包装与交付条件通常会受到产品尺寸、组合方式、采购数量、运输路径和标识需求影响。即使是相近品类，也不宜直接套用同一套包装说明。\n\n沟通时可逐项确认单品与组合包装、外箱标识、随附资料、装运方式和期望时间。最终方案与时间应在产品和数量明确后确认，避免把示例信息当作正式承诺。', 'Packaging and delivery terms can be affected by product size, bundle configuration, sourcing quantity, transport route and labelling requirements. Similar categories should not automatically be assigned the same packaging specification.\n\nDiscuss individual and bundled packaging, carton marks, accompanying documents, shipping method and preferred schedule item by item. The final arrangement and timing should be confirmed after products and quantities are clear, so example information is not mistaken for a commitment.',
  '/assets/images/hero-sanitaryware.webp', '2026-07-30 01:00:00', 'PUBLISHED', 30)
ON DUPLICATE KEY UPDATE
  title_zh = VALUES(title_zh), title_en = VALUES(title_en),
  category_id = VALUES(category_id), summary_zh = VALUES(summary_zh), summary_en = VALUES(summary_en),
  content_zh = VALUES(content_zh), content_en = VALUES(content_en),
  cover_image = VALUES(cover_image), published_at = VALUES(published_at),
  status = VALUES(status), sort_order = VALUES(sort_order);

-- 如何比较水龙头的材质与表面处理信息 (行业资讯)
INSERT INTO articles (id, title_zh, title_en, slug, category_id, summary_zh, summary_en, content_zh, content_en, cover_image, published_at, status, sort_order)
VALUES ('news_sample_industry_02', '如何比较水龙头的材质与表面处理信息', 'How to compare faucet material and finish information', 'compare-faucet-material-and-finish', (SELECT id FROM categories WHERE name_zh = '行业资讯' LIMIT 1),
  '比较产品时应区分主体材质、零部件材质与表面效果，并结合使用环境确认具体要求。', 'Product comparison should distinguish body material, component materials and surface finish in relation to the intended environment.',
  '“材质”和“表面处理”是两个不同维度。采购人员可先确认产品主体与关键零部件的材质说明，再了解表面颜色、纹理和处理方式，避免只根据图片判断。\n\n不同使用环境对清洁、维护、配套颜色和耐用性的关注点并不相同。询价时建议列出需要确认的部位和效果，并索取对应型号的正式资料；检测或认证信息应以可核验文件为准。', 'Material and surface finish are separate dimensions. Buyers can first confirm the stated materials for the product body and key components, then review colour, texture and finish instead of relying on imagery alone.\n\nCleaning, maintenance, colour coordination and durability priorities vary by environment. An enquiry should list the parts and finishes that need confirmation and request official information for the relevant model. Test and certification information should always be supported by verifiable documents.',
  '/assets/images/detail-materials.webp', '2026-08-26 01:00:00', 'PUBLISHED', 20)
ON DUPLICATE KEY UPDATE
  title_zh = VALUES(title_zh), title_en = VALUES(title_en),
  category_id = VALUES(category_id), summary_zh = VALUES(summary_zh), summary_en = VALUES(summary_en),
  content_zh = VALUES(content_zh), content_en = VALUES(content_en),
  cover_image = VALUES(cover_image), published_at = VALUES(published_at),
  status = VALUES(status), sort_order = VALUES(sort_order);

-- 网站内容更新聚焦采购沟通 (公司新闻)
INSERT INTO articles (id, title_zh, title_en, slug, category_id, summary_zh, summary_en, content_zh, content_en, cover_image, published_at, status, sort_order)
VALUES ('news_sample_company_03', '网站内容更新聚焦采购沟通', 'Website content update focuses on sourcing communication', 'website-content-for-sourcing', (SELECT id FROM categories WHERE name_zh = '公司新闻' LIMIT 1),
  '从产品浏览到提交需求，页面内容围绕采购方向、数量、市场和项目要求组织，减少前期沟通遗漏。', 'From browsing to enquiry, content is organised around product direction, quantity, market and project requirements.',
  '网站内容更新以采购过程为主线：先浏览产品范围，再按品类查看基础信息，最后提交采购方向、预计数量、目标市场或项目要求。\n\n这些字段用于帮助双方更快确定需要补充的资料。报价、样品、包装与交付安排仍需结合具体产品和实际需求确认，页面不会预设未经核实的承诺。', 'The website update follows the sourcing process: browse the product range, review basic information by category, and then submit the product direction, estimated quantity, target market or project requirements.\n\nThese fields help both sides identify what information is still needed. Quotations, samples, packaging and delivery arrangements remain subject to the selected product and actual requirement, without unverified commitments on the website.',
  '/assets/images/hero-sanitaryware.webp', '2026-08-30 01:00:00', 'PUBLISHED', 30)
ON DUPLICATE KEY UPDATE
  title_zh = VALUES(title_zh), title_en = VALUES(title_en),
  category_id = VALUES(category_id), summary_zh = VALUES(summary_zh), summary_en = VALUES(summary_en),
  content_zh = VALUES(content_zh), content_en = VALUES(content_en),
  cover_image = VALUES(cover_image), published_at = VALUES(published_at),
  status = VALUES(status), sort_order = VALUES(sort_order);

-- 产品资料按采购信息框架持续整理 (公司新闻)
INSERT INTO articles (id, title_zh, title_en, slug, category_id, summary_zh, summary_en, content_zh, content_en, cover_image, published_at, status, sort_order)
VALUES ('news_sample_company_02', '产品资料按采购信息框架持续整理', 'Product information is being organised for sourcing decisions', 'product-information-framework', (SELECT id FROM categories WHERE name_zh = '公司新闻' LIMIT 1),
  '围绕品类、型号、材质、表面处理与图片等基础信息，逐步形成更便于选品和询价的资料结构。', 'Product categories, models, materials, finishes and imagery are being organised into a clearer structure for selection and enquiries.',
  '面向批发、外贸与工程采购，产品资料需要先回答“是什么、适合什么需求、还需要确认什么”。网站正在围绕产品品类、型号、材质、表面处理、图片和采购说明等基础字段整理信息。\n\n对于尚未取得正式资料的内容，页面会保留待补充或待确认提示。具体规格、包装、交期与定制条件，应在选定产品后根据实际需求进一步确认。', 'For wholesale, export and project sourcing, product information should first explain what the item is, which needs it may suit and what still needs confirmation. The website is organising information around product category, model, material, finish, imagery and sourcing notes.\n\nWhere official information is not yet available, the page keeps a pending or to-be-confirmed label. Specifications, packaging, lead time and customisation terms should be confirmed against the selected product and actual requirement.',
  '/assets/images/detail-materials.webp', '2026-09-18 01:00:00', 'PUBLISHED', 20)
ON DUPLICATE KEY UPDATE
  title_zh = VALUES(title_zh), title_en = VALUES(title_en),
  category_id = VALUES(category_id), summary_zh = VALUES(summary_zh), summary_en = VALUES(summary_en),
  content_zh = VALUES(content_zh), content_en = VALUES(content_en),
  cover_image = VALUES(cover_image), published_at = VALUES(published_at),
  status = VALUES(status), sort_order = VALUES(sort_order);

-- 卫浴五金询价前应准备哪些信息 (行业资讯)
INSERT INTO articles (id, title_zh, title_en, slug, category_id, summary_zh, summary_en, content_zh, content_en, cover_image, published_at, status, sort_order)
VALUES ('news_sample_industry_01', '卫浴五金询价前应准备哪些信息', 'What to prepare before requesting a bathroom hardware quotation', 'bathroom-hardware-enquiry-checklist', (SELECT id FROM categories WHERE name_zh = '行业资讯' LIMIT 1),
  '产品类别、使用场景、数量、目标市场与时间要求，是提高询价沟通效率的基础信息。', 'Product category, application, quantity, target market and schedule form the basis of an efficient quotation request.',
  '一份清晰的询价需求通常从产品类别和使用场景开始。例如，需要面盆龙头、花洒套装、厨房龙头，还是卫浴挂件与安装配件；用于批发备货、工程配套，还是其他采购方向。\n\n预计数量、目标市场、期望时间以及需要确认的材质、颜色、包装或标识，也应尽量一并说明。信息越完整，后续选品、资料补充与报价沟通越容易聚焦。具体可行性和交付条件仍应以实际确认结果为准。', 'A clear enquiry usually starts with product category and application. Specify whether you need basin faucets, shower sets, kitchen faucets, bathroom accessories or installation parts, and whether the requirement is for wholesale stocking, a project or another sourcing route.\n\nEstimated quantity, target market, preferred schedule, material, colour, packaging and branding requirements should also be included where possible. More complete information keeps product selection, document preparation and quotation discussions focused. Feasibility and delivery terms remain subject to actual confirmation.',
  '/assets/images/hero-basin-concept.webp', '2026-09-26 01:00:00', 'PUBLISHED', 10)
ON DUPLICATE KEY UPDATE
  title_zh = VALUES(title_zh), title_en = VALUES(title_en),
  category_id = VALUES(category_id), summary_zh = VALUES(summary_zh), summary_en = VALUES(summary_en),
  content_zh = VALUES(content_zh), content_en = VALUES(content_en),
  cover_image = VALUES(cover_image), published_at = VALUES(published_at),
  status = VALUES(status), sort_order = VALUES(sort_order);

-- 新闻中心完成栏目优化 (公司新闻)
INSERT INTO articles (id, title_zh, title_en, slug, category_id, summary_zh, summary_en, content_zh, content_en, cover_image, published_at, status, sort_order)
VALUES ('news_sample_company_01', '新闻中心完成栏目优化', 'News centre categories have been streamlined', 'news-centre-category-update', (SELECT id FROM categories WHERE name_zh = '公司新闻' LIMIT 1),
  '新闻内容现按公司新闻与行业资讯两条线整理，帮助采购人员更快找到企业动态和选品知识。', 'News content is now organised into company updates and industry insights, helping buyers find relevant information more quickly.',
  '红财万富网站新闻中心现保留“公司新闻”和“行业资讯”两个栏目。公司新闻用于记录产品资料、网站内容与服务信息的更新；行业资讯用于整理卫浴五金选品和采购沟通中的常见问题。\n\n栏目调整后，访问者可以更直接地区分企业动态与采购知识。后续发布的内容仍以已确认的信息为基础，不使用未经核验的客户、订单、认证或生产数据。', 'The Hongcai Wanfu website news centre now contains two sections: Company News and Industry Insights. Company News covers updates to product information, website content and service information, while Industry Insights explains common topics in bathroom hardware selection and sourcing communication.\n\nThe simplified structure makes it easier to distinguish company updates from practical sourcing knowledge. Future articles will continue to rely on confirmed information and will not use unverified customer, order, certification or production data.',
  '/assets/images/hero-basin-concept.webp', '2026-10-04 01:00:00', 'PUBLISHED', 10)
ON DUPLICATE KEY UPDATE
  title_zh = VALUES(title_zh), title_en = VALUES(title_en),
  category_id = VALUES(category_id), summary_zh = VALUES(summary_zh), summary_en = VALUES(summary_en),
  content_zh = VALUES(content_zh), content_en = VALUES(content_en),
  cover_image = VALUES(cover_image), published_at = VALUES(published_at),
  status = VALUES(status), sort_order = VALUES(sort_order);

-- ========== 案例 ==========
-- 共 5 条

-- 商业综合体场景 (项目案例)
INSERT INTO case_studies (id, title_zh, title_en, slug, category_id, summary_zh, summary_en, content_zh, content_en, project_type_zh, project_type_en, location_zh, location_en, supplied_products_zh, supplied_products_en, cover_image, status, sort_order)
VALUES ('12876f053eaf5ee3296a72e7bd5c25e9', '商业综合体场景', 'Commercial complex scene', 'commercial-complex-scene', (SELECT id FROM categories WHERE name_zh = '项目案例' LIMIT 1),
  '页面示例摘要，正式资料待补充。', 'Page sample summary; final project materials to be added.', '页面示例资料，正式内容待补充。', 'Page sample content; final project materials to be added.',
  '商业空间', '商业空间', '待填写', 'To be filled',
  '龙头、卫浴挂件、五金配件', '龙头、卫浴挂件、五金配件',
  '/uploads/cases/concept-commercial.webp', 'DRAFT', 0)
ON DUPLICATE KEY UPDATE
  title_zh = VALUES(title_zh), title_en = VALUES(title_en), category_id = VALUES(category_id),
  summary_zh = VALUES(summary_zh), summary_en = VALUES(summary_en),
  content_zh = VALUES(content_zh), content_en = VALUES(content_en),
  project_type_zh = VALUES(project_type_zh), project_type_en = VALUES(project_type_en),
  location_zh = VALUES(location_zh), location_en = VALUES(location_en),
  supplied_products_zh = VALUES(supplied_products_zh), supplied_products_en = VALUES(supplied_products_en),
  cover_image = VALUES(cover_image), status = VALUES(status), sort_order = VALUES(sort_order);

-- 酒店卫浴配套场景 (客户案例)
INSERT INTO case_studies (id, title_zh, title_en, slug, category_id, summary_zh, summary_en, content_zh, content_en, project_type_zh, project_type_en, location_zh, location_en, supplied_products_zh, supplied_products_en, cover_image, status, sort_order)
VALUES ('e1b7d5bd54edf7a7fcd962d0c6f28067', '酒店卫浴配套场景', 'Hotel bathroom package', 'hotel-bathroom-package', (SELECT id FROM categories WHERE name_zh = '客户案例' LIMIT 1),
  '页面示例摘要，正式资料待补充。', 'Page sample summary; final project materials to be added.', '页面示例资料，正式内容待补充。', 'Page sample content; final project materials to be added.',
  '酒店空间', '酒店空间', '待填写', 'To be filled',
  '淋浴五金、卫浴挂件、地漏', '淋浴五金、卫浴挂件、地漏',
  '/uploads/cases/concept-hospitality.webp', 'DRAFT', 0)
ON DUPLICATE KEY UPDATE
  title_zh = VALUES(title_zh), title_en = VALUES(title_en), category_id = VALUES(category_id),
  summary_zh = VALUES(summary_zh), summary_en = VALUES(summary_en),
  content_zh = VALUES(content_zh), content_en = VALUES(content_en),
  project_type_zh = VALUES(project_type_zh), project_type_en = VALUES(project_type_en),
  location_zh = VALUES(location_zh), location_en = VALUES(location_en),
  supplied_products_zh = VALUES(supplied_products_zh), supplied_products_en = VALUES(supplied_products_en),
  cover_image = VALUES(cover_image), status = VALUES(status), sort_order = VALUES(sort_order);

-- 现代公共空间卫浴项目 (项目案例)
INSERT INTO case_studies (id, title_zh, title_en, slug, category_id, summary_zh, summary_en, content_zh, content_en, project_type_zh, project_type_en, location_zh, location_en, supplied_products_zh, supplied_products_en, cover_image, status, sort_order)
VALUES ('cc8a415f4764a5ab3ce34fca8a19f386', '现代公共空间卫浴项目', 'Modern public-space bathroom project', 'modern-public-space-bathroom-project', (SELECT id FROM categories WHERE name_zh = '项目案例' LIMIT 1),
  '页面示例摘要，正式资料待补充。', 'Page sample summary; final project materials to be added.', '页面示例资料，正式内容待补充。', 'Page sample content; final project materials to be added.',
  '公共空间', '公共空间', '待填写', 'To be filled',
  '卫浴五金、感应龙头、挂件、阀门配件', '卫浴五金、感应龙头、挂件、阀门配件',
  '/uploads/cases/concept-commercial.webp', 'DRAFT', 0)
ON DUPLICATE KEY UPDATE
  title_zh = VALUES(title_zh), title_en = VALUES(title_en), category_id = VALUES(category_id),
  summary_zh = VALUES(summary_zh), summary_en = VALUES(summary_en),
  content_zh = VALUES(content_zh), content_en = VALUES(content_en),
  project_type_zh = VALUES(project_type_zh), project_type_en = VALUES(project_type_en),
  location_zh = VALUES(location_zh), location_en = VALUES(location_en),
  supplied_products_zh = VALUES(supplied_products_zh), supplied_products_en = VALUES(supplied_products_en),
  cover_image = VALUES(cover_image), status = VALUES(status), sort_order = VALUES(sort_order);

-- 办公空间场景 (客户案例)
INSERT INTO case_studies (id, title_zh, title_en, slug, category_id, summary_zh, summary_en, content_zh, content_en, project_type_zh, project_type_en, location_zh, location_en, supplied_products_zh, supplied_products_en, cover_image, status, sort_order)
VALUES ('0b323351513422e51e647d154bf9e04c', '办公空间场景', 'Office space scene', 'office-space-scene', (SELECT id FROM categories WHERE name_zh = '客户案例' LIMIT 1),
  '页面示例摘要，正式资料待补充。', 'Page sample summary; final project materials to be added.', '页面示例资料，正式内容待补充。', 'Page sample content; final project materials to be added.',
  '办公空间', '办公空间', '待填写', 'To be filled',
  '水龙头、卫浴挂件、五金配件', '水龙头、卫浴挂件、五金配件',
  '/uploads/cases/concept-workplace.webp', 'DRAFT', 0)
ON DUPLICATE KEY UPDATE
  title_zh = VALUES(title_zh), title_en = VALUES(title_en), category_id = VALUES(category_id),
  summary_zh = VALUES(summary_zh), summary_en = VALUES(summary_en),
  content_zh = VALUES(content_zh), content_en = VALUES(content_en),
  project_type_zh = VALUES(project_type_zh), project_type_en = VALUES(project_type_en),
  location_zh = VALUES(location_zh), location_en = VALUES(location_en),
  supplied_products_zh = VALUES(supplied_products_zh), supplied_products_en = VALUES(supplied_products_en),
  cover_image = VALUES(cover_image), status = VALUES(status), sort_order = VALUES(sort_order);

-- 住宅精装场景 (落地效果)
INSERT INTO case_studies (id, title_zh, title_en, slug, category_id, summary_zh, summary_en, content_zh, content_en, project_type_zh, project_type_en, location_zh, location_en, supplied_products_zh, supplied_products_en, cover_image, status, sort_order)
VALUES ('23e2c8a444f763439fa35d75d73dac49', '住宅精装场景', 'Residential finishing scene', 'residential-finishing-scene', (SELECT id FROM categories WHERE name_zh = '落地效果' LIMIT 1),
  '页面示例摘要，正式资料待补充。', 'Page sample summary; final project materials to be added.', '页面示例资料，正式内容待补充。', 'Page sample content; final project materials to be added.',
  '住宅空间', '住宅空间', '待填写', 'To be filled',
  '淋浴五金、卫浴挂件、开关面板', '淋浴五金、卫浴挂件、开关面板',
  '/uploads/cases/concept-residential.webp', 'DRAFT', 0)
ON DUPLICATE KEY UPDATE
  title_zh = VALUES(title_zh), title_en = VALUES(title_en), category_id = VALUES(category_id),
  summary_zh = VALUES(summary_zh), summary_en = VALUES(summary_en),
  content_zh = VALUES(content_zh), content_en = VALUES(content_en),
  project_type_zh = VALUES(project_type_zh), project_type_en = VALUES(project_type_en),
  location_zh = VALUES(location_zh), location_en = VALUES(location_en),
  supplied_products_zh = VALUES(supplied_products_zh), supplied_products_en = VALUES(supplied_products_en),
  cover_image = VALUES(cover_image), status = VALUES(status), sort_order = VALUES(sort_order);

-- ========== 站点设置 ==========
-- 用 INSERT IGNORE：已有同名 key 时保持不动，不会覆盖后台已保存的设置
-- 共 5 项

-- about（17149 字符）
INSERT IGNORE INTO site_settings (`key`, `value`) VALUES ('about', '{"brandVi":{"items":[],"titleEn":"Visual identity","titleZh":"企业 VI"},"brandCulture":{"image":"","gallery":[{"altEn":"Illustrative Hongcai Wanfu brand colours and bathroom materials","altZh":"红财万富品牌色彩与卫浴材质场景示意","image":"/assets/images/detail-materials.webp","titleEn":"Visual identity and material language","titleZh":"品牌视觉与材质语言","captionEn":"Brand red, mineral black and porcelain white form a consistent, restrained visual identity. Illustrative scene.","captionZh":"以品牌红、矿物黑和瓷白构成统一、克制的视觉识别（场景示意）"},{"altEn":"Illustrative bathroom product application and branded space","altZh":"卫浴产品应用与品牌空间场景示意","image":"/assets/images/hero-faucet-concept.webp","titleEn":"Product application and spatial expression","titleZh":"产品应用与空间表达","captionEn":"A consistent brand expression shaped around product use, installation relationships and spatial experience. Illustrative scene.","captionZh":"围绕产品应用、安装关系与空间感受建立一致的品牌表达（场景示意）"}],"introEn":"Hongcai Wanfu is building a bathroom brand that sourcing partners can trust over time—grounded in verified product information, clear collaboration and long-term progress.","introZh":"红财万富以真实产品信息为基础，以清晰协作为方法，以长期共进为方向，致力于成为值得采购伙伴持续信任的卫浴品牌。","titleEn":"Brand culture","titleZh":"品牌文化","imageAltEn":"Illustrative Hongcai Wanfu bathroom product materials and brand setting","imageAltZh":"红财万富卫浴产品材质与品牌场景示意","principles":[{"icon":"lucide:scan-search","titleEn":"Clear positioning","titleZh":"定位清晰","detailEn":"Brand value is built around professional product selection and project collaboration for wholesale, international trade and project procurement.","detailZh":"面向批发、外贸和工程采购，围绕专业选品与项目协作建立品牌价值。"},{"icon":"lucide:palette","titleEn":"Visual consistency","titleZh":"视觉一致","detailEn":"The mark, standard colours, bilingual naming and information hierarchy remain consistent across the website, documents, packaging and physical spaces.","detailZh":"让标志、标准色、中英文名称及信息层级在网站、资料、包装和空间中保持统一。"},{"icon":"lucide:badge-check","titleEn":"Evidence-based development","titleZh":"发展有据","detailEn":"Confirmed product information, brand materials and cooperation records document progress without filling gaps with fictional stories.","detailZh":"以已确认的产品资料、品牌素材和合作记录呈现发展过程，不用虚构故事填补空白。"},{"icon":"lucide:workflow","titleEn":"Information innovation","titleZh":"信息创新","detailEn":"Product information follows sourcing logic, while bilingual content improve communication efficiency.","detailZh":"以采购逻辑组织产品信息，并通过中英文内容同步提升沟通效率。"},{"icon":"lucide:route","titleEn":"A coherent experience","titleZh":"体验连贯","detailEn":"Visitors can identify the key information and a clear next step from brand discovery and product understanding through to enquiry.","detailZh":"让访客从认识品牌、理解产品到提出需求都能快速找到重点和清晰的下一步。"}],"paragraphsEn":["Hongcai Wanfu is positioned not as a trend-led retail label, but as a professional bathroom-products partner for wholesale, international trade and project procurement. Our mission is to organise fragmented product, material, installation and compatibility information more clearly, helping partners select, compare and move projects forward efficiently. Our core values are honesty, clarity, responsibility and long-term commitment.","A brand idea becomes recognisable through visible and tangible expressions. Our current identity uses brand red as its recognition signal, mineral black to convey professionalism and stability, and porcelain white to reflect the clean character of bathroom spaces. The website, product documents, packaging, displays and office environment will follow consistent Chinese and English names, colours and information hierarchy. Until authentic materials are available, fictional scenes will not be presented as formal brand evidence.","The development of the Hongcai Wanfu brand is progressing alongside the organisation of its product system and sourcing information. The first priority was to define the scope of bathroom products, bathroom hardware and installation accessories. The current stage establishes a consistent bilingual structure for copy, imagery, models, materials and applications. As authentic packaging, workplace materials, product documents and cooperation cases become available, verifiable brand records will continue to be added. Every update should be supported by real evidence.","Our distinction does not come from exaggerated promises, but from organising brand content through a sourcing perspective. Product scope, models, materials, finishes, installation methods and compatible components sit within one information framework, while the management console and bilingual content system keep that information maintainable. Clearly labelling the status of unconfirmed parameters and capability statements is part of our continuing effort to improve collaboration through transparency.","Brand culture ultimately lives in the cooperation experience. Whether visitors are exploring standard categories, comparing alternatives or advancing a specific project, clear navigation, readable content, authentic imagery and direct contact paths should help them identify the next step quickly. Through accurate responses, careful document confirmation and consistent follow-up, the brand becomes not only visible, but understood and trusted through cooperation."],"paragraphsZh":["红财万富的品牌定位，不是面向终端零售的潮流标签，而是服务批发、外贸与工程采购的专业卫浴合作品牌。我们的使命，是把分散的产品、材质、安装和配套信息整理得更清楚，让合作伙伴能够更高效地选品、比较和推进项目；核心价值则落实为真实、清晰、负责与长期。","品牌理念需要通过看得见、摸得着的载体被持续识别。现有品牌标志以品牌红作为识别信号，以矿物黑传达专业与稳定，以瓷白保持卫浴空间的洁净感。网站、产品资料、包装、展陈与办公环境将遵循统一的中英文名称、色彩和信息层级；在真实素材尚未完成前，不以虚构场景代替正式展示。","红财万富的品牌建设伴随产品体系和采购资料的整理逐步展开。早期重点是明确卫浴产品、卫浴五金与安装配件的范围；当前阶段进一步建立中英文内容、图片、型号、材质和应用信息的统一表达；未来将随着真实包装、办公环境、产品文件和合作案例的完善，持续补充可验证的品牌记录。每一步更新都应有真实资料作为依据。","我们的独特性不在夸张承诺，而在用采购视角组织品牌内容：把产品范围、型号、材质、表面处理、安装方式与配套关系放进同一套信息框架，并通过后台管理和中英文内容同步，让信息能够持续维护。对尚未确认的参数和能力说明明确标注状态，这种以透明度提升协作效率的方式，是我们持续优化的方向。","品牌文化最终要落到合作体验。无论访客是寻找常规品类、比较备选方案，还是推进具体项目，我们都希望清晰导航、易读内容、真实图片和明确联系入口帮助他们快速找到下一步。通过每一次准确回应、每一轮资料确认和每一个问题的持续跟进，让品牌不只被看见，更在合作中被理解与信任。"],"contentBlocks":[{"id":"culture-positioning","type":"text","altEn":"","altZh":"","image":"","bodyEn":"Hongcai Wanfu is positioned not as a trend-led retail label, but as a professional bathroom-products partner for wholesale, international trade and project procurement. Our mission is to organise fragmented product, material, installation and compatibility information more clearly, helping partners select, compare and move projects forward efficiently. Our core values are honesty, clarity, responsibility and long-term commitment.","bodyZh":"红财万富的品牌定位，不是面向终端零售的潮流标签，而是服务批发、外贸与工程采购的专业卫浴合作品牌。我们的使命，是把分散的产品、材质、安装和配套信息整理得更清楚，让合作伙伴能够更高效地选品、比较和推进项目；核心价值则落实为真实、清晰、负责与长期。","titleEn":"","titleZh":"","captionEn":"","captionZh":""},{"id":"culture-visual-language","type":"image","altEn":"Illustrative Hongcai Wanfu brand colours and bathroom materials","altZh":"红财万富品牌色彩与卫浴材质场景示意","image":"/assets/images/detail-materials.webp","bodyEn":"","bodyZh":"","titleEn":"","titleZh":"","captionEn":"","captionZh":""},{"id":"culture-material-carriers","type":"text","altEn":"","altZh":"","image":"","bodyEn":"A brand idea becomes recognisable through visible and tangible expressions. Our current identity uses brand red as its recognition signal, mineral black to convey professionalism and stability, and porcelain white to reflect the clean character of bathroom spaces. The website, product documents, packaging, displays and office environment will follow consistent Chinese and English names, colours and information hierarchy. Until authentic materials are available, fictional scenes will not be presented as formal brand evidence.","bodyZh":"品牌理念需要通过看得见、摸得着的载体被持续识别。现有品牌标志以品牌红作为识别信号，以矿物黑传达专业与稳定，以瓷白保持卫浴空间的洁净感。网站、产品资料、包装、展陈与办公环境将遵循统一的中英文名称、色彩和信息层级；在真实素材尚未完成前，不以虚构场景代替正式展示。","titleEn":"","titleZh":"","captionEn":"","captionZh":""},{"id":"culture-application","type":"image","altEn":"Illustrative bathroom product application and branded space","altZh":"卫浴产品应用与品牌空间场景示意","image":"/assets/images/hero-faucet-concept.webp","bodyEn":"","bodyZh":"","titleEn":"","titleZh":"","captionEn":"","captionZh":""},{"id":"culture-development","type":"text","altEn":"","altZh":"","image":"","bodyEn":"The development of the Hongcai Wanfu brand is progressing alongside the organisation of its product system and sourcing information. The first priority was to define the scope of bathroom products, bathroom hardware and installation accessories. The current stage establishes a consistent bilingual structure for copy, imagery, models, materials and applications. As authentic packaging, workplace materials, product documents and cooperation cases become available, verifiable brand records will continue to be added. Every update should be supported by real evidence.","bodyZh":"红财万富的品牌建设伴随产品体系和采购资料的整理逐步展开。早期重点是明确卫浴产品、卫浴五金与安装配件的范围；当前阶段进一步建立中英文内容、图片、型号、材质和应用信息的统一表达；未来将随着真实包装、办公环境、产品文件和合作案例的完善，持续补充可验证的品牌记录。每一步更新都应有真实资料作为依据。","titleEn":"","titleZh":"","captionEn":"","captionZh":""},{"id":"culture-innovation","type":"text","altEn":"","altZh":"","image":"","bodyEn":"Our distinction does not come from exaggerated promises, but from organising brand content through a sourcing perspective. Product scope, models, materials, finishes, installation methods and compatible components sit within one information framework, while bilingual content keeps that information maintainable. Clearly labelling the status of unconfirmed parameters and capability statements is part of our continuing effort to improve collaboration through transparency.","bodyZh":"我们的独特性不在夸张承诺，而在用采购视角组织品牌内容：把产品范围、型号、材质、表面处理、安装方式与配套关系放进同一套信息框架，并通过中英文内容同步，让信息能够持续维护。对尚未确认的参数和能力说明明确标注状态，这种以透明度提升协作效率的方式，是我们持续优化的方向。","titleEn":"","titleZh":"","captionEn":"","captionZh":""},{"id":"culture-experience","type":"text","altEn":"","altZh":"","image":"","bodyEn":"Brand culture ultimately lives in the cooperation experience. Whether visitors are exploring standard categories, comparing alternatives or advancing a specific project, clear navigation, readable content, authentic imagery and direct contact paths should help them identify the next step quickly. Through accurate responses, careful document confirmation and consistent follow-up, the brand becomes not only visible, but understood and trusted through cooperation.","bodyZh":"品牌文化最终要落到合作体验。无论访客是寻找常规品类、比较备选方案，还是推进具体项目，我们都希望清晰导航、易读内容、真实图片和明确联系入口帮助他们快速找到下一步。通过每一次准确回应、每一轮资料确认和每一个问题的持续跟进，让品牌不只被看见，更在合作中被理解与信任。","titleEn":"","titleZh":"","captionEn":"","captionZh":""}]},"companyProfile":{"image":"","gallery":[],"introEn":"Clear, reliable product information and cooperation support for better sourcing decisions across bathroom products, hardware and installation accessories.","introZh":"围绕卫浴产品、五金与安装配件，提供清晰、可信、便于采购决策的信息与合作支持。","titleEn":"Company profile","titleZh":"公司简介","highlights":[{"icon":"lucide:target","titleEn":"Positioning","titleZh":"品牌定位","detailEn":"A bathroom partner for wholesale, export and project procurement.","detailZh":"面向批发、外贸和工程采购的卫浴合作品牌。"},{"icon":"lucide:briefcase-business","titleEn":"Service scope","titleZh":"服务范围","detailEn":"Supporting wholesale, export, project sourcing and document coordination.","detailZh":"覆盖批发、外贸、工程采购及项目资料协同。"},{"to":"/products","icon":"lucide:layers-3","titleEn":"Product range","titleZh":"产品类别","detailEn":"Bathroom products, bathroom hardware and installation accessories.","detailZh":"卫浴产品、卫浴五金与安装配件。"},{"to":"/contact#inquiry","icon":"lucide:messages-square","titleEn":"Sourcing support","titleZh":"采购支持","detailEn":"From selection and samples to quotations and document follow-up.","detailZh":"从选型、样品到报价与资料跟进。"}],"imageAltEn":"Bathroom product scene","imageAltZh":"卫浴产品场景示意","paragraphsEn":["Hongcai Wanfu focuses on bathroom products, hardware and installation accessories for wholesale, export and project sourcing clients.","We organise the information buyers need to confirm first — product range, model, material, finish and application — so scattered product details are easier to browse, compare and discuss.","From sample confirmation and quotation to project follow-up, we want every cooperation conversation to start with clear information. Company scale, manufacturing capability and certifications will be added after formal confirmation."],"paragraphsZh":["红财万富专注于卫浴产品、卫浴五金与安装配件的供应，面向批发、外贸与工程采购客户，按照真实采购流程整理产品信息和合作入口。","我们从采购人员最常确认的产品范围、型号、材质、表面处理与应用方向出发，把分散的产品资料整理成更容易浏览、比较和沟通的内容。","从样品确认、报价沟通到项目资料跟进，我们希望让每一次合作都建立在清晰的信息基础上。公司规模、生产能力与认证信息将在取得正式资料后补充。"],"contentBlocks":[{"id":"profile-showroom","type":"image","altEn":"Bathroom setting and product display","altZh":"卫浴空间与产品陈列示意","image":"/uploads/about/company-profile-showroom.webp","bodyEn":"","bodyZh":"","titleEn":"","titleZh":"","captionEn":"","captionZh":""},{"id":"profile-positioning","type":"text","altEn":"","altZh":"","image":"","bodyEn":"Hongcai Wanfu focuses on the supply and sourcing coordination of bathroom products, bathroom hardware and installation accessories for wholesale, international trade and project procurement. Rather than relying on broad claims, we start with the questions buyers actually need answered: whether a product suits its application, whether its model and material are clear, and whether its finish, installation method and matching components can be confirmed efficiently.","bodyZh":"红财万富专注于卫浴产品、卫浴五金与安装配件的供应与采购协同，服务于批发、外贸及工程采购等合作场景。我们不把公司简介写成空泛的口号，而是从买家真正关心的问题出发：产品是否适配使用场景，型号与材质是否清楚，表面处理、安装方式和配套关系是否便于确认。","titleEn":"","titleZh":"","captionEn":"","captionZh":""},{"id":"profile-product-range","type":"text","altEn":"","altZh":"","image":"","bodyEn":"Across faucets, showers, basins, valves, hoses and installation accessories, we continuously organise the product range and its supporting information. For different markets, projects and sales channels, we first clarify application, dimensions, material, finish and configuration—moving product selection from “looks suitable” to information that can be compared and details that can be discussed.","bodyZh":"围绕龙头、花洒、面盆、阀件、软管与安装配件等品类，我们持续梳理产品范围和资料结构。面对不同市场、项目和渠道需求，我们会优先确认用途、尺寸、材质、表面效果和组合方式，让选品从“看起来合适”进一步走向“信息可以比较、细节可以沟通”。","titleEn":"","titleZh":"","captionEn":"","captionZh":""},{"id":"profile-details","type":"image","altEn":"Bathroom hardware and installation accessory details","altZh":"卫浴五金与安装配件细节","image":"/uploads/about/company-profile-details.webp","bodyEn":"","bodyZh":"","titleEn":"","titleZh":"","captionEn":"","captionZh":""},{"id":"profile-process","type":"text","altEn":"","altZh":"","image":"","bodyEn":"Sourcing often involves more than choosing a single product. Samples, quotations, lead times, packaging and project documents all need to be checked together. We organise these key stages step by step: first understanding the requirement, then providing product suggestions and information support based on what has been confirmed. Parameters, certifications or capability statements without formal evidence remain clearly marked as pending confirmation.","bodyZh":"一项采购往往不只是选择单个产品，还需要在样品、报价、交期、包装与项目资料之间反复核对。我们的工作方式是把这些关键节点逐步整理清楚：先理解需求，再围绕已确认的信息提供产品建议和资料支持；对尚未取得正式依据的参数、认证或能力说明，明确保留为待确认内容。","titleEn":"","titleZh":"","captionEn":"","captionZh":""},{"id":"profile-sourcing","type":"image","altEn":"Product selection and information organisation","altZh":"产品选型与资料整理","image":"/uploads/about/company-profile-sourcing.webp","bodyEn":"","bodyZh":"","titleEn":"","titleZh":"","captionEn":"","captionZh":""},{"id":"profile-follow-up","type":"text","altEn":"","altZh":"","image":"","bodyEn":"From the first enquiry through ongoing follow-up, we value accurate responses and consistent information. Whether the need is a standard alternative or a project-specific requirement at a particular stage, clear records, truthful explanations and continuous communication help reduce repeated checks and keep both sides focused on what matters.","bodyZh":"从首次咨询到后续跟进，我们重视回应的准确性和资料的一致性。无论是常规备选方案，还是具体项目的阶段性需求，都希望通过清晰的记录、真实的说明和持续的沟通，减少重复确认，让合作双方更快找到重点。","titleEn":"","titleZh":"","captionEn":"","captionZh":""},{"id":"profile-long-term","type":"text","altEn":"","altZh":"","image":"","bodyEn":"We believe long-term cooperation begins with an honest introduction and grows from details that stand up to verification. As verified company information, product documents and cooperation cases are organised, this website will continue to be updated to give sourcing partners a more complete and reliable way to understand us.","bodyZh":"我们相信，长期合作始于一次不夸大的介绍，也建立在每一项细节都经得起核对之上。随着真实企业资料、产品文件和合作案例完成整理，本网站也会持续补充和更新，为采购伙伴提供更完整、更可靠的了解入口。","titleEn":"","titleZh":"","captionEn":"","captionZh":""}]},"qualifications":{"items":[{"fileUrl":"","titleEn":"Cooperation documents","titleZh":"合作所需文件","detailEn":"Product- or project-specific documents can be provided during sourcing discussions when applicable.","detailZh":"涉及具体产品或项目的文件，可在采购沟通阶段按需提供。","statusLabelEn":"Pending verified material","statusLabelZh":"待补充真实资料"}],"introEn":"Only authentic, valid and verifiable company and product materials are presented.","introZh":"只呈现真实、有效、可核验的企业与产品资料。","titleEn":"Qualifications","titleZh":"荣誉资质","noticeEn":"This area is reserved for verified certificates and honours. No sample certificate or unconfirmed claim is used as a placeholder.","noticeZh":"本区域用于后续展示经核验的证书与荣誉。现阶段不使用示例证书，也不以未经确认的信息代替正式资质。"}}');

-- contact（1220 字符）
INSERT IGNORE INTO site_settings (`key`, `value`) VALUES ('contact', '{"inquiry":{"introEn":"Please share a few details so we can understand your sourcing needs.","introZh":"请填写以下信息，让我们更好地了解您的需求。","privacyEn":"Your information is kept securely and used only for business communication.","privacyZh":"我们会妥善保管您的信息，仅用于商务沟通。"},"channels":{"email":"123456789@qq.com","phone":"11111111111","social":"1111111111","emailNoteEn":"Product requests, project files and cooperation enquiries are welcome.","emailNoteZh":"欢迎发送产品需求、项目资料或合作咨询","phoneHoursEn":"Working hours: 8:00~19:00","phoneHoursZh":"工作时间：8:00~19:00","socialNoteEn":"Connect with us for ongoing communication.","socialNoteZh":"添加我们，随时沟通","serviceNoteEn":"Messages outside service hours will be handled in order.","serviceNoteZh":"非服务时间的留言将在工作时段依次处理","serviceHoursEn":"8:00~19:00","serviceHoursZh":"8:00~19:00"},"location":{"zoom":15,"noteEn":"Visits are welcome by appointment.","noteZh":"欢迎预约到访","mapLink":"","latitude":28.008235,"addressEn":"Guiren Duo Liquor Industry, Wenzhou City, Zhejiang Province","addressZh":"浙江省温州市贵人多酒业","longitude":120.645862,"mapEmbedUrl":"https://ditu.amap.com/ssr/place/B0G0J7HU51?id=B0G0J7HU51&name=%E8%B4%B5%E4%BA%BA%E5%A4%9A%E9%85%92%E4%B8%9A(%E7%8E%AF%E9%83%BD%E5%A4%A7%E5%8E%A6%E5%BA%97)&source=sug"}}');

-- home-products（17 字符）
INSERT IGNORE INTO site_settings (`key`, `value`) VALUES ('home-products', '{"productIds":[]}');

-- product-catalogue（189 字符）
INSERT IGNORE INTO site_settings (`key`, `value`) VALUES ('product-catalogue', '{"fileUrl":"","titleEn":"Product catalogue","titleZh":"产品电子图册","descriptionEn":"Upload the official product catalogue for direct download by buyers.","descriptionZh":"上传正式产品图册后，采购人员可直接下载。"}');

-- social-contact（547 字符）
INSERT IGNORE INTO site_settings (`key`, `value`) VALUES ('social-contact', '{"channels":[{"id":"wechat","icon":"simple-icons:wechat","nameEn":"WeChat","nameZh":"微信","enabled":true,"qrImage":""},{"id":"wecom","icon":"ri:wechat-2-fill","nameEn":"WeCom","nameZh":"企业微信","enabled":true,"qrImage":""},{"id":"whatsapp","icon":"simple-icons:whatsapp","nameEn":"WhatsApp","nameZh":"WhatsApp","enabled":true,"qrImage":""},{"id":"douyin","icon":"ri:tiktok-fill","nameEn":"Douyin","nameZh":"抖音","enabled":true,"qrImage":""},{"id":"tiktok","icon":"simple-icons:tiktok","nameEn":"TikTok","nameZh":"TikTok","enabled":true,"qrImage":""}]}');

COMMIT;
