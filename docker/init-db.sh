#!/bin/sh
# Akaydın Tarım — DB init script (İdempotent — mevcut veriyi korur)
# İlk deploy: tabloları oluşturur + seed yükler
# Sonraki deploylar: HİÇBİR ŞEYİ SİLMEZ — sadece eksik seed kayıtlarını ekler
# NOT: Manuel veri silinmesi için TRUNCATE yorumda bırakıldı, ihtiyaç halinde açılabilir.

set -e

echo "=== DB init başlıyor ==="

TABLE_EXISTS=$(PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'services');" 2>/dev/null || echo "false")

if [ "$TABLE_EXISTS" != "t" ]; then
    echo ">>> İlk kurulum — schema + seed yükleniyor..."
    PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f /app/docker/init/01-schema.sql 2>&1 | tail -3
    PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "\i /app/docker/init/02-seed.sql" 2>&1 | tail -10
    echo ">>> İlk kurulum tamamlandı."
else
    echo ">>> Tablolar mevcut — eksik şema nesneleri kontrol ediliyor..."
    PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f /app/docker/init/01-schema.sql 2>&1 | tail -20
    echo ">>> Migration (03) uygulanıyor — mevcut DB schema evrimi..."
    PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f /app/docker/init/03-migration.sql 2>&1 | tail -20 || echo ">>> Migration uygulandı (bazı ALTER'ler zaten mevcut olabilir)"
    echo ">>> Seed verisi kontrol ediliyor (veri silinmeden)..."
    # Eksik kayıtları INSERT ... ON CONFLICT DO NOTHING ile ekle
    PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "\i /app/docker/init/02-seed.sql" 2>&1 | tail -10 || echo ">>> Seed kontrolü yapıldı (bazı kayıtlar zaten mevcut olabilir)"
fi

# Sequence'leri güncelle
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" <<'EOF' 2>&1 | tail -5
SELECT setval('about_page_id_seq', COALESCE((SELECT MAX(id) FROM about_page), 1));
SELECT setval('blog_posts_id_seq', COALESCE((SELECT MAX(id) FROM blog_posts), 1));
SELECT setval('contact_page_id_seq', COALESCE((SELECT MAX(id) FROM contact_page), 1));
SELECT setval('hero_content_id_seq', COALESCE((SELECT MAX(id) FROM hero_content), 1));
SELECT setval('products_id_seq', COALESCE((SELECT MAX(id) FROM products), 1));
SELECT setval('services_id_seq', COALESCE((SELECT MAX(id) FROM services), 1));
SELECT setval('seo_settings_id_seq', COALESCE((SELECT MAX(id) FROM seo_settings), 1));
SELECT setval('page_seo_id_seq', COALESCE((SELECT MAX(id) FROM page_seo), 1));
SELECT setval('contact_messages_id_seq', COALESCE((SELECT MAX(id) FROM contact_messages), 1));
SELECT setval('serp_keywords_id_seq', COALESCE((SELECT MAX(id) FROM serp_keywords), 1));
SELECT setval('serp_rankings_id_seq', COALESCE((SELECT MAX(id) FROM serp_rankings), 1));
EOF

echo "=== DB init tamamlandı ==="
