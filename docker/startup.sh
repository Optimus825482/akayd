#!/bin/sh
set -e

# ============================================
# Akaydın Tarım — Container Startup Script
# - Bind mount izinlerini root olarak düzeltir
# - Ardından tüm işlemleri node kullanıcısıyla çalıştırır
# ============================================

# Bind mount ile gelen /app/uploads dizinine yazma izni ver
# Host'ta chown yapılsa bile garanti olsun diye container içinde de tekrarlanır
mkdir -p /app/uploads
chown -R 1000:1000 /app/uploads 2>/dev/null || true
chmod 755 /app/uploads 2>/dev/null || true

# Public dizini (sitemap artık bellekten serve ediliyor ama robots.txt için gerekebilir)
mkdir -p /app/public
chown -R 1000:1000 /app/public 2>/dev/null || true
chmod 755 /app/public 2>/dev/null || true

echo ">>> Container başlatılıyor — uploads izinleri düzeltildi"
echo ">>> DB init başlatılıyor (node kullanıcısı ile)..."

# DB init + Express'i node kullanıcısı olarak başlat
exec su node -c "/usr/local/bin/init-db.sh && cd /app && node server/index.js"
