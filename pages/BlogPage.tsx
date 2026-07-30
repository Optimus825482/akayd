import React, { useState, useEffect } from 'react';
import type { BlogPost, SEOSettings, PageSEO } from '../types';
import BlogPostCard from '../components/BlogPostCard';
import SEOHead from '../components/SEOHead';
import { blogAPI, seoAPI } from '../services/api';

interface BlogPageProps { blogPosts: BlogPost[]; seoSettings?: SEOSettings | null; }

const BlogPage: React.FC<BlogPageProps> = ({ blogPosts, seoSettings }) => {
    const [selected, setSelected] = useState<BlogPost | null>(null);
    const [pageSEO, setPageSEO] = useState<PageSEO | null>(null);
    useEffect(() => { seoAPI.getPageSEO('/blog').then(setPageSEO).catch(()=>{}); }, []);

    const openPost = async (post: BlogPost) => { try { await blogAPI.incrementView(Number(post.id)); } catch {} setSelected(post); };

    return (<>
        <SEOHead seoSettings={seoSettings||undefined} pageSEO={pageSEO||undefined}
            pageTitle="Fındık ve Tarım Blogu | Hendek Fındık Rehberi | Akaydın Tarım"
            pageDescription="Hendek fındık üretimi, fındık kırma, kavurma ve paketleme hakkında uzman ipuçları, güncel tarım yazıları ve rehberler. Hendek/Sakarya tarım blogu."
            pageKeywords="fındık blog, hendek fındık, hendek fındık kırma, fındık kavurma, fındık kırma kavurma vakumlu paketleme, tarım blogu, hendek fındık kavurma paketleme, fındık üretimi, hendek tarım, sakarya fındık, fındık rehberi, vakumlu paketleme"
            breadcrumbItems={[
                { name: 'Ana Sayfa', url: (seoSettings?.canonical_url || 'https://www.akaydintarim.com.tr') + '/' },
                { name: 'Blog', url: (seoSettings?.canonical_url || 'https://www.akaydintarim.com.tr') + '/blog' }
            ]} />

        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden" style={{background:'linear-gradient(135deg, #0f1f10 0%, #142218 60%, #1a2a1a 100%)'}}>
            <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")'}}></div>
            <div className="container relative z-10">
                <p className="text-accent-bg/60 text-xs font-semibold tracking-[0.2em] uppercase mb-4">Hendek Fındık Rehberi</p>
                <h1 className="text-4xl md:text-6xl font-[family-name:var(--font-display)] font-bold text-white mb-4">Fındık ve Tarım Blogu</h1>
                <p className="text-lg text-white/60 max-w-xl">Hendek fındık üretimi, fındık kırma kavurma, vakumlu paketleme ve tarım dünyasındaki son gelişmeler, ipuçları ve uzman görüşleri.</p>
            </div>
        </section>

        {/* Blog grid */}
        <section className="section bg-surface">
            <div className="container">
                {blogPosts.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogPosts.map((p,i) => (
                            <div key={p.id} className={`animate-fade-in-up ${i===0 ? 'lg:col-span-2 lg:row-span-2' : ''}`} style={{animationDelay:`${i*0.08}s`}}>
                                <BlogPostCard post={p} onReadMore={() => openPost(p)} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">📝</div>
                        <p className="text-ink-2 text-lg">Henüz blog yazısı yok.</p>
                    </div>
                )}
            </div>
        </section>

        {/* Modal */}
        {selected && (
            <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
                <div className="bg-surface rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={e=>e.stopPropagation()}>
                    {selected.imageUrl && <img src={selected.imageUrl} alt={selected.title} className="w-full h-48 md:h-64 object-cover" />}
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BlogPosting',
                        headline: selected.title,
                        description: selected.summary || selected.excerpt || '',
                        image: selected.imageUrl,
                        datePublished: selected.date,
                        author: { '@type': 'Person', name: selected.author },
                        publisher: { '@type': 'Organization', name: 'Akaydin Tarim' }
                    }) }} />
                    <div className="p-8">
                        <div className="flex items-center gap-3 text-xs text-ink-3 mb-4">
                            <span>{selected.author}</span><span>·</span><span>{selected.date}</span>
                            {selected.views !== undefined && <><span>·</span><span>{selected.views} okunma</span></>}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-display)] font-bold text-ink mb-4">{selected.title}</h2>
                        <p className="text-ink-2 leading-relaxed mb-6">{selected.summary}</p>
                        {selected.content && (
                            <div className="prose prose-sm max-w-none text-ink-2" dangerouslySetInnerHTML={{__html:selected.content.includes('<')?selected.content:selected.content.replace(/\n/g,'<br/>')}} />
                        )}
                        <button onClick={()=>setSelected(null)} className="mt-8 btn btn-primary w-full">Kapat</button>
                    </div>
                </div>
            </div>
        )}
    </>);
};

export default BlogPage;
