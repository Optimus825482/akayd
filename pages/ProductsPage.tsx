import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Product, ContactPageContent, SEOSettings } from '../types';
import ProductCard from '../components/ProductCard';
import SEOHead from '../components/SEOHead';
import { usePageSEO } from '../hooks/usePageSEO';

interface ProductsPageProps { products: Product[]; contactContent: ContactPageContent; seoSettings?: SEOSettings | null; }

const ProductsPage: React.FC<ProductsPageProps> = ({ products, contactContent, seoSettings }) => {
    const pageSEO = usePageSEO('/urunler');
    const wp = contactContent.phone?.replace(/[^\d]/g,'') || '905397751517';

    // ═══ Schema — ItemList for products ═══
    const productsSchema = useMemo(() => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Akaydın Tarım Ürünleri",
      "description": "Organomineral gübreler ve işlenmiş fındık çeşitleri. Hendek/Sakarya'da kaliteli tarım ürünleri.",
      "numberOfItems": products.length,
      "itemListElement": products.map((p, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": p.name,
        "description": p.description,
        "url": `https://www.akaydintarim.com.tr/urunler#${p.id}`
      }))
    }), [products]);

    return (<>
        <SEOHead seoSettings={seoSettings||undefined} pageSEO={pageSEO||undefined}
            pageTitle="Ürünlerimiz | Fındık & Organomineral Gübre | Akaydın Tarım"
            pageDescription="Akaydın Tarım ürün kataloğu: organomineral gübreler, işlenmiş fındık çeşitleri ve tarımsal ürünler. Hendek/Sakarya'da kaliteli ve verimli tarım ürünleri."
            pageKeywords="ürünlerimiz, fındık, organomineral gübre, organik gübre, akaydın tarım, hendek, sakarya, fındık çeşitleri, tarım ürünleri"
            structuredData={productsSchema}
            breadcrumbItems={[
                { name: 'Ana Sayfa', url: (seoSettings?.canonical_url || 'https://www.akaydintarim.com.tr') + '/' },
                { name: 'Ürünlerimiz', url: (seoSettings?.canonical_url || 'https://www.akaydintarim.com.tr') + '/urunler' }
            ]} />

        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden" style={{background:'linear-gradient(135deg, #0f1f10 0%, #142218 60%, #1a2a1a 100%)'}}>
            <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")'}}></div>
            <div className="container relative z-10">
                <p className="text-accent-bg/60 text-xs font-semibold tracking-[0.2em] uppercase mb-4">Ürünlerimiz</p>
                <h1 className="text-4xl md:text-6xl font-[family-name:var(--font-display)] font-bold text-white mb-4">Premium ürün kataloğu</h1>
                <p className="text-lg text-white/60 max-w-xl">Veriminizi artıracak gübreler ve en kaliteli işlenmiş fındık çeşitleri.</p>
            </div>
        </section>

        {/* Products grid */}
        <section className="section bg-surface">
            <div className="container">
                {products.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((p,i) => (
                            <div key={p.id} className="animate-fade-in-up" style={{animationDelay:`${i*0.06}s`}}>
                                <ProductCard product={p} contactPhone={wp} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">📦</div>
                        <p className="text-ink-2 text-lg mb-6">Henüz ürün eklenmemiş.</p>
                        <Link to="/" className="btn btn-primary">Ana Sayfaya Dön</Link>
                    </div>
                )}
            </div>
        </section>

        {/* CTA */}
        <section className="section bg-paper-2">
            <div className="container text-center">
                <div className="max-w-xl mx-auto p-10 rounded-3xl border-2 border-accent/20 bg-accent-bg/30">
                    <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-display)] font-bold text-ink mb-4">Özel ürün talebiniz mi var?</h2>
                    <p className="text-ink-2 mb-8">Katalogumuzda bulamadığınız ürünler için bize ulaşın.</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link to="/iletisim" className="btn btn-primary btn-lg">Sipariş Ver</Link>
                        <Link to="/hizmetlerimiz" className="btn btn-outline">Hizmetlerimiz</Link>
                    </div>
                </div>
            </div>
        </section>
    </>);
};

export default ProductsPage;
