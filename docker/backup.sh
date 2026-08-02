#!/bin/sh
# ============================================
# Akaydın Tarım — Yedekleme Scripti (host cron)
# DB (pg_dump) + uploads (tar) → /data/akaydin/backups
# Cron örneği: 0 3 * * * /data/akaydin/backup.sh  (günde 3:00)
# Saklama: son 14 günlük tutulur
# ============================================
set -e

BACKUP_DIR="${BACKUP_DIR:-/data/akaydin/backups}"
DB_CONTAINER="${DB_CONTAINER:-akaydin-postgres}"
UPLOADS_DIR="${UPLOADS_DIR:-/data/akaydin/uploads}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"

echo ">>> DB yedeği alınıyor: $BACKUP_DIR/db-$STAMP.sql.gz"
docker exec "$DB_CONTAINER" pg_dump -U postgres akaydin_tarim | gzip > "$BACKUP_DIR/db-$STAMP.sql.gz"

echo ">>> Uploads yedeği alınıyor: $BACKUP_DIR/uploads-$STAMP.tar.gz"
tar -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C "$(dirname "$UPLOADS_DIR")" "$(basename "$UPLOADS_DIR")"

echo ">>> Eski yedekler temizleniyor (son ${RETENTION_DAYS} gün)"
find "$BACKUP_DIR" -name '*.gz' -mtime "+${RETENTION_DAYS}" -delete

echo ">>> Yedekleme tamamlandı: $STAMP"
