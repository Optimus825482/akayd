-- ============================================================
-- Akaydın Tarım — Docker PostgreSQL Init (Schema + Seed)
-- Bu dosya ilk container başlatıldığında otomatik çalışır
-- ============================================================

-- ========================
-- SCHEMA
-- ========================

CREATE TABLE IF NOT EXISTS about_page (
  id SERIAL PRIMARY KEY,
  mission TEXT NOT NULL DEFAULT '',
  vision TEXT NOT NULL DEFAULT '',
  title TEXT DEFAULT '',
  content TEXT DEFAULT '',
  images TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  summary TEXT DEFAULT '',  -- NOT NULL kaldırıldı, default ''
  content TEXT DEFAULT NULL,
  author VARCHAR(100) NOT NULL DEFAULT 'Akaydın Tarım',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  image_url VARCHAR(255) DEFAULT NULL,
  views INTEGER DEFAULT 0,
  excerpt TEXT DEFAULT NULL,
  seo_title VARCHAR(255) DEFAULT NULL,
  seo_description TEXT DEFAULT NULL,
  seo_keywords TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  subject VARCHAR(255) DEFAULT NULL,
  message TEXT NOT NULL,
  is_read SMALLINT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_page (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) DEFAULT 'Akaydın Tarım',
  address TEXT NOT NULL DEFAULT '',
  phone VARCHAR(50) NOT NULL DEFAULT '',
  whatsapp_phone VARCHAR(50) DEFAULT NULL,
  email VARCHAR(100) NOT NULL DEFAULT '',
  website VARCHAR(255) DEFAULT '',
  working_hours TEXT DEFAULT NULL,
  map_embed TEXT DEFAULT NULL,
  facebook_url VARCHAR(255) DEFAULT NULL,
  instagram_url VARCHAR(255) DEFAULT NULL,
  twitter_url VARCHAR(255) DEFAULT NULL,
  linkedin_url VARCHAR(255) DEFAULT NULL,
  youtube_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hazelnut_prices (
  id SERIAL PRIMARY KEY,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  daily_change NUMERIC(10,2) DEFAULT 0.00,
  change_percentage NUMERIC(5,2) DEFAULT 0.00,
  source VARCHAR(100) DEFAULT 'manual',
  scraped_price NUMERIC(10,2) DEFAULT NULL,
  last_scraped_at TIMESTAMP DEFAULT NULL,
  update_mode VARCHAR(20) DEFAULT 'manual',
  scraping_enabled SMALLINT DEFAULT 1,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hero_content (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255) DEFAULT '',
  description TEXT DEFAULT '',
  cta VARCHAR(100) DEFAULT 'Detaylı Bilgi',
  background_gradient VARCHAR(255) DEFAULT 'from-green-600 via-green-700 to-blue-800',
  background_image VARCHAR(255) DEFAULT NULL,
  is_active SMALLINT DEFAULT 1,
  order_index INTEGER DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS page_seo (
  id SERIAL PRIMARY KEY,
  page_path VARCHAR(255) NOT NULL UNIQUE,
  page_title VARCHAR(255) NOT NULL,
  meta_description TEXT DEFAULT NULL,
  meta_keywords TEXT DEFAULT NULL,
  og_title VARCHAR(255) DEFAULT NULL,
  og_description TEXT DEFAULT NULL,
  og_image VARCHAR(500) DEFAULT NULL,
  canonical_url VARCHAR(500) DEFAULT NULL,
  noindex SMALLINT DEFAULT 0,
  nofollow SMALLINT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  category VARCHAR(100) DEFAULT 'Genel',
  price NUMERIC(10,2) DEFAULT 0,
  image_url VARCHAR(500) DEFAULT NULL,
  images TEXT DEFAULT NULL,
  is_featured SMALLINT DEFAULT 0,
  seo_title VARCHAR(255) DEFAULT NULL,
  seo_description TEXT DEFAULT NULL,
  seo_keywords TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seo_settings (
  id SERIAL PRIMARY KEY,
  site_title VARCHAR(255) DEFAULT 'Akaydın Tarım - Fındık Üretimi ve Satışı',
  site_description TEXT DEFAULT '',
  site_keywords TEXT DEFAULT '',
  site_author VARCHAR(255) DEFAULT 'Akaydın Tarım',
  og_title VARCHAR(255) DEFAULT '',
  og_description TEXT DEFAULT '',
  og_image VARCHAR(500) DEFAULT '',
  og_url VARCHAR(500) DEFAULT '',
  twitter_card VARCHAR(50) DEFAULT 'summary_large_image',
  twitter_site VARCHAR(255) DEFAULT '',
  twitter_creator VARCHAR(255) DEFAULT '',
  canonical_url VARCHAR(500) DEFAULT '',
  robots_txt TEXT DEFAULT '',
  google_analytics_id VARCHAR(100) DEFAULT '',
  google_search_console VARCHAR(255) DEFAULT '',
  facebook_pixel_id VARCHAR(100) DEFAULT '',
  schema_organization TEXT DEFAULT '',
  sitemap_enabled SMALLINT DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  icon_name VARCHAR(100) DEFAULT 'leaf',
  image_url VARCHAR(500) DEFAULT NULL,
  seo_title VARCHAR(255) DEFAULT NULL,
  seo_description TEXT DEFAULT NULL,
  seo_keywords TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
