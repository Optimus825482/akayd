#!/bin/sh
# PostgreSQL tabloları yoksa oluştur, seed yükle
# Backend container başlatıldığında bir kez çalışır

set -e

echo "=== DB init kontrol ediliyor ==="

# Tablo var mı kontrol et
TABLE_EXISTS=$(PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'services');" 2>/dev/null || echo "false")

if [ "$TABLE_EXISTS" = "t" ]; then
    echo ">>> Tablolar zaten mevcut, init atlanıyor."
    exit 0
fi

# Public schema yoksa oluştur
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "CREATE SCHEMA IF NOT EXISTS public;" 2>/dev/null || true

echo ">>> Schema yükleniyor..."
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f /app/docker/init/01-schema.sql 2>&1 || echo "Schema zaten yüklü olabilir"

echo ">>> Seed data yükleniyor..."
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f /app/docker/init/02-seed.sql 2>&1 | tail -20 || echo "Seed zaten yüklü olabilir"

# Sequence'leri en yüksek ID'ye resetle (yeni kayıtlar için)
echo ">>> Sequence'ler resetleniyor..."
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" <<'EOF' 2>&1 || true
SELECT setval('about_page_id_seq', COALESCE((SELECT MAX(id) FROM about_page), 1));
SELECT setval('blog_posts_id_seq', COALESCE((SELECT MAX(id) FROM blog_posts), 1));
SELECT setval('contact_page_id_seq', COALESCE((SELECT MAX(id) FROM contact_page), 1));
SELECT setval('hero_content_id_seq', COALESCE((SELECT MAX(id) FROM hero_content), 1));
SELECT setval('products_id_seq', COALESCE((SELECT MAX(id) FROM products), 1));
SELECT setval('services_id_seq', COALESCE((SELECT MAX(id) FROM services), 1));
SELECT setval('hazelnut_prices_id_seq', COALESCE((SELECT MAX(id) FROM hazelnut_prices), 1));
SELECT setval('seo_settings_id_seq', COALESCE((SELECT MAX(id) FROM seo_settings), 1));
SELECT setval('page_seo_id_seq', COALESCE((SELECT MAX(id) FROM page_seo), 1));
SELECT setval('contact_messages_id_seq', COALESCE((SELECT MAX(id) FROM contact_messages), 1));
EOF

echo "=== DB init tamamlandı ==="
