// It's best practice to define types that don't depend on runtime values from other files
// to avoid circular dependencies. Here we explicitly list the icon names.
export type ServiceIconName =
  | "Consulting"
  | "Processing"
  | "Fertilizer"
  | "Nutrition";

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: ServiceIconName;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  images?: string[]; // Birden fazla resim için
  category: string;
  price?: number;
  isFeatured?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content?: string;
  excerpt?: string;
  imageUrl: string;
  date: string;
  author: string;
  views?: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

export interface BlogStats {
  totalPosts: number;
  totalViews: number;
  topPosts: Array<{
    title: string;
    views: number;
  }>;
}

// Hero content interface
export interface HeroContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  backgroundGradient: string;
  backgroundImage?: string;
  isActive: boolean;
  order: number;
}

export interface AboutPageContent {
  title?: string;
  content?: string;
  mission: string;
  vision: string;
  images?: string[]; // Çoklu görsel için array
  image?: string; // Geriye uyumluluk için
}

export interface ContactPageContent {
  company_name?: string;
  address: string;
  phone: string;
  whatsapp_phone?: string; // WhatsApp sipariş hattı
  email: string;
  website?: string;
  working_hours?: string;
  map_embed?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  youtube_url?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// Dummy type for icon components
export interface IconProps {
  className?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}

// Hazelnut Prices types

// SEO Settings Interface
export interface SEOSettings {
  id?: number;
  site_title: string;
  site_description: string;
  site_keywords: string;
  site_author: string;
  og_title: string;
  og_description: string;
  og_image: string;
  og_url: string;
  twitter_card: "summary" | "summary_large_image" | "app" | "player";
  twitter_site: string;
  twitter_creator: string;
  canonical_url: string;
  robots_txt: string;
  google_analytics_id?: string;
  google_search_console?: string;
  facebook_pixel_id?: string;
  schema_organization: string;
  sitemap_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

// Page-specific SEO Interface
export interface PageSEO {
  id?: number;
  page_path: string;
  page_title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image?: string;
  canonical_url?: string;
  noindex: boolean;
  nofollow: boolean;
  created_at?: string;
  updated_at?: string;
}

// SEO Analysis Interface
export interface SEOAnalysis {
  page_url: string;
  title?: string;
  title_length: number;
  description?: string;
  description_length: number;
  has_meta_description: boolean;
  has_og_tags: boolean;
  has_canonical: boolean;
  content_stats?: {
    total_products?: number;
    total_blog_posts?: number;
    total_services?: number;
  };
  site_health?: {
    has_schema?: boolean;
    sitemap_enabled?: boolean;
    has_analytics?: boolean;
  };
  recommendations: string[];
}

// ═══════════════════════════════════════════════

// SERP Rank Tracker Types
export interface SerpRanking {
  id: number;
  keyword: string;
  engine: 'google' | 'yandex' | 'bing';
  position: number;
  url?: string;
  checked_at: string;
}

export interface SerpKeyword {
  id: number;
  keyword: string;
  is_active: boolean;
  domain: string;
  created_at: string;
}

export interface SerpRankingCurrent {
  keyword: string;
  engine: string;
  position: number;
  url?: string;
  domain?: string;
  checked_at: string;
}
