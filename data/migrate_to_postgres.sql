-- ============================================
-- Akaydın Tarım - PostgreSQL Migration Script
-- MySQL/MariaDB dump'ından dönüştürülmüştür
-- Kullanım: psql -U kullanici -d akaydin_tarim -f migrate_to_postgres.sql
-- ============================================

-- About Page
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

-- Active Visitors (Analytics - opsiyonel)
CREATE TABLE IF NOT EXISTS active_visitors (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  visitor_fingerprint VARCHAR(32) DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  device_type VARCHAR(20) DEFAULT 'desktop' CHECK (device_type IN ('desktop','mobile','tablet')),
  browser VARCHAR(100) DEFAULT NULL,
  operating_system VARCHAR(100) DEFAULT NULL,
  country VARCHAR(100) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  is_new_visitor BOOLEAN DEFAULT TRUE,
  is_return_visitor BOOLEAN DEFAULT FALSE,
  first_visit_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_activity_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  current_page VARCHAR(500) DEFAULT '/',
  current_page_title VARCHAR(200) DEFAULT NULL,
  previous_page VARCHAR(500) DEFAULT NULL,
  entry_page VARCHAR(500) DEFAULT NULL,
  session_start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  session_duration INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 1,
  total_time_on_site INTEGER DEFAULT 0,
  referrer VARCHAR(500) DEFAULT NULL,
  utm_source VARCHAR(100) DEFAULT NULL,
  utm_medium VARCHAR(100) DEFAULT NULL,
  utm_campaign VARCHAR(100) DEFAULT NULL,
  heartbeat_count INTEGER DEFAULT 0,
  last_heartbeat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_active_visitors_session_id ON active_visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_active_visitors_last_activity ON active_visitors(last_activity_time);
CREATE INDEX IF NOT EXISTS idx_active_visitors_is_active ON active_visitors(is_active);

-- Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
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

-- Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  subject VARCHAR(255) DEFAULT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Contact Page
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

-- Hazelnut Prices
CREATE TABLE IF NOT EXISTS hazelnut_prices (
  id SERIAL PRIMARY KEY,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  daily_change NUMERIC(10,2) DEFAULT 0.00,
  change_percentage NUMERIC(5,2) DEFAULT 0.00,
  source VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual','scraped')),
  scraped_price NUMERIC(10,2) DEFAULT NULL,
  last_scraped_at TIMESTAMP DEFAULT NULL,
  update_mode VARCHAR(20) DEFAULT 'manual' CHECK (update_mode IN ('manual','automatic')),
  scraping_enabled BOOLEAN DEFAULT TRUE,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Hero Content
CREATE TABLE IF NOT EXISTS hero_content (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255) NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  cta VARCHAR(100) NOT NULL DEFAULT 'Detaylı Bilgi',
  background_gradient VARCHAR(255) NOT NULL DEFAULT 'from-green-600 via-green-700 to-blue-800',
  background_image VARCHAR(255) DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Page SEO
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
  noindex BOOLEAN DEFAULT FALSE,
  nofollow BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  category VARCHAR(100) DEFAULT 'Genel',
  image_url VARCHAR(500) DEFAULT NULL,
  images TEXT DEFAULT NULL,
  price NUMERIC(10,2) DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- SEO Settings
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
  sitemap_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  icon_name VARCHAR(100) DEFAULT 'Consulting',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at' AND table_schema = 'public'
        AND table_name IN ('about_page','active_visitors','blog_posts','contact_messages',
                           'contact_page','hazelnut_prices','hero_content',
                           'page_seo','products','seo_settings','services')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I', t, t);
        EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END;
$$;
