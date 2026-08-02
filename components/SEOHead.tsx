import React from 'react';
import { Helmet } from 'react-helmet-async';
import type { SEOSettings, PageSEO } from '../types';

interface BreadcrumbItem {
    name: string;
    url: string;
}

interface SEOHeadProps {
    pageTitle?: string;
    pageDescription?: string;
    pageKeywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogUrl?: string;
    canonicalUrl?: string;
    noindex?: boolean;
    nofollow?: boolean;
    structuredData?: any;
    seoSettings?: SEOSettings;
    pageSEO?: PageSEO;
    breadcrumbItems?: BreadcrumbItem[];
}

const SEOHead: React.FC<SEOHeadProps> = ({
    pageTitle,
    pageDescription,
    pageKeywords,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    canonicalUrl,
    noindex = false,
    nofollow = false,
    structuredData,
    seoSettings,
    pageSEO,
    breadcrumbItems
}) => {
    // Canonical URL: önce sayfa özel canonical, sonra genel canonical_url + window.location
    const baseUrl = seoSettings?.canonical_url || '';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname || '/' : '/';
    const finalCanonicalUrl = canonicalUrl || pageSEO?.canonical_url || (baseUrl ? `${baseUrl.replace(/\/$/, '')}${currentPath}` : '');

    // Sayfa özel SEO verilerini önceliklendir, yoksa genel ayarları kullan
    const finalTitle = pageTitle || pageSEO?.page_title || seoSettings?.site_title || 'Akaydın Tarım';
    const finalDescription = pageDescription || pageSEO?.meta_description || seoSettings?.site_description || '';
    const finalKeywords = pageKeywords || pageSEO?.meta_keywords || seoSettings?.site_keywords || '';
    const finalOgTitle = ogTitle || pageSEO?.og_title || seoSettings?.og_title || finalTitle;
    const finalOgDescription = ogDescription || pageSEO?.og_description || seoSettings?.og_description || finalDescription;
    const finalOgImage = ogImage || pageSEO?.og_image || seoSettings?.og_image || '';
    const finalOgUrl = ogUrl || seoSettings?.og_url || finalCanonicalUrl || '';
    const finalNoindex = noindex || pageSEO?.noindex || false;
    const finalNofollow = nofollow || pageSEO?.nofollow || false;

    // Robots meta tag oluştur (P1-4: noindex/nofollow varken "index" eklenmez — geçersiz değer)
    const robotsContent = [];
    if (finalNoindex) robotsContent.push('noindex');
    if (finalNofollow) robotsContent.push('nofollow');
    if (robotsContent.length === 0) robotsContent.push('index', 'follow');

    // BreadcrumbList structured data
    const breadcrumbSchema = breadcrumbItems && breadcrumbItems.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbItems.map((item, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': item.name,
            'item': item.url
        }))
    } : null;

    // Tüm structured data'ları birleştir
    const allSchemas = [];
    if (breadcrumbSchema) allSchemas.push(breadcrumbSchema);
    if (structuredData) {
        if (Array.isArray(structuredData)) {
            allSchemas.push(...structuredData);
        } else {
            allSchemas.push(structuredData);
        }
    }

    return (
        <Helmet>
            {/* Temel Meta Tags */}
            <title>{finalTitle}</title>
            {finalDescription && <meta name="description" content={finalDescription} />}
            {finalKeywords && <meta name="keywords" content={finalKeywords} />}
            {seoSettings?.site_author && <meta name="author" content={seoSettings.site_author} />}

            {/* Robots */}
            <meta name="robots" content={robotsContent.join(', ')} />

            {/* Canonical URL */}
            {finalCanonicalUrl && <link rel="canonical" href={finalCanonicalUrl} />}

            {/* Open Graph Tags */}
            {finalOgTitle && <meta property="og:title" content={finalOgTitle} />}
            {finalOgDescription && <meta property="og:description" content={finalOgDescription} />}
            {finalOgImage && <meta property="og:image" content={finalOgImage} />}
            {finalOgUrl && <meta property="og:url" content={finalOgUrl} />}
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={seoSettings?.site_title || 'Akaydın Tarım'} />

            {/* Twitter Cards */}
            {seoSettings?.twitter_card && <meta name="twitter:card" content={seoSettings.twitter_card} />}
            {seoSettings?.twitter_site && <meta name="twitter:site" content={seoSettings.twitter_site} />}
            {seoSettings?.twitter_creator && <meta name="twitter:creator" content={seoSettings.twitter_creator} />}
            {finalOgTitle && <meta name="twitter:title" content={finalOgTitle} />}
            {finalOgDescription && <meta name="twitter:description" content={finalOgDescription} />}
            {finalOgImage && <meta name="twitter:image" content={finalOgImage} />}

            {/* Mobile & Responsive */}
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="format-detection" content="telephone=no" />

            {/* Language */}
            <meta httpEquiv="content-language" content="tr" />
            <meta name="language" content="Turkish" />

            {/* Charset */}
            <meta charSet="utf-8" />

            {/* Google Search Console */}
            {seoSettings?.google_search_console && (
                <meta name="google-site-verification" content={seoSettings.google_search_console} />
            )}

            {/* Structured Data — Breadcrumb + page schemas */}
            {allSchemas.length > 0 && allSchemas.map((schema, i) => (
                <script key={i} type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            ))}

            {/* Schema Organization (eğer ayrıca structuredData içinde yoksa) */}
            {seoSettings?.schema_organization && !allSchemas.some(s => s['@type'] === 'Organization') && (
                <script type="application/ld+json">
                    {seoSettings.schema_organization}
                </script>
            )}

            {/* Favicon */}
            <link rel="icon" type="image/x-icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

            {/* Theme Color */}
            <meta name="theme-color" content="#16a34a" />
            <meta name="msapplication-TileColor" content="#16a34a" />
        </Helmet>
    );
};

export default SEOHead;
