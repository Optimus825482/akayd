import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { AboutPageContent, SEOSettings, PageSEO } from '../types';
import SEOHead from '../components/SEOHead';
import { seoAPI } from '../services/api';

interface AboutPageProps { content: AboutPageContent; seoSettings?: SEOSettings | null; }

const AboutPage: React.FC<AboutPageProps> = ({ content, seoSettings }) => {
    const [imgIdx, setImgIdx] = useState(0);
    const [pageSEO, setPageSEO] = useState<PageSEO | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => { seoAPI.getPageSEO('/hakkimizda').then(setPageSEO).catch(()=>{}); }, []);

    // Intersection Observer for fade-in
    useEffect(() => {
        const el = document.getElementById('about-content-section');
        if (!el) return;
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) { setIsVisible(true); obs.disconnect(); }
        }, { threshold: 0.15 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // Görsel slider otomatik geçiş
    const imgs = content.images?.length ? content.images : ['https://picsum.photos/800/600?random=30'];
    useEffect(() => {
        if (imgs.length < 2) return;
        const t = setInterval(() => setImgIdx(p => (p+1) % imgs.length), 4000);
        return () => clearInterval(t);
    }, [imgs.length]);

    const nextImg = useCallback(() => setImgIdx(p => p === imgs.length-1 ? 0 : p+1), [imgs.length]);
    const prevImg = useCallback(() => setImgIdx(p => p === 0 ? imgs.length-1 : p-1), [imgs.length]);

    return (<>
        <SEOHead seoSettings={seoSettings||undefined} pageSEO={pageSEO||undefined}
            pageTitle="Hakkımızda" pageDescription="Akaydın Tarım'ın misyonu, vizyonu ve değerleri."
            pageKeywords="hakkımızda, akaydın tarım, misyon, vizyon" />

        {/* ═══════════ HERO ═══════════ */}
        <section className="relative py-20 md:py-28 overflow-hidden" style={{background:'linear-gradient(135deg, #0f1f10 0%, #142218 60%, #1a2a1a 100%)'}}>
            <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")'}}></div>
            <div className="container relative z-10">
                <p className="text-accent-bg/60 text-xs font-semibold tracking-[0.2em] uppercase mb-4">Hakkımızda</p>
                <h1 className="text-4xl md:text-6xl font-[family-name:var(--font-display)] font-bold text-white mb-4">
                    {content.title || 'Toprağın Gücü, Teknolojinin Aklı'}
                </h1>
                <p className="text-lg text-white/60 max-w-2xl">
                    {content.content?.slice(0, 120) || 'Akaydın Tarım — Hendek, Sakarya'}
                </p>
            </div>
        </section>

        {/* ═══════════ HAKKIMIZDA YAZI + GÖRSEL SLIDER ═══════════ */}
        <section id="about-content-section" className="section bg-surface overflow-hidden">
            <div className="container">
                <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    {/* ── SOL: Hakkımızda yazısı ── */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-3">Hikayemiz</p>
                            <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-display)] font-bold text-ink mb-4">
                                {content.title || 'Akaydın Tarım'}
                            </h2>
                            <div className="w-16 h-1 bg-accent rounded-full mb-6"></div>
                        </div>

                        <div className="text-ink-2 leading-relaxed space-y-4 text-base">
                            {content.content ? content.content.split('\n').filter(p => p.trim()).map((p, i) => (
                                <p key={i}>{p}</p>
                            )) : (
                                <p>Akaydın Tarım, Hendek/Sakarya bölgesinde fındık üretimi ve tarımsal danışmanlık alanında faaliyet gösteren köklü bir aile işletmesidir.</p>
                            )}
                        </div>

                        {/* Mini değerler */}
                        <div className="flex flex-wrap gap-3 pt-2">
                            {['🌱 Sürdürülebilirlik', '🤝 Güvenilirlik', '💡 Yenilikçilik', '🏆 Kalite'].map(t => (
                                <span key={t} className="text-xs font-medium bg-accent-bg text-accent px-3 py-1.5 rounded-full">{t}</span>
                            ))}
                        </div>
                    </div>

                    {/* ── SAĞ: Görsel slider (fade-in) ── */}
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-[3/4] bg-paper-3 shadow-xl group">
                        {imgs.map((img, i) => (
                            <img
                                key={i}
                                src={img}
                                alt={`Akaydın Tarım ${i+1}`}
                                loading="lazy"
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === imgIdx ? 'opacity-100' : 'opacity-0'}`}
                            />
                        ))}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent pointer-events-none"></div>

                        {imgs.length > 1 && (
                            <>
                                <button
                                    onClick={prevImg}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/35 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                                </button>
                                <button
                                    onClick={nextImg}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/35 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                                </button>
                                {/* Dot indicators */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {imgs.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setImgIdx(i)}
                                            className={`rounded-full transition-all duration-300 ${i === imgIdx ? 'bg-white w-8 h-2' : 'bg-white/40 w-2 h-2 hover:bg-white/60'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Görsel sayacı */}
                        {imgs.length > 1 && (
                            <div className="absolute top-4 right-4 bg-ink/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                                {imgIdx + 1} / {imgs.length}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>

        {/* ═══════════ MİSYON + VİZYON — yan yana ═══════════ */}
        <section className="section bg-paper-2">
            <div className="container">
                <div className={`grid md:grid-cols-2 gap-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    {/* Misyon */}
                    <div className="group relative overflow-hidden rounded-2xl bg-surface border border-rule hover:border-accent/40 hover:shadow-lg transition-all duration-300">
                        <div className="absolute top-0 left-0 w-full h-1 bg-accent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        <div className="p-8 md:p-10">
                            <div className="flex items-start gap-5">
                                <div className="w-14 h-14 shrink-0 rounded-2xl bg-accent-bg flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all duration-300">
                                    <span className="text-2xl">🎯</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-[family-name:var(--font-display)] font-bold text-ink mb-3">Misyon</h3>
                                    <p className="text-ink-2 leading-relaxed">{content.mission}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vizyon */}
                    <div className="group relative overflow-hidden rounded-2xl bg-surface border border-rule hover:border-sky/40 hover:shadow-lg transition-all duration-300">
                        <div className="absolute top-0 left-0 w-full h-1 bg-sky origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        <div className="p-8 md:p-10">
                            <div className="flex items-start gap-5">
                                <div className="w-14 h-14 shrink-0 rounded-2xl bg-sky-bg flex items-center justify-center group-hover:bg-sky group-hover:text-white transition-all duration-300">
                                    <span className="text-2xl">🚀</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-[family-name:var(--font-display)] font-bold text-ink mb-3">Vizyon</h3>
                                    <p className="text-ink-2 leading-relaxed">{content.vision}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* ═══════════ DEĞERLER + İSTATİSTİKLER ═══════════ */}
        <section className="section bg-surface">
            <div className="container">
                <div className="text-center mb-12">
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">Değerlerimiz</p>
                    <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-display)] font-bold text-ink">Her kararımıza rehberlik eden ilkeler</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {[
                        {t:'Kalite',d:'En yüksek kalite standartlarını hedefleriz.',c:'border-accent',bg:'bg-accent-bg',i:'🏆'},
                        {t:'Güven',d:'Şeffaf ve güvene dayalı ilişkiler kurarız.',c:'border-sky',bg:'bg-sky-bg',i:'🛡️'},
                        {t:'Yenilikçilik',d:'Sektördeki en son gelişmeleri takip ederiz.',c:'border-earth',bg:'bg-earth-bg',i:'💡'},
                    ].map(v => (
                        <div key={v.t} className={`group p-8 rounded-2xl bg-paper-2 border-t-4 ${v.c} hover:shadow-lg transition-shadow`}>
                            <div className={`w-12 h-12 rounded-xl ${v.bg} flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform`}>{v.i}</div>
                            <h3 className="text-xl font-[family-name:var(--font-display)] font-bold text-ink mb-2">{v.t}</h3>
                            <p className="text-ink-2">{v.d}</p>
                        </div>
                    ))}
                </div>

                {/* İstatistik bar */}
                <div className="rounded-2xl p-8 md:p-12 text-center" style={{background:'linear-gradient(135deg, #1a6532, #0f4a25)'}}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
                        {[
                            {n:'25+',l:'Yıllık Deneyim'},
                            {n:'500+',l:'Mutlu Üretici'},
                            {n:'50+',l:'Farklı Ürün'},
                            {n:'7/24',l:'Destek'},
                        ].map(s => (
                            <div key={s.l}>
                                <div className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] mb-1">{s.n}</div>
                                <div className="text-white/60 text-sm">{s.l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* CTA */}
        <section className="section bg-surface">
            <div className="container text-center">
                <div className="max-w-xl mx-auto p-10 rounded-3xl border-2 border-accent/20" style={{background:'oklch(94% 0.04 148 / 0.3)'}}>
                    <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-display)] font-bold text-ink mb-4">Bizimle Çalışmaya Hazır mısınız?</h2>
                    <p className="text-ink-2 mb-8">Deneyimli ekibimiz sizin için en uygun çözümleri geliştirmeye hazır.</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link to="/iletisim" className="btn btn-primary btn-lg">Hemen Konuşalım</Link>
                        <Link to="/hizmetlerimiz" className="btn btn-outline">Hizmetlerimiz</Link>
                    </div>
                </div>
            </div>
        </section>
    </>);
};

export default AboutPage;
