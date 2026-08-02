-- ============================================================
-- Akaydın Tarım — Mevcut DB Migration (03)
-- 01-schema.sql CREATE TABLE IF NOT EXISTS eski DB'yi DEĞİŞTİRMEZ.
-- Bu dosya mevcut kurulumlar için schema evrimini uygular.
-- init-db.sh bunu her deploy'da koşar (idempotent).
-- ============================================================

-- P2-1: SMALLINT → BOOLEAN (Postgres'te smallint::boolean cast YOK — `<> 0` kullan)
ALTER TABLE contact_messages ALTER COLUMN is_read TYPE BOOLEAN USING (is_read <> 0);
ALTER TABLE hero_content ALTER COLUMN is_active TYPE BOOLEAN USING (is_active <> 0);
ALTER TABLE page_seo ALTER COLUMN noindex TYPE BOOLEAN USING (noindex <> 0);
ALTER TABLE page_seo ALTER COLUMN nofollow TYPE BOOLEAN USING (nofollow <> 0);
ALTER TABLE products ALTER COLUMN is_featured TYPE BOOLEAN USING (is_featured <> 0);
ALTER TABLE seo_settings ALTER COLUMN sitemap_enabled TYPE BOOLEAN USING (sitemap_enabled <> 0);
ALTER TABLE hazelnut_prices ALTER COLUMN scraping_enabled TYPE BOOLEAN USING (scraping_enabled <> 0);

-- P2-2: images TEXT → JSONB — ÖNCE bozuk/boş satırları temizle, SONRA cast (cast bozuk JSON'da patlar)
UPDATE about_page SET images = '[]' WHERE images IS NULL OR btrim(COALESCE(images, '')) = '' OR images NOT SIMILAR TO '\[.*\]';
UPDATE products SET images = '[]' WHERE images IS NULL OR btrim(COALESCE(images, '')) = '' OR images NOT SIMILAR TO '\[.*\]';
ALTER TABLE about_page ALTER COLUMN images TYPE JSONB USING images::jsonb;
ALTER TABLE products ALTER COLUMN images TYPE JSONB USING images::jsonb;

-- P2-3: serp_rankings.keyword_id FK + mevcut keyword'leri eşle
ALTER TABLE serp_rankings ADD COLUMN IF NOT EXISTS keyword_id INTEGER REFERENCES serp_keywords(id) ON DELETE CASCADE;
UPDATE serp_rankings r SET keyword_id = k.id
  FROM serp_keywords k WHERE r.keyword = k.keyword AND r.keyword_id IS NULL;

-- P2-4: doğal anahtarlara UNIQUE (mevcut duplicate varsa tekrar etmez, hata loglanır)
CREATE UNIQUE INDEX IF NOT EXISTS uq_blog_posts_title ON blog_posts (title);
CREATE UNIQUE INDEX IF NOT EXISTS uq_products_name ON products (name);
CREATE UNIQUE INDEX IF NOT EXISTS uq_services_title ON services (title);

-- P0-8: updated_at trigger (schema'daki fonksiyonla aynı, idempotent)
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
  -- serp_rankings ve serp_keywords'ta updated_at kolonu YOK — trigger eklenmez (NEW.updated_at hatası)
  FOREACH t IN ARRAY ARRAY['about_page','blog_posts','contact_messages','contact_page','hazelnut_prices','hero_content','page_seo','products','seo_settings','services']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t);
  END LOOP;
END $$;

-- P0-7: serp_rankings dedup (mevcut duplicate'lerde ilki tut, sonra index)
DELETE FROM serp_rankings a USING serp_rankings b
  WHERE a.id > b.id
    AND a.keyword = b.keyword AND a.engine = b.engine
    AND a.domain = b.domain AND a.checked_at = b.checked_at;
CREATE UNIQUE INDEX IF NOT EXISTS uq_serp_rankings_dedup
  ON serp_rankings (keyword, engine, domain, checked_at);
