USE hongcai_wanfu;

START TRANSACTION;

-- 新闻栏目固定为“公司新闻”和“行业资讯”。先清理其他栏目下的文章，
-- 再删除不再使用且未被产品或案例引用的旧新闻分类。
DELETE a
FROM articles a
INNER JOIN categories c ON c.id = a.category_id
WHERE c.name_zh NOT IN ('公司新闻', '行业资讯');

DELETE c
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
LEFT JOIN case_studies k ON k.category_id = c.id
LEFT JOIN articles a ON a.category_id = c.id
WHERE c.name_zh IN ('活动报道', '媒体报道')
  AND p.id IS NULL
  AND k.id IS NULL
  AND a.id IS NULL;

INSERT INTO categories (id, name_zh, name_en, slug, parent_id, sort_order, status)
SELECT 'news_category_company', '公司新闻', 'Company news', 'company-news', NULL, 100, 'PUBLISHED'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_zh = '公司新闻');

INSERT INTO categories (id, name_zh, name_en, slug, parent_id, sort_order, status)
SELECT 'news_category_industry', '行业资讯', 'Industry insights', 'industry-insights', NULL, 110, 'PUBLISHED'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_zh = '行业资讯');

SET @company_category_id = (SELECT id FROM categories WHERE name_zh = '公司新闻' ORDER BY created_at LIMIT 1);
SET @industry_category_id = (SELECT id FROM categories WHERE name_zh = '行业资讯' ORDER BY created_at LIMIT 1);

INSERT INTO articles (id, title_zh, title_en, slug, category_id, summary_zh, summary_en, content_zh, content_en, cover_image, published_at, status, sort_order)
VALUES
  (
    'news_sample_company_01',
    '新闻中心完成栏目优化',
    'News centre categories have been streamlined',
    'news-centre-category-update',
    @company_category_id,
    '新闻内容现按公司新闻与行业资讯两条线整理，帮助采购人员更快找到企业动态和选品知识。',
    'News content is now organised into company updates and industry insights, helping buyers find relevant information more quickly.',
    '红财万富网站新闻中心现保留“公司新闻”和“行业资讯”两个栏目。公司新闻用于记录产品资料、网站内容与服务信息的更新；行业资讯用于整理卫浴五金选品和采购沟通中的常见问题。\n\n栏目调整后，访问者可以更直接地区分企业动态与采购知识。后续发布的内容仍以已确认的信息为基础，不使用未经核验的客户、订单、认证或生产数据。',
    'The Hongcai Wanfu website news centre now contains two sections: Company News and Industry Insights. Company News covers updates to product information, website content and service information, while Industry Insights explains common topics in bathroom hardware selection and sourcing communication.\n\nThe simplified structure makes it easier to distinguish company updates from practical sourcing knowledge. Future articles will continue to rely on confirmed information and will not use unverified customer, order, certification or production data.',
    '/assets/images/hero-basin-concept.webp',
    '2026-10-04 09:00:00',
    'PUBLISHED',
    10
  ),
  (
    'news_sample_company_02',
    '产品资料按采购信息框架持续整理',
    'Product information is being organised for sourcing decisions',
    'product-information-framework',
    @company_category_id,
    '围绕品类、型号、材质、表面处理与图片等基础信息，逐步形成更便于选品和询价的资料结构。',
    'Product categories, models, materials, finishes and imagery are being organised into a clearer structure for selection and enquiries.',
    '面向批发、外贸与工程采购，产品资料需要先回答“是什么、适合什么需求、还需要确认什么”。网站正在围绕产品品类、型号、材质、表面处理、图片和采购说明等基础字段整理信息。\n\n对于尚未取得正式资料的内容，页面会保留待补充或待确认提示。具体规格、包装、交期与定制条件，应在选定产品后根据实际需求进一步确认。',
    'For wholesale, export and project sourcing, product information should first explain what the item is, which needs it may suit and what still needs confirmation. The website is organising information around product category, model, material, finish, imagery and sourcing notes.\n\nWhere official information is not yet available, the page keeps a pending or to-be-confirmed label. Specifications, packaging, lead time and customisation terms should be confirmed against the selected product and actual requirement.',
    '/assets/images/detail-materials.webp',
    '2026-09-18 09:00:00',
    'PUBLISHED',
    20
  ),
  (
    'news_sample_company_03',
    '网站内容更新聚焦采购沟通',
    'Website content update focuses on sourcing communication',
    'website-content-for-sourcing',
    @company_category_id,
    '从产品浏览到提交需求，页面内容围绕采购方向、数量、市场和项目要求组织，减少前期沟通遗漏。',
    'From browsing to enquiry, content is organised around product direction, quantity, market and project requirements.',
    '网站内容更新以采购过程为主线：先浏览产品范围，再按品类查看基础信息，最后提交采购方向、预计数量、目标市场或项目要求。\n\n这些字段用于帮助双方更快确定需要补充的资料。报价、样品、包装与交付安排仍需结合具体产品和实际需求确认，页面不会预设未经核实的承诺。',
    'The website update follows the sourcing process: browse the product range, review basic information by category, and then submit the product direction, estimated quantity, target market or project requirements.\n\nThese fields help both sides identify what information is still needed. Quotations, samples, packaging and delivery arrangements remain subject to the selected product and actual requirement, without unverified commitments on the website.',
    '/assets/images/hero-sanitaryware.webp',
    '2026-08-30 09:00:00',
    'PUBLISHED',
    30
  ),
  (
    'news_sample_industry_01',
    '卫浴五金询价前应准备哪些信息',
    'What to prepare before requesting a bathroom hardware quotation',
    'bathroom-hardware-enquiry-checklist',
    @industry_category_id,
    '产品类别、使用场景、数量、目标市场与时间要求，是提高询价沟通效率的基础信息。',
    'Product category, application, quantity, target market and schedule form the basis of an efficient quotation request.',
    '一份清晰的询价需求通常从产品类别和使用场景开始。例如，需要面盆龙头、花洒套装、厨房龙头，还是卫浴挂件与安装配件；用于批发备货、工程配套，还是其他采购方向。\n\n预计数量、目标市场、期望时间以及需要确认的材质、颜色、包装或标识，也应尽量一并说明。信息越完整，后续选品、资料补充与报价沟通越容易聚焦。具体可行性和交付条件仍应以实际确认结果为准。',
    'A clear enquiry usually starts with product category and application. Specify whether you need basin faucets, shower sets, kitchen faucets, bathroom accessories or installation parts, and whether the requirement is for wholesale stocking, a project or another sourcing route.\n\nEstimated quantity, target market, preferred schedule, material, colour, packaging and branding requirements should also be included where possible. More complete information keeps product selection, document preparation and quotation discussions focused. Feasibility and delivery terms remain subject to actual confirmation.',
    '/assets/images/hero-basin-concept.webp',
    '2026-09-26 09:00:00',
    'PUBLISHED',
    10
  ),
  (
    'news_sample_industry_02',
    '如何比较水龙头的材质与表面处理信息',
    'How to compare faucet material and finish information',
    'compare-faucet-material-and-finish',
    @industry_category_id,
    '比较产品时应区分主体材质、零部件材质与表面效果，并结合使用环境确认具体要求。',
    'Product comparison should distinguish body material, component materials and surface finish in relation to the intended environment.',
    '“材质”和“表面处理”是两个不同维度。采购人员可先确认产品主体与关键零部件的材质说明，再了解表面颜色、纹理和处理方式，避免只根据图片判断。\n\n不同使用环境对清洁、维护、配套颜色和耐用性的关注点并不相同。询价时建议列出需要确认的部位和效果，并索取对应型号的正式资料；检测或认证信息应以可核验文件为准。',
    'Material and surface finish are separate dimensions. Buyers can first confirm the stated materials for the product body and key components, then review colour, texture and finish instead of relying on imagery alone.\n\nCleaning, maintenance, colour coordination and durability priorities vary by environment. An enquiry should list the parts and finishes that need confirmation and request official information for the relevant model. Test and certification information should always be supported by verifiable documents.',
    '/assets/images/detail-materials.webp',
    '2026-08-26 09:00:00',
    'PUBLISHED',
    20
  ),
  (
    'news_sample_industry_03',
    '包装与交付沟通中的常见确认项',
    'Common checks for packaging and delivery discussions',
    'packaging-and-delivery-confirmation',
    @industry_category_id,
    '包装方式、标识要求、数量与运输安排应结合具体产品确认，避免沿用不适合当前采购的默认条件。',
    'Packaging, labelling, quantity and transport arrangements should be confirmed for the selected products instead of assumed.',
    '包装与交付条件通常会受到产品尺寸、组合方式、采购数量、运输路径和标识需求影响。即使是相近品类，也不宜直接套用同一套包装说明。\n\n沟通时可逐项确认单品与组合包装、外箱标识、随附资料、装运方式和期望时间。最终方案与时间应在产品和数量明确后确认，避免把示例信息当作正式承诺。',
    'Packaging and delivery terms can be affected by product size, bundle configuration, sourcing quantity, transport route and labelling requirements. Similar categories should not automatically be assigned the same packaging specification.\n\nDiscuss individual and bundled packaging, carton marks, accompanying documents, shipping method and preferred schedule item by item. The final arrangement and timing should be confirmed after products and quantities are clear, so example information is not mistaken for a commitment.',
    '/assets/images/hero-sanitaryware.webp',
    '2026-07-30 09:00:00',
    'PUBLISHED',
    30
  )
ON DUPLICATE KEY UPDATE
  title_zh = VALUES(title_zh),
  title_en = VALUES(title_en),
  category_id = VALUES(category_id),
  summary_zh = VALUES(summary_zh),
  summary_en = VALUES(summary_en),
  content_zh = VALUES(content_zh),
  content_en = VALUES(content_en),
  cover_image = VALUES(cover_image),
  published_at = VALUES(published_at),
  status = VALUES(status),
  sort_order = VALUES(sort_order);

COMMIT;
