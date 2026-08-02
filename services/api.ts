import type { ContactPageContent, SEOSettings, PageSEO } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3003/api";

// Genel API çağrısı fonksiyonu
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem("admin_token");

  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      // 401: geçersiz/expired token → temizle + UI'a haber ver (login state sıfırlansın)
      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        window.dispatchEvent(new CustomEvent('admin:unauthorized'));
      }
      throw new Error(`API hatası: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API çağrısı hatası:", error);
    throw error;
  }
}

// Dosya yükleme için özel fonksiyon (POST ve PUT destekler)
async function uploadFile(
  endpoint: string,
  formData: FormData,
  method: string = "POST",
) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem("admin_token");

  try {
    const response = await fetch(url, {
      method,
      credentials: 'include',
      body: formData,
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        window.dispatchEvent(new CustomEvent('admin:unauthorized'));
      }
      throw new Error(`API hatası: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Dosya yükleme hatası:", error);
    throw error;
  }
}

// HİZMETLER API
export const servicesAPI = {
  getAll: () => apiCall("/services"),
  create: (data: Record<string, unknown>) =>
    apiCall("/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Record<string, unknown>) =>
    apiCall(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiCall(`/services/${id}`, {
      method: "DELETE",
    }),
};

// ÜRÜNLER API
export const productsAPI = {
  getAll: () => apiCall("/products"),
  create: (formData: FormData) => uploadFile("/products", formData),
  update: (id: number, formData: FormData) =>
    uploadFile(`/products/${id}`, formData, "PUT"),
  delete: (id: number) =>
    apiCall(`/products/${id}`, {
      method: "DELETE",
    }),
};

// BLOG API
export const blogAPI = {
  getAll: () => apiCall("/blog-posts"),
  create: (formData: FormData) => uploadFile("/blog-posts", formData),
  update: (id: number, formData: FormData) =>
    uploadFile(`/blog-posts/${id}`, formData, "PUT"),
  delete: (id: number) =>
    apiCall(`/blog-posts/${id}`, {
      method: "DELETE",
    }),
  incrementView: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/blog-posts/${id}/view`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Blog view count güncellenemedi");
    return response.json();
  },
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/blog-posts/stats`);
    if (!response.ok) throw new Error("Blog istatistikleri alınamadı");
    return response.json();
  },
};

// HAKKIMIZDA API
export const aboutAPI = {
  get: () => apiCall("/about"),
  update: (formData: FormData) => uploadFile("/about", formData, "PUT"),
  deleteImage: (imagePath: string) =>
    apiCall("/about/image", {
      method: "DELETE",
      body: JSON.stringify({ imagePath }),
    }),
};

// İLETİŞİM API
export const contactAPI = {
  get: () => apiCall("/contact"),
  update: (data: Partial<ContactPageContent>) =>
    apiCall("/contact", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// HERO API
export const heroAPI = {
  getAll: () => apiCall("/hero"),
  create: (formData: FormData) => uploadFile("/hero", formData),
  update: (id: number, formData: FormData) =>
    uploadFile(`/hero/${id}`, formData, "PUT"),
  delete: (id: number) =>
    apiCall(`/hero/${id}`, {
      method: "DELETE",
    }),
  updateOrder: (items: { id: number; order: number }[]) =>
    apiCall("/hero/order", {
      method: "PUT",
      body: JSON.stringify({ items }),
    }),
};

// CONTACT MESSAGES API
export const contactMessagesAPI = {
  create: (messageData: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) =>
    apiCall("/contact/messages", {
      method: "POST",
      body: JSON.stringify(messageData),
    }),
  getAll: () => apiCall("/contact/messages"),
  markAsRead: (id: number) =>
    apiCall(`/contact/messages/${id}/read`, {
      method: "PUT",
    }),
  delete: (id: number) =>
    apiCall(`/contact/messages/${id}`, {
      method: "DELETE",
    }),
};


// SEO API
export const seoAPI = {
  // SEO Settings
  getSettings: () => apiCall("/seo/settings"),
  updateSettings: (data: Partial<SEOSettings>) =>
    apiCall("/seo/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Page SEO
  getPageSEO: (pagePath: string) =>
    apiCall(`/seo/pages?path=${encodeURIComponent(pagePath)}`),
  getAllPageSEO: () => apiCall("/seo/pages"),
  createPageSEO: (data: Partial<PageSEO>) =>
    apiCall("/seo/pages", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updatePageSEO: (id: number, data: Partial<PageSEO>) =>
    apiCall(`/seo/pages/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deletePageSEO: (id: number) =>
    apiCall(`/seo/pages/${id}`, {
      method: "DELETE",
    }),

  // SEO Analysis
  analyzePage: (url: string) =>
    apiCall(`/seo/analyze?url=${encodeURIComponent(url)}`),

  // Sitemap
  generateSitemap: () =>
    apiCall("/seo/sitemap", {
      method: "POST",
    }),
  getSitemap: () => apiCall("/seo/sitemap"),

  // Robots.txt
  updateRobots: (content: string) =>
    apiCall("/seo/robots", {
      method: "PUT",
      body: JSON.stringify({ content }),
    }),
  getRobots: () => apiCall("/seo/robots"),
};

// SERP Rank Tracker API
export const serpAPI = {
  getCurrent: (domain?: string) => domain ? apiCall(`/serp-rankings/current?domain=${encodeURIComponent(domain)}`) : apiCall("/serp-rankings/current"),
  getHistory: (params: { keyword?: string; engine?: string; days?: number; domain?: string }) => {
    const qs = new URLSearchParams();
    if (params.keyword) qs.set('keyword', params.keyword);
    if (params.engine) qs.set('engine', params.engine);
    if (params.domain) qs.set('domain', params.domain);
    qs.set('days', String(params.days || 30));
    return apiCall(`/serp-rankings/history?${qs.toString()}`);
  },
  getKeywords: () => apiCall("/serp-rankings/keywords"),
  addKeyword: (keyword: string, domain?: string) =>
    apiCall("/serp-rankings/keywords", { method: 'POST', body: JSON.stringify({ keyword, domain }) }),
  deleteKeyword: (id: number) =>
    apiCall(`/serp-rankings/keywords/${id}`, { method: 'DELETE' }),
  triggerCheck: () => apiCall("/serp-rankings/check", { method: 'POST' }),
  triggerCheckKeyword: (keywordId: number) =>
    apiCall(`/serp-rankings/check/${keywordId}`, { method: 'POST' }),
};

export default {
  servicesAPI,
  productsAPI,
  blogAPI,
  aboutAPI,
  contactAPI,
  heroAPI,
  contactMessagesAPI,
  seoAPI,
  serpAPI,
};
