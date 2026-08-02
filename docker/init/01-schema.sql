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
  images JSONB DEFAULT '[]',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE,
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
  is_read BOOLEAN DEFAULT false,
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
  scraping_enabled BOOLEAN DEFAULT true,
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
  is_active BOOLEAN DEFAULT true,
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
  noindex BOOLEAN DEFAULT false,
  nofollow BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  category VARCHAR(100) DEFAULT 'Genel',
  price NUMERIC(10,2) DEFAULT 0,
  image_url VARCHAR(500) DEFAULT NULL,
  images JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT false,
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
  sitemap_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS serp_keywords (
  id SERIAL PRIMARY KEY,
  keyword VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  domain VARCHAR(255) DEFAULT 'akaydintarim.com.tr',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS serp_rankings (
  id SERIAL PRIMARY KEY,
  keyword VARCHAR(255) NOT NULL,
  keyword_id INTEGER REFERENCES serp_keywords(id) ON DELETE CASCADE, -- P2-3: keyword silinince history de silinir
  engine VARCHAR(20) NOT NULL CHECK (engine IN ('google', 'yandex', 'bing')),
  position INTEGER NOT NULL DEFAULT 0,
  url VARCHAR(500) DEFAULT NULL,
  domain VARCHAR(255) DEFAULT 'akaydintarim.com.tr',
  checked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- P0-7: Aynı (keyword, engine, domain, checked_at) çift kaydını engelle — cron+manuel+restart yarışında duplicate
CREATE UNIQUE INDEX IF NOT EXISTS uq_serp_rankings_dedup
  ON serp_rankings (keyword, engine, domain, checked_at);
CREATE INDEX IF NOT EXISTS idx_serp_checked_at ON serp_rankings(checked_at);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  icon_name VARCHAR(100) DEFAULT 'leaf',
  image_url VARCHAR(500) DEFAULT NULL,
  seo_title VARCHAR(255) DEFAULT NULL,
  seo_description TEXT DEFAULT NULL,
  seo_keywords TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- P0-8: updated_at trigger — her UPDATE'te zaman damgasını otomatik güncelle
-- (data/migrate_to_postgres.sql:208-232'den taşındı, o dosya ölüydü)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['about_page','blog_posts','contact_messages','contact_page','hazelnut_prices','hero_content','page_seo','products','seo_settings','serp_keywords','serp_rankings','services']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t);
  END LOOP;
END $$;
