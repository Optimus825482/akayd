import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { ContactPageContent, SEOSettings, PageSEO } from '../types';
import SEOHead from '../components/SEOHead';
import { contactMessagesAPI, seoAPI } from '../services/api';

interface ContactPageProps { content: ContactPageContent; seoSettings?: SEOSettings | null; }

const ContactPage: React.FC<ContactPageProps> = ({ content, seoSettings }) => {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pageSEO, setPageSEO] = useState<PageSEO | null>(null);
    useEffect(() => { seoAPI.getPageSEO('/iletisim').then(setPageSEO).catch(()=>{}); }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); setLoading(true); setError(null);
        const fd = new FormData(e.currentTarget);
        try {
            await contactMessagesAPI.create({ name:fd.get('name') as string, email:fd.get('email') as string, phone:fd.get('phone') as string||undefined, subject:fd.get('subject') as string||undefined, message:fd.get('message') as string });
            setSubmitted(true); e.currentTarget.reset();
        } catch { setError('Mesaj gönderilemedi. Lütfen tekrar deneyin.'); }
        finally { setLoading(false); }
    };

    return (<>
        <SEOHead seoSettings={seoSettings||undefined} pageSEO={pageSEO||undefined}
            pageTitle="İletişim" pageDescription="Akaydın Tarım iletişim bilgileri."
            pageKeywords="iletişim, adres, telefon" />

        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden" style={{background:'linear-gradient(135deg, #0f1f10 0%, #142218 60%, #1a2a1a 100%)'}}>
            <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")'}}></div>
            <div className="container relative z-10">
                <p className="text-accent-bg/60 text-xs font-semibold tracking-[0.2em] uppercase mb-4">İletişim</p>
                <h1 className="text-4xl md:text-6xl font-[family-name:var(--font-display)] font-bold text-white mb-4">Bize ulaşın</h1>
                <p className="text-lg text-white/60 max-w-xl">Sorularınız, önerileriniz veya işbirliği talepleriniz için buradayız.</p>
            </div>
        </section>

        {/* Form + Info — yan yana */}
        <section className="section bg-surface">
            <div className="container">
                <div className="grid lg:grid-cols-5 gap-12">
                    {/* Form */}
                    <div className="lg:col-span-3">
                        {submitted ? (
                            <div className="text-center py-12 px-8 rounded-3xl bg-accent-bg border border-accent/20">
                                <div className="text-5xl mb-4">✅</div>
                                <h2 className="text-2xl font-[family-name:var(--font-display)] font-bold text-ink mb-2">Teşekkürler!</h2>
                                <p className="text-ink-2 mb-6">Mesajınız başarıyla gönderildi. En kısa sürede dönüş yapacağız.</p>
                                <button onClick={()=>setSubmitted(false)} className="btn btn-primary">Yeni Mesaj Gönder</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="name" className="block text-xs font-semibold text-ink-2 mb-2">Adınız Soyadınız *</label>
                                        <input id="name" name="name" required className="w-full px-4 py-3 rounded-xl border border-rule bg-paper-2 text-ink placeholder:text-ink-3 focus:border-accent focus:ring-1 focus:ring-accent transition-colors text-sm" placeholder="Ad Soyad" />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-xs font-semibold text-ink-2 mb-2">E-posta *</label>
                                        <input id="email" name="email" type="email" required className="w-full px-4 py-3 rounded-xl border border-rule bg-paper-2 text-ink placeholder:text-ink-3 focus:border-accent focus:ring-1 focus:ring-accent transition-colors text-sm" placeholder="ornek@email.com" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-xs font-semibold text-ink-2 mb-2">Konu</label>
                                    <select id="subject" name="subject" className="w-full px-4 py-3 rounded-xl border border-rule bg-paper-2 text-ink focus:border-accent transition-colors text-sm">
                                        <option value="">Konu seçin</option>
                                        <option>Fındık İşleme Hizmeti</option><option>Ürün Bilgileri</option><option>Hizmet Talebi</option><option>Genel Bilgi</option><option>Diğer</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-xs font-semibold text-ink-2 mb-2">Mesajınız *</label>
                                    <textarea id="message" name="message" rows={5} required className="w-full px-4 py-3 rounded-xl border border-rule bg-paper-2 text-ink placeholder:text-ink-3 focus:border-accent focus:ring-1 focus:ring-accent transition-colors text-sm resize-none" placeholder="Mesajınızı yazın..." />
                                </div>
                                {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
                                <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                                    {loading ? <><svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Gönderiliyor...</> : 'Mesajı Gönder'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Info + Map */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-5">
                            {[
                                {icon:'📍',label:'Adres',val:content.address},
                                {icon:'📞',label:'Telefon',val:content.phone,href:`tel:${content.phone}`},
                                {icon:'📱',label:'WhatsApp',val:content.whatsapp_phone, href:content.whatsapp_phone ? `https://wa.me/${content.whatsapp_phone.replace(/[^\d]/g,'')}` : undefined},
                                {icon:'✉️',label:'E-posta',val:content.email,href:`mailto:${content.email}`},
                            ].filter(x=>x.val).map((x,i)=>(
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-paper-2">
                                    <span className="text-xl shrink-0 mt-0.5">{x.icon}</span>
                                    <div>
                                        <p className="text-xs font-semibold text-ink-3 uppercase mb-0.5">{x.label}</p>
                                        {x.href ? <a href={x.href} target={x.label==='WhatsApp'?'_blank':undefined} rel="noopener noreferrer" className="text-ink font-medium hover:text-accent transition-colors">{x.val}</a>
                                        : <p className="text-ink font-medium">{x.val}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Map */}
                        <div className="rounded-2xl overflow-hidden border border-rule h-64">
                            {content.map_embed ? (
                                <div dangerouslySetInnerHTML={{__html:content.map_embed}} className="w-full h-full" />
                            ) : (
                                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1510.27850536581!2d30.74360289255156!3d40.793752100200535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x409d8f614e52c30d%3A0x25ed3a760cc228ca!2zQWtheWTEsW4gdGFyxLFt!5e0!3m2!1str!2str!4v1752202785920"
                                    width="100%" height="100%" style={{border:0}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Konum" />
                            )}
                        </div>

                        {/* Social */}
                        {(content.facebook_url||content.instagram_url||content.youtube_url) && (
                            <div className="flex flex-wrap gap-2">
                                {content.facebook_url && <a href={content.facebook_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">📘 Facebook</a>}
                                {content.instagram_url && <a href={content.instagram_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition-colors">📷 Instagram</a>}
                                {content.youtube_url && <a href={content.youtube_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">🎥 YouTube</a>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>

        {/* CTA */}
        <section className="section bg-paper-2">
            <div className="container text-center">
                <div className="max-w-xl mx-auto p-10 rounded-3xl border-2 border-accent/20 bg-accent-bg/30">
                    <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-display)] font-bold text-ink mb-4">Hemen aramak ister misiniz?</h2>
                    <p className="text-ink-2 mb-8">Acil sorularınız için direkt telefon hattımız.</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <a href={`tel:${content.phone}`} className="btn btn-primary btn-lg">📞 {content.phone}</a>
                        {content.whatsapp_phone && <a href={`https://wa.me/${content.whatsapp_phone.replace(/[^\d]/g,'')}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline">WhatsApp</a>}
                    </div>
                </div>
            </div>
        </section>
    </>);
};

export default ContactPage;
