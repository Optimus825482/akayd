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
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f /app/docker/init/02-seed.sql 2>&1 || echo "Seed zaten yüklü olabilir"

echo "=== DB init tamamlandı ==="
