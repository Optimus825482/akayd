import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Service, Product, HeroContent, ContactPageContent, SEOSettings, PageSEO } from '../types';
import ServiceCard from '../components/ServiceCard';
import ProductCard from '../components/ProductCard';
import SEOHead from '../components/SEOHead';
import { seoAPI } from '../services/api';

interface HomePageProps {
    services: Service[];
    products: Product[];
    heroContents: HeroContent[];
    contactContent: ContactPageContent;
    seoSettings?: SEOSettings | null;
}

const defaultHeroContent: HeroContent[] = [
    { id:"1", title:"Fındık Üretiminizi", subtitle:"Bir Sonraki Seviyeye Taşıyın", description:"Modern tarım teknikleri ve uzman danışmanlık hizmetleriyle verimliliğinizi artırın.", cta:"Hemen Başlayın", backgroundGradient:"", backgroundImage:"", isActive:true, order:1 },
    { id:"2", title:"Organomineral Gübreler ile", subtitle:"Doğal ve Verimli Üretim", description:"Çevre dostu gübre çözümlerimizle hem toprağınızı hem de ürününüzü koruyun.", cta:"Keşfedin", backgroundGradient:"", backgroundImage:"", isActive:true, order:2 },
];

const HomePage: React.FC<HomePageProps> = ({ services, products, heroContents, contactContent, seoSettings }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [pageSEO, setPageSEO] = useState<PageSEO | null>(null);

    useEffect(() => { seoAPI.getPageSEO('/').then(setPageSEO).catch(()=>{}); }, []);

    const activeHero = (heroContents?.length > 0 ? heroContents.filter(h => h.isActive) : defaultHeroContent).sort((a,b) => a.order - b.order);

    useEffect(() => {
        const t = setInterval(() => setCurrentSlide(p => (p + 1) % activeHero.length), 5000);
        return () => clearInterval(t);
    }, [activeHero.length]);

    const c = activeHero[currentSlide];
    const wp = contactContent.phone?.replace(/[^\d]/g,'') || '905397751517';

    // ═══ Schema — Organization + LocalBusiness ═══
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Akaydın Tarım",
      "description": "Hendek, Sakarya'da fındık üretimi, fındık kırma & kavurma, organomineral gübre ve tarımsal danışmanlık",
      "url": "https://akaydintarim.com.tr",
      "logo": "https://akaydintarim.com.tr/akaylogo.png",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": contactContent.address?.split(',').slice(0, 2).join(',').trim() || "Remzi Efendi Cd. No:24",
        "addressLocality": "Hendek",
        "addressRegion": "Sakarya",
        "addressCountry": "TR"
      },
      "telephone": contactContent.phone || "+902641234567",
      "sameAs": [
        contactContent.facebook_url, contactContent.instagram_url, contactContent.youtube_url
      ].filter(Boolean)
    };

    return (
        <>
            <SEOHead seoSettings={seoSettings||undefined} pageSEO={pageSEO||undefined}
                pageTitle="Akaydın Tarım | Fındık Kırma & İşleme | Organomineral Gübre | Hendek/Sakarya"
                pageDescription="Hendek, Sakarya'da fındık üretimi, fındık kırma-kavurma hizmeti, organomineral gübre ve tarımsal danışmanlık. 25+ yıllık deneyim."
                pageKeywords="fındık kırma hendek, fındık işleme sakarya, fındık kavurma, organomineral gübre, hendek tarım, akaydın tarım, fındık üretimi"
                structuredData={orgSchema}
                breadcrumbItems={[
                    { name: 'Ana Sayfa', url: (seoSettings?.canonical_url || 'https://www.akaydintarim.com') + '/' }
                ]} />

            {/* ===== HERO — editorial dark ===== */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden" style={{background:'linear-gradient(135deg, #0f1f10 0%, #142218 40%, #1a2a1a 100%)'}}>
                {/* Arka plan görseli varsa göster */}
                {c.backgroundImage && (
                    <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{backgroundImage:`url(${c.backgroundImage})`}}></div>
                )}
                <div className="absolute inset-0 opacity-[0.025]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")'}}></div>
                <div className="absolute -top-40 -right-40 w-[40rem] h-[40rem] rounded-full opacity-8 blur-3xl" style={{background:'#1a6532'}}></div>
                <div className="absolute -bottom-20 -left-20 w-[30rem] h-[30rem] rounded-full opacity-5 blur-3xl" style={{background:'#8b6508'}}></div>

                <div className="container relative z-10 py-24 lg:py-0">
                    <div className="max-w-3xl">
                        <p className="text-earth-bg/60 text-xs font-semibold tracking-[0.2em] uppercase mb-6 animate-fade-in-up">Akaydın Tarım · Hendek / Sakarya</p>
                        <h1 className="text-white font-[family-name:var(--font-display)] leading-[1.08] mb-6 animate-fade-in-up" style={{fontSize:'clamp(2.5rem, 6vw, 5rem)'}}>
                            {c.title}
                            <span className="block mt-3" style={{color:'oklch(80% 0.12 142)', fontSize:'clamp(1.5rem, 3.5vw, 2.5rem)'}}>{c.subtitle}</span>
                        </h1>
                        <p className="text-lg md:text-xl mb-10 max-w-lg animate-fade-in-up" style={{color:'oklch(80% 0.03 160)', animationDelay:'0.1s'}}>{c.description}</p>
                        <div className="flex flex-wrap gap-3 animate-fade-in-up" style={{animationDelay:'0.2s'}}>
                            <Link to="/iletisim" className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02]" style={{background:'#1a6532', color:'#fff'}}>
                                {c.cta || 'İletişime Geç'}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                            </Link>
                            <Link to="/hizmetlerimiz" className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl border transition-all duration-200 hover:scale-[1.02]" style={{borderColor:'oklch(85% 0/0.2)', color:'#fff'}}>
                                Hizmetleri Keşfedin
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {activeHero.map((_,i) => (
                        <button key={i} onClick={()=>setCurrentSlide(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide===i ? 'bg-accent w-10' : 'bg-white/25 w-1.5 hover:bg-white/40'}`} />
                    ))}
                </div>
            </section>

            {/* ===== NEDEN BIZ — 3 kolon sayısal ===== */}
            <section className="section bg-surface">
                <div className="container">
                    <div className="text-center mb-16">
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">Neden Akaydın Tarım</p>
                        <h2 className="text-3xl md:text-5xl font-[family-name:var(--font-display)] font-bold text-ink mb-4">Doğru Ellerde,<br/>Doğru Hasat</h2>
                        <p className="text-ink-2 max-w-xl mx-auto">Modern teknoloji ve nesiller boyu süregelen tarım bilgisiyle fındık üretiminde fark yaratıyoruz.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {n:'25+',label:'Yıllık Deneyim',desc:'Hendek\'te nesiller boyu fındık üretimi'},
                            {n:'500+',label:'Mutlu Üretici',desc:'Bölge çiftçilerine danışmanlık ve hizmet'},
                            {n:'7/24',label:'Kesintisiz Destek',desc:'Her an yanınızda, tarladan hasada'}
                        ].map((s,i)=>(
                            <div key={i} className="text-center p-8 rounded-2xl border border-rule hover:border-accent hover:shadow-lg transition-all duration-300">
                                <div className="text-5xl font-bold font-[family-name:var(--font-display)] text-accent mb-2">{s.n}</div>
                                <h3 className="text-lg font-bold text-ink mb-2">{s.label}</h3>
                                <p className="text-sm text-ink-2">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FINDIK İŞLEME — SEO güçlendirilmiş ===== */}
            <section className="section bg-paper-2">
                <div className="container">
                    <div className="text-center mb-16">
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">Hendek'te İlk ve Tek</p>
                        <h2 className="text-3xl md:text-5xl font-[family-name:var(--font-display)] font-bold text-ink mb-4">Fındık Kırma ve İşleme Hizmetleri</h2>
                        <p className="text-ink-2 max-w-xl mx-auto">
                            Evleriniz için ayırdığınız fındıklar artık çürümeyecek. 
                            Hendek'te <strong>profesyonel fındık kırma, kavurma ve vakumlu paketleme</strong> hizmeti ile tanışın.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        {[
                            {icon:'🔨',title:'Fındık Kırma',desc:'Son teknoloji, hasarsız'},
                            {icon:'🔥',title:'Fındık Kavurma',desc:'Profesyonel lezzet'},
                            {icon:'📦',title:'Vakumlu Paketleme',desc:'2 yıl tazelik garantisi'},
                            {icon:'🛡️',title:'Değer Koruma',desc:'Fire oranı %5\'in altında'}
                        ].map((s,i)=>(
                            <div key={i} className="relative text-center p-6 rounded-2xl bg-surface border border-rule group hover:border-accent hover:shadow-md transition-all duration-300">
                                <div className="text-3xl mb-3">{s.icon}</div>
                                <h3 className="font-bold text-ink mb-1">{s.title}</h3>
                                <p className="text-xs text-ink-3">{s.desc}</p>
                                {i<3 && <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-ink-3 text-lg">→</div>}
                            </div>
                        ))}
                    </div>
                    <div className="text-center space-y-4">
                        <Link to="/findik-isleme" className="btn btn-primary btn-lg">
                            🔍 Fındık Kırma Hizmeti Detayları
                        </Link>
                        <p className="text-xs text-ink-3">
                            Hendek fındık kırma, kavurma ve vakumlu paketleme • Saatte 5-10 kg • %98 hasarsız iç fındık
                        </p>
                    </div>
                </div>
            </section>

            {/* ===== HİZMETLER — alternating ===== */}
            {services.length > 0 && (
            <section className="section bg-surface">
                <div className="container">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">Hizmetlerimiz</p>
                            <h2 className="text-3xl md:text-5xl font-[family-name:var(--font-display)] font-bold text-ink">Fındık üretiminin<br/>her aşamasında</h2>
                        </div>
                        <Link to="/hizmetlerimiz" className="btn btn-outline shrink-0">Tüm Hizmetler →</Link>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.slice(0,6).map(s => <ServiceCard key={s.id} service={s} />)}
                    </div>
                </div>
            </section>
            )}

            {/* ===== ÜRÜNLER — büyük kartlar ===== */}
            {products.length > 0 && (
            <section className="section bg-paper-2">
                <div className="container">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">Ürünlerimiz</p>
                            <h2 className="text-3xl md:text-5xl font-[family-name:var(--font-display)] font-bold text-ink">Öne çıkan ürünler</h2>
                        </div>
                        <Link to="/urunler" className="btn btn-outline shrink-0">Tüm Ürünler →</Link>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {(products.filter(p=>p.isFeatured).length > 0 ? products.filter(p=>p.isFeatured) : products).slice(0,4).map(p => (
                            <ProductCard key={p.id} product={p} contactPhone={wp} />
                        ))}
                    </div>
                </div>
            </section>
            )}

            {/* ===== FINAL CTA ===== */}
            <section className="relative py-24 md:py-32 overflow-hidden" style={{background:'linear-gradient(135deg, #0f1f10 0%, #1a2f1a 100%)'}}>
                <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle at 20% 50%, #1a6532 0%, transparent 50%)'}}></div>
                <div className="container relative z-10 text-center">
                    <h2 className="text-3xl md:text-5xl font-[family-name:var(--font-display)] font-bold text-white mb-4">Fındık Üretiminde<br/>Verimliliğinizi Artırmaya Hazır mısınız?</h2>
                    <p className="text-lg text-white/60 max-w-lg mx-auto mb-10">Akaydın Tarım uzmanları, modern tarım çözümleriyle yanınızda.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/iletisim" className="btn btn-primary btn-lg bg-accent text-white">Hemen İletişime Geçin</Link>
                        <Link to="/hizmetlerimiz" className="btn btn-outline btn-lg border-white/20 text-white hover:bg-white/10">Hizmetleri İnceleyin</Link>
                    </div>
                </div>
            </section>
        </> );
};

export default HomePage;
