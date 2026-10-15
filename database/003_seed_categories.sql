-- 分类数据（产品分类 / 新闻分类 / 案例分类）
--
-- 背景：001_initial.sql 只建表、不含数据，新部署的库 categories 为空，
-- 会导致后台新增产品的「产品分类」下拉没有选项、产品无法保存。
--
-- 用法：在宝塔面板先把数据库切到 hongcai_wanfu，再导入本文件。
-- 可重复导入：已存在同 id 或同 slug 的分类会被更新，不会产生重复。
--
-- 共 17 条（顶层 8，子分类 9）

START TRANSACTION;

-- 顶层：公司新闻 / Company news
INSERT INTO categories (id, name_zh, name_en, slug, parent_id, cover_image, sort_order, status)
VALUES ('1e9e8c9e16a9eeadc0ca3ec69c73aafd', '公司新闻', 'Company news', '5866659ed5cac6db7b8a41bd879f110c', NULL, NULL, 0, 'PUBLISHED')
ON DUPLICATE KEY UPDATE
  name_zh = VALUES(name_zh), name_en = VALUES(name_en),
  parent_id = VALUES(parent_id), sort_order = VALUES(sort_order), status = VALUES(status);

-- 顶层：卫浴五金 / Bathroom hardware
INSERT INTO categories (id, name_zh, name_en, slug, parent_id, cover_image, sort_order, status)
VALUES ('3ce2ba8fc641408f2002e5c88e2ec2f5', '卫浴五金', 'Bathroom hardware', 'bathroom-hardware', NULL, NULL, 0, 'PUBLISHED')
ON DUPLICATE KEY UPDATE
  name_zh = VALUES(name_zh), name_en = VALUES(name_en),
  parent_id = VALUES(parent_id), sort_order = VALUES(sort_order), status = VALUES(status);

-- 顶层：卫浴产品 / Sanitaryware
INSERT INTO categories (id, name_zh, name_en, slug, parent_id, cover_image, sort_order, status)
VALUES ('c96cd9256ec3773672475f17821b31ea', '卫浴产品', 'Sanitaryware', 'sanitaryware', NULL, NULL, 0, 'PUBLISHED')
ON DUPLICATE KEY UPDATE
  name_zh = VALUES(name_zh), name_en = VALUES(name_en),
  parent_id = VALUES(parent_id), sort_order = VALUES(sort_order), status = VALUES(status);

-- 顶层：安装及配件 / Installation parts
INSERT INTO categories (id, name_zh, name_en, slug, parent_id, cover_image, sort_order, status)
VALUES ('c1e1bf5c4507d3c675a9cf09894d00f9', '安装及配件', 'Installation parts', 'installation-parts', NULL, NULL, 0, 'PUBLISHED')
ON DUPLICATE KEY UPDATE
  name_zh = VALUES(name_zh), name_en = VALUES(name_en),
  parent_id = VALUES(parent_id), sort_order = VALUES(sort_order), status = VALUES(status);

-- 顶层：客户案例 / Customer cases
INSERT INTO categories (id, name_zh, name_en, slug, parent_id, cover_image, sort_order, status)
VALUES ('9393a468dafc9cf156b072b8255f0738', '客户案例', 'Customer cases', 'f8d65e205fbd10f4c47a84ffef008465', NULL, NULL, 0, 'PUBLISHED')
ON DUPLICATE KEY UPDATE
  name_zh = VALUES(name_zh), name_en = VALUES(name_en),
  parent_id = VALUES(parent_id), sort_order = VALUES(sort_order), status = VALUES(status);

-- 顶层：落地效果 / Delivered results
INSERT INTO categories (id, name_zh, name_en, slug, parent_id, cover_image, sort_order, status)
VALUES ('50422534b2360fa35c8e02bca6aeef44', '落地效果', 'Delivered results', '98179554f54fef0bb88230169d881fa0', NULL, NULL, 0, 'PUBLISHED')
ON DUPLICATE KEY UPDATE
  name_zh = VALUES(name_zh), name_en = VALUES(name_en),
  parent_id = VALUES(parent_id), sort_order = VALUES(sort_order), status = VALUES(status);

-- 顶层：行业资讯 / Industry insights
INSERT INTO categories (id, name_zh, name_en, slug, parent_id, cover_image, sort_order, status)
VALUES ('41df98c1f757213fe767948ab9f6add5', '行业资讯', 'Industry insights', '1a26d2d6697f94285c30fdcf5d53bf75', NULL, NULL, 0, 'PUBLISHED')
ON DUPLICATE KEY UPDATE
  name_zh = VALUES(name_zh), name_en = VALUES(name_en),
  parent_id = VALUES(parent_id), sort_order = VALUES(sort_order), status = VALUES(status);

-- 顶层：项目案例 / Project cases
INSERT INTO categories (id, name_zh, name_en, slug, parent_id, cover_image, sort_order, status)
VALUES ('6e55411a461352bbe2a5baff855c770d', '项目案例', 'Project cases', '8a5a5b078699e929efadb98834d9b694', NULL, NULL, 0, 'PUBLISHED')
ON DUPLICATE KEY UPDATE
  name_zh = VALUES(name_zh), name_en = VALUES(name_en),
  parent_id = VALUES(parent_id), sort_order = VALUES(sort_order), status = VALUES(status);

-- 子分类：卫浴挂件 / Bathroom accessories
INSERT INTO categories (id, name_zh, name_en, slug, parent_id, cover_image, sort_order, status)
VALUES ('36065cc90c8238aeeabdbceb73089431', '卫浴挂件', 'Bathroom accessories', 'bathroom-accessories', '3ce2ba8fc641408f2002e5c88e2ec2f5', NULL, 0, 'PUBLISHED')
ON DUPLICATE KEY UPDATE
  name_zh = VALUES(name_zh), name_en = VALUES(name_en),
  parent_id = VALUES(parent_id), sort_order = VALUES(sort_order), status = VALUES(status);

-- 子分类：厨房龙头 / Kitchen faucets
INSERT INTO categories (id, name_zh, name_en, slug, parent_id, cover_image, sort_order, status)
VALUES ('0b6b57431f4bb44e4ca3e904dfd56323', '厨房龙头', 'Kitchen faucets', 'kitchen-faucets', 'c96cd9256ec3773672475f17821b31ea', NULL, 0, 'PUBLISHED')
ON DUPLICATE KEY UPDATE
  name_zh = VALUES(name_zh), name_en = VALUES(name_en),
  parent_id = VALUES(parent_id), sort_order = VALUES(sort_order), status = VALUES(status);

-- 子分类：坐便器 / Toilets
INSERT INTO categories (id, name_zh, name_en, slug, parent_id, cover_image, sort_order, status)
VALUES ('09e73eec33e9ce0726043d7da3a89d3b', '坐便器', 'Toilets', 'toilets', 'c96cd9256ec3773672475f17821b31ea', NULL, 0, 'PUBLISHED')
ON DUPLICATE KEY UPDATE
  name_zh = VALUES(name_zh), name_en = VALUES(name_en),
  parent_id = VALUES(parent_id), sort_order = VALUES(sort_order), status = VALUES(status);

-- 子分类：安装配件 / Installation accessories
INSERT INTO categories (id, name_zh, name_en, slug, parent_id, cover_image, sort_order, status)
VALUES ('1cd2b4a534b00d9b9ea4c468b9d2aff8', '安装配件', 'Installation accessories', 'installation-accessories', 'c1e1bf5c4507d3c675a9cf09894d00f9', NULL, 0, 'PUBLISHED')
ON DUPLICATE KEY UPDATE
  name_zh = VALUES(name_zh), name_en = VALUES(name_en),
  parent_id = VALUES(parent_id), sort_order = VALUES(sort_order), status = VALUES(status);

-- 子分类：排水配件 / Drainage parts
INSERT INTO categories (id, name_zh, name_en, slug, parent_id, cover_image, sort_order, status)
VALUES ('d0e5900275902743efd1273e623b87f7', '排水配件', 'Drainage parts', 'drainage-parts', 'c1e1bf5c4507d3c675a9cf09894d00f9', NULL, 0, 'PUBLISHED')
ON DUPLICATE KEY UPDATE
  name_zh = VALUES(name_zh), name_en = VALUES(name_en),
  parent_id = VALUES(parent_id), sort_order = VALUES(sort_order), status = VALUES(status);

-- 子分类：浴室柜 / Bathroom cabinets
INSERT INTO categories (id, name_zh, name_en, slug, parent_id, cover_image, sort_order, status)
VALUES ('d82638cc63fa8307d77e753b73119634', '浴室柜', 'Bathroom cabinets', 'bathroom-cabinets', 'c96cd9256ec3773672475f17821b31ea', NULL, 0, 'PUBLISHED')
ON DUPLICATE KEY UPDATE
  name_zh = VALUES(name_zh), name_en = VALUES(name_en),
  parent_id = VALUES(parent_id), sort_order = VALUES(sort_order), status = VALUES(status);

-- 子分类：花洒套装 / Shower sets
INSERT INTO categories (id, name_zh, name_en, slug, parent_id, cover_image, sort_order, status)
VALUES ('8081fe88220088884ebef253c489bff6', '花洒套装', 'Shower sets', 'shower-sets', 'c96cd9256ec3773672475f17821b31ea', NULL, 0, 'PUBLISHED')
ON DUPLICATE KEY UPDATE
  name_zh = VALUES(name_zh), name_en = VALUES(name_en),
  parent_id = VALUES(parent_id), sort_order = VALUES(sort_order), status = VALUES(status);

-- 子分类：阀门配件 / Valve parts
INSERT INTO categories (id, name_zh, name_en, slug, parent_id, cover_image, sort_order, status)
VALUES ('d0df2b600d0d43eaf38d414da9ee3769', '阀门配件', 'Valve parts', 'valve-parts', '3ce2ba8fc641408f2002e5c88e2ec2f5', NULL, 0, 'PUBLISHED')
ON DUPLICATE KEY UPDATE
  name_zh = VALUES(name_zh), name_en = VALUES(name_en),
  parent_id = VALUES(parent_id), sort_order = VALUES(sort_order), status = VALUES(status);

-- 子分类：面盆龙头 / Basin faucets
INSERT INTO categories (id, name_zh, name_en, slug, parent_id, cover_image, sort_order, status)
VALUES ('8d42346e2b3fa0be6ed60c83d6eafb2b', '面盆龙头', 'Basin faucets', 'basin-faucets', 'c96cd9256ec3773672475f17821b31ea', NULL, 0, 'PUBLISHED')
ON DUPLICATE KEY UPDATE
  name_zh = VALUES(name_zh), name_en = VALUES(name_en),
  parent_id = VALUES(parent_id), sort_order = VALUES(sort_order), status = VALUES(status);

COMMIT;
