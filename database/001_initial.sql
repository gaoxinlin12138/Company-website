CREATE DATABASE IF NOT EXISTS hongcai_wanfu
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hongcai_wanfu;

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(32) NOT NULL PRIMARY KEY,
  name_zh VARCHAR(160) NOT NULL,
  name_en VARCHAR(160) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  parent_id VARCHAR(32) NULL,
  cover_image VARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_categories_parent_sort (parent_id, sort_order),
  INDEX idx_categories_status_sort (status, sort_order),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(32) NOT NULL PRIMARY KEY,
  name_zh VARCHAR(200) NOT NULL,
  name_en VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  category_id VARCHAR(32) NOT NULL,
  model VARCHAR(120) NOT NULL,
  material_zh VARCHAR(120) NOT NULL,
  material_en VARCHAR(120) NOT NULL,
  finish_zh VARCHAR(120) NOT NULL,
  finish_en VARCHAR(120) NOT NULL,
  summary_zh TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  cover_image VARCHAR(500) NOT NULL,
  gallery JSON NULL,
  status ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_products_category_status_sort (category_id, status, sort_order),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS articles (
  id VARCHAR(32) NOT NULL PRIMARY KEY,
  title_zh VARCHAR(240) NOT NULL,
  title_en VARCHAR(240) NOT NULL,
  slug VARCHAR(240) NOT NULL UNIQUE,
  category_id VARCHAR(32) NOT NULL,
  summary_zh TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  content_zh LONGTEXT NOT NULL,
  content_en LONGTEXT NOT NULL,
  cover_image VARCHAR(500) NOT NULL,
  published_at DATETIME(3) NULL,
  status ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_articles_category_status_date (category_id, status, published_at),
  CONSTRAINT fk_articles_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS case_studies (
  id VARCHAR(32) NOT NULL PRIMARY KEY,
  title_zh VARCHAR(240) NOT NULL,
  title_en VARCHAR(240) NOT NULL,
  slug VARCHAR(240) NOT NULL UNIQUE,
  category_id VARCHAR(32) NOT NULL,
  summary_zh TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  content_zh LONGTEXT NOT NULL,
  content_en LONGTEXT NOT NULL,
  project_type_zh VARCHAR(160) NOT NULL,
  project_type_en VARCHAR(160) NOT NULL,
  location_zh VARCHAR(160) NOT NULL,
  location_en VARCHAR(160) NOT NULL,
  supplied_products_zh TEXT NOT NULL,
  supplied_products_en TEXT NOT NULL,
  cover_image VARCHAR(500) NOT NULL,
  gallery JSON NULL,
  published_at DATETIME(3) NULL,
  status ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_cases_category_status_sort (category_id, status, sort_order),
  CONSTRAINT fk_cases_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS home_hero_slides (
  id VARCHAR(32) NOT NULL PRIMARY KEY,
  category_zh VARCHAR(240) NOT NULL,
  category_en VARCHAR(240) NOT NULL,
  title_lead_zh TEXT NOT NULL,
  title_lead_en TEXT NOT NULL,
  title_emphasis_zh VARCHAR(240) NOT NULL,
  title_emphasis_en VARCHAR(240) NOT NULL,
  summary_zh TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  image VARCHAR(500) NOT NULL,
  primary_label_zh VARCHAR(160) NOT NULL,
  primary_label_en VARCHAR(160) NOT NULL,
  primary_to VARCHAR(500) NOT NULL,
  secondary_label_zh VARCHAR(160) NOT NULL,
  secondary_label_en VARCHAR(160) NOT NULL,
  meta JSON NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_home_hero_status_sort (status, sort_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS media_assets (
  id VARCHAR(32) NOT NULL PRIMARY KEY,
  url VARCHAR(500) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  alt_zh VARCHAR(240) NOT NULL,
  alt_en VARCHAR(240) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  size_bytes INT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inquiries (
  id VARCHAR(32) NOT NULL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  company VARCHAR(120) NOT NULL DEFAULT '',
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(60) NULL,
  interest VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  source VARCHAR(80) NOT NULL DEFAULT 'website',
  status ENUM('NEW','PROCESSING','CLOSED') NOT NULL DEFAULT 'NEW',
  internal_note TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_inquiries_status_created (status, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS site_settings (
  `key` VARCHAR(120) NOT NULL PRIMARY KEY,
  `value` JSON NOT NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(32) NOT NULL PRIMARY KEY,
  username VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'admin',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;
