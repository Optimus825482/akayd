import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 80;

/**
 * Multer işlem sonrası: yüklenen görseli yeniden boyutlandırıp WebP'ye çevirir.
 * Orijinal dosyayı siler, WebP versiyonuyla değiştirir.
 */
export async function processImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
    return; // Desteklenmeyen format — olduğu gibi bırak
  }

  // WebP zaten optimize edilmiş, tekrar işlenmesine gerek yok
  if (ext === '.webp') {
    return {
      filename: path.basename(filePath),
      path: filePath,
      size: fs.statSync(filePath).size,
    };
  }

  const webpPath = filePath.replace(ext, '.webp');
  const tmpPath = filePath + '.tmp.webp';

  try {
    // Önce geçici dosyaya yaz, sonra rename et (aynı dosya üzerine yazma hatasını önle)
    await sharp(filePath)
      .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(tmpPath);

    // Orijinal dosyayı sil, geçici dosyayı rename et
    fs.unlinkSync(filePath);
    fs.renameSync(tmpPath, webpPath);

    return {
      filename: path.basename(webpPath),
      path: webpPath,
      size: fs.statSync(webpPath).size,
    };
  } catch (err) {
    console.error('Görsel işleme hatası:', err);
    // Hata durumunda geçici dosyayı temizle
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    return null;
  }
}

/**
 * Express middleware: req.file ve req.files içindeki tüm görselleri işler.
 */
export function imageOptimizer(req, res, next) {
  const processPromises = [];

  // Tek dosya (upload.single)
  if (req.file) {
    processPromises.push(
      processImage(req.file.path).then(result => {
        if (result) {
          req.file.filename = result.filename;
          req.file.path = result.path;
          req.file.size = result.size;
        }
      })
    );
  }

  // Çoklu dosya (upload.array / upload.fields)
  if (req.files) {
    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    for (const file of files) {
      processPromises.push(
        processImage(file.path).then(result => {
          if (result) {
            file.filename = result.filename;
            file.path = result.path;
            file.size = result.size;
          }
        })
      );
    }
  }

  Promise.all(processPromises)
    .then(() => next())
    .catch(err => {
      console.error('Görsel optimizasyon hatası:', err);
      next();
    });
}
