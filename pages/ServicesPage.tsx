import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Service, SEOSettings, PageSEO } from '../types';
import ServiceCard from '../components/ServiceCard';
import SEOHead from '../components/SEOHead';
import { seoAPI } from '../services/api';

interface ServicesPageProps { services: Service[]; seoSettings?: SEOSettings | null; }

const ServicesPage: React.FC<ServicesPageProps> = ({ services, seoSettings }) => {
    const [pageSEO, setPageSEO] = useState<PageSEO | null>(null);
    useEffect(() => { seoAPI.getPageSEO('/hizmetlerimiz').then(setPageSEO).catch(()=>{}); }, []);

    return (<>
        <SEOHead seoSettings={seoSettings||undefined} pageSEO={pageSEO||undefined}
            pageTitle="Hizmetlerimiz" pageDescription="Akaydın Tarım profesyonel hizmetleri."
            pageKeywords="hizmetlerimiz, tarım danışmanlığı, fındık üretimi" />

        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden" style={{background:'linear-gradient(135deg, #0f1f10 0%, #142218 60%, #1a2a1a 100%)'}}>
            <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")'}}></div>
            <div className="container relative z-10">
                <p className="text-accent-bg/60 text-xs font-semibold tracking-[0.2em] uppercase mb-4">Hizmetlerimiz</p>
                <h1 className="text-4xl md:text-6xl font-[family-name:var(--font-display)] font-bold text-white mb-4">Topraktan sofraya,<br/>her aşamada yanınızdayız</h1>
                <p className="text-lg text-white/60 max-w-xl">Fındık üretiminin her adımında profesyonel çözümler sunuyoruz.</p>
            </div>
        </section>

        {/* Services grid */}
        <section className="section bg-surface">
            <div className="container">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((s,i) => (
                        <div key={s.id} className="animate-fade-in-up" style={{animationDelay:`${i*0.08}s`}}>
                            <ServiceCard service={s} />
                        </div>
                    ))}
                </div>
                {services.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">🛠️</div>
                        <p className="text-ink-2 text-lg">Henüz hizmet eklenmemiş.</p>
                    </div>
                )}
            </div>
        </section>

        {/* CTA */}
        <section className="section bg-paper-2">
            <div className="container text-center">
                <div className="max-w-xl mx-auto p-10 rounded-3xl border-2 border-accent/20 bg-accent-bg/30">
                    <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-display)] font-bold text-ink mb-4">Özel bir hizmet mi arıyorsunuz?</h2>
                    <p className="text-ink-2 mb-8">İhtiyaçlarınıza özel çözümler geliştirebiliriz.</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link to="/iletisim" className="btn btn-primary btn-lg">Projemi Konuşalım</Link>
                        <Link to="/hakkimizda" className="btn btn-outline">Hakkımızda</Link>
                    </div>
                </div>
            </div>
        </section>
    </>);
};

export default ServicesPage;
