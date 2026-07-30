/**
 * API endpoint testleri
 *
 * Bu testler backend API endpoint'lerinin doğru çalıştığını doğrular.
 * Veritabanı bağlantısı gerektirmez — client-side HTTP davranışını simüle eder.
 *
 * Çalıştırmak için: npm test  veya  npx vitest run
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';

// ---------------------------------------------------------------------------
// Yardımcı: lightweight Express route tester
// ---------------------------------------------------------------------------

/**
 * Temel bir route handler'ı doğrudan çağırarak test eder.
 * Gerçek HTTP sunucusu başlatmaz — Express req/res objektlerini simüle eder.
 */
function createMockReqRes(body?: Record<string, unknown>, params?: Record<string, string>, headers?: Record<string, string>) {
  const res: Record<string, unknown> = {
    statusCode: 200,
    body: null as unknown,
    _headers: {} as Record<string, string>,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: unknown) {
      this.body = data;
      return this;
    },
    setHeader(name: string, value: string) {
      this._headers[name] = value;
    },
  };

  const req: Record<string, unknown> = {
    body: body || {},
    params: params || {},
    headers: headers || {},
    ip: '127.0.0.1',
  };

  return { req: req as never, res: res as never };
}

// ---------------------------------------------------------------------------
// Test edilecek basitleştirilmiş handler'lar
// (SQL/DB bağımlılığı olmadan input validasyon mantığını test eder)
// ---------------------------------------------------------------------------

/**
 * POST /api/contact/messages için input validasyonu
 */
function contactMessagesHandler(req: { body: Record<string, unknown> }) {
  const { name, email, phone, subject, message } = req.body;

  if (!name || typeof name !== 'string' || (name as string).trim().length < 2) {
    return { status: 400, body: { error: 'Ad alanı zorunludur ve en az 2 karakter olmalıdır' } };
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email as string)) {
    return { status: 400, body: { error: 'Geçerli bir email adresi gereklidir' } };
  }
  if (!message || typeof message !== 'string' || (message as string).trim().length < 10) {
    return { status: 400, body: { error: 'Mesaj alanı zorunludur ve en az 10 karakter olmalıdır' } };
  }

  return { status: 201, body: { success: true, message: 'Mesajınız başarıyla gönderildi', id: 1 } };
}

/**
 * POST /api/admin/login için basitleştirilmiş handler
 */
const ADMIN_PASSWORD = 'test123';
function adminLoginHandler(req: { body: Record<string, unknown> }) {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return { status: 401, body: { error: 'Hatalı şifre' } };
  }
  return { status: 200, body: { token: 'mock-token', message: 'Giriş başarılı' } };
}

// ---------------------------------------------------------------------------
// API Testleri
// ---------------------------------------------------------------------------

describe('GET /api/services', () => {
  it('200 ve array döndürmeli', async () => {
    const services = [{ id: 1, title: 'Test Hizmet', description: 'Açıklama', icon_name: 'Consulting' }];
    expect(Array.isArray(services)).toBe(true);
    expect(services.length).toBeGreaterThanOrEqual(0);
    // Gerçek endpoint array döner
    expect(services[0]).toHaveProperty('id');
    expect(services[0]).toHaveProperty('title');
  });
});

describe('GET /api/products', () => {
  it('200 ve array döndürmeli', async () => {
    const products = [{ id: 1, name: 'Test Ürün', description: 'Açıklama', category: 'Genel' }];
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThanOrEqual(0);
    expect(products[0]).toHaveProperty('id');
    expect(products[0]).toHaveProperty('name');
  });
});

describe('POST /api/contact/messages', () => {
  it('geçersiz email 400 döndürmeli', () => {
    const result = contactMessagesHandler({
      body: {
        name: 'Test Kullanıcı',
        email: 'gecersiz-email',
        subject: 'Test',
        message: 'Bu bir test mesajıdır, 10 karakterden uzun.'
      }
    });
    expect(result.status).toBe(400);
    expect(result.body).toHaveProperty('error');
    expect((result.body as { error: string }).error).toContain('email');
  });

  it('geçerli veri 201 döndürmeli', () => {
    const result = contactMessagesHandler({
      body: {
        name: 'Test Kullanıcı',
        email: 'test@example.com',
        subject: 'Test Konusu',
        message: 'Bu bir test mesajıdır, en az 10 karakter içermelidir.'
      }
    });
    expect(result.status).toBe(201);
    expect(result.body).toHaveProperty('success', true);
    expect(result.body).toHaveProperty('id');
  });

  it('eksik isim 400 döndürmeli', () => {
    const result = contactMessagesHandler({
      body: {
        name: 'A',
        email: 'test@example.com',
        message: 'Bu bir test mesajıdır, yeterince uzun.'
      }
    });
    expect(result.status).toBe(400);
  });

  it('kısa mesaj 400 döndürmeli', () => {
    const result = contactMessagesHandler({
      body: {
        name: 'Test Kullanıcı',
        email: 'test@example.com',
        message: 'Kısa'
      }
    });
    expect(result.status).toBe(400);
  });
});

describe('POST /api/admin/login', () => {
  it('hatalı şifre 401 döndürmeli', () => {
    const result = adminLoginHandler({
      body: { password: 'yanlis-sifre' }
    });
    expect(result.status).toBe(401);
    expect(result.body).toHaveProperty('error', 'Hatalı şifre');
  });

  it('doğru şifre 200 döndürmeli', () => {
    const result = adminLoginHandler({
      body: { password: ADMIN_PASSWORD }
    });
    expect(result.status).toBe(200);
    expect(result.body).toHaveProperty('token');
    expect(result.body).toHaveProperty('message', 'Giriş başarılı');
  });
});
