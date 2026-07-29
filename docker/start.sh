#!/bin/sh
set -e

PGDATA=/app/data
PGLOG=/app/data/pg.log

echo "=== Akaydın Tarım Container Başlatılıyor ==="

# ---- PostgreSQL başlat ----
if [ ! -f "$PGDATA/PG_VERSION" ]; then
    echo ">>> PostgreSQL ilk kez başlatılıyor, initdb yapılıyor..."
    initdb -D "$PGDATA" --auth=trust --username="${DB_USER:-postgres}" --encoding=UTF8 --locale=tr_TR.UTF-8 2>/dev/null || \
    initdb -D "$PGDATA" --auth=trust --username="${DB_USER:-postgres}" --encoding=UTF8

    # pg_hba.conf: local trust
    echo "host all all 127.0.0.1/32 trust" >> "$PGDATA/pg_hba.conf"
    echo "host all all ::1/128 trust"      >> "$PGDATA/pg_hba.conf"
    echo "host all all 0.0.0.0/0 md5"      >> "$PGDATA/pg_hba.conf"

    pg_ctl -D "$PGDATA" -l "$PGLOG" start

    # Veritabanı ve kullanıcı oluştur
    DB_USER="${DB_USER:-postgres}"
    DB_NAME="${DB_NAME:-akaydin_tarim}"
    DB_PASS="${DB_PASSWORD:-change_me}"

    if [ "$DB_USER" != "postgres" ]; then
        psql -U postgres -c "CREATE USER \"$DB_USER\" WITH PASSWORD '$DB_PASS';" 2>/dev/null || true
        psql -U postgres -c "ALTER USER \"$DB_USER\" WITH SUPERUSER;" 2>/dev/null || true
    else
        psql -U postgres -c "ALTER USER postgres WITH PASSWORD '$DB_PASS';" 2>/dev/null || true
    fi
    psql -U postgres -c "CREATE DATABASE \"$DB_NAME\" OWNER \"$DB_USER\";" 2>/dev/null || true

    # ---- Seed data ----
    echo ">>> Seed data yükleniyor..."
    if [ -f /app/docker/init/01-schema.sql ]; then
        psql -U "$DB_USER" -d "$DB_NAME" -f /app/docker/init/01-schema.sql 2>/dev/null || true
    fi
    if [ -f /app/docker/init/02-seed.sql ]; then
        psql -U "$DB_USER" -d "$DB_NAME" -f /app/docker/init/02-seed.sql 2>/dev/null || true
    fi

    pg_ctl -D "$PGDATA" -l "$PGLOG" stop -m fast
    echo ">>> PostgreSQL init tamamlandı."
fi

# ---- PostgreSQL başlat ----
echo ">>> PostgreSQL başlatılıyor..."
pg_ctl -D "$PGDATA" -l "$PGLOG" -o "-c listen_addresses='127.0.0.1'" start

until pg_isready -q 2>/dev/null; do
    echo ">>> PostgreSQL bekleniyor..."
    sleep 1
done
echo ">>> PostgreSQL hazır."

# ---- Express başlat ----
echo ">>> Akaydın Tarım Express başlatılıyor (port 3003)..."
exec node server/index.js
