import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { BlogPost, Notification } from '../../types';
import { blogAPI } from '../../services/api';
import ConfirmModal from '../ConfirmModal';

const STATIC_URL = import.meta.env.VITE_STATIC_URL || 'http://localhost:3003';
const imgUrl = (path: string) => path ? `${STATIC_URL}${path}` : '';

// ── SEO otomatik doldurma yardımcıları ──

/** HTML etiketlerini temizle */
const stripHtml = (html: string): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
};

/** Metinden anahtar kelime çıkar (2-4 kelimelik anlamlı öbekler) */
const extractKeywords = (title: string, content: string): string[] => {
    const text = `${title} ${stripHtml(content)}`.toLowerCase();
    // Türkçe stop words + genel
    const stops = new Set(['ve','veya','ile','için','bir','bu','da','de','ki','ise','ama','fakat','çok','daha','olarak','gibi','kadar','sonra','önce','her','şu','o','ne','nasıl','nerede','hangi','kim','neden']);
    const words = text.split(/[\s,.;:!?()\[\]{}"'\n\r\t]+/).filter(w => w.length > 2 && !stops.has(w));
    const freq: Record<string, number> = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([w]) => w);
};

interface BlogManagementProps {
    blogPosts: BlogPost[];
    setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    addNotification: (type: Notification['type'], title: string, message: string) => void;
}

const BlogManagement: React.FC<BlogManagementProps> = ({
    blogPosts,
    setBlogPosts,
    loading,
    setLoading,
    addNotification
}) => {
    const [currentBlogPost, setCurrentBlogPost] = useState<BlogPost | null>(null);
    const [blogForm, setBlogForm] = useState({
        title: '',
        content: '',
        excerpt: '',
        author: '',
        seo_title: '',
        seo_description: '',
        seo_keywords: ''
    });
    const [blogImage, setBlogImage] = useState<File | null>(null);
    const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    // SEO alanlarına manuel müdahale edildi mi?
    const seoTouched = useRef({ title: false, desc: false, keywords: false });

    // ── SEO otomatik doldurma ──
    const autoFillSEO = useCallback(() => {
        const updates: Partial<typeof blogForm> = {};

        if (!seoTouched.current.title && blogForm.title) {
            const cleanTitle = stripHtml(blogForm.title);
            const seoTitle = cleanTitle.length > 55 ? cleanTitle.slice(0, 55) + '...' : cleanTitle;
            updates.seo_title = `${seoTitle} | Akaydın Tarım`;
        }

        if (!seoTouched.current.desc) {
            const source = blogForm.excerpt || stripHtml(blogForm.content);
            const desc = source.slice(0, 155).trim();
            updates.seo_description = desc.length < source.length ? desc + '...' : desc;
        }

        if (!seoTouched.current.keywords && blogForm.title) {
            const keywords = extractKeywords(blogForm.title, blogForm.content);
            updates.seo_keywords = keywords.join(', ');
        }

        if (Object.keys(updates).length > 0) {
            setBlogForm(f => ({ ...f, ...updates }));
        }
    }, [blogForm.title, blogForm.content, blogForm.excerpt]);

    useEffect(() => {
        if (isBlogModalOpen) {
            const timer = setTimeout(autoFillSEO, 600);
            return () => clearTimeout(timer);
        }
    }, [blogForm.title, blogForm.content, blogForm.excerpt, isBlogModalOpen]);

    // Modal her açıldığında touched flag'leri sıfırla
    const resetSEOTouched = () => {
        seoTouched.current = { title: false, desc: false, keywords: false };
    };

    const handleBlogSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // -- SEO alanlari bossa oneri toast'i goster --
        var missingSeo = [];
        if (!blogForm.seo_title.trim()) missingSeo.push("SEO Basligi");
        if (!blogForm.seo_description.trim()) missingSeo.push("SEO Aciklamasi");
        if (!blogForm.seo_keywords.trim()) missingSeo.push("SEO Anahtar Kelimeleri");
        if (missingSeo.length > 0) {
            addNotification("warning", "SEO Onerisi", missingSeo.join(", ") + " alanlari bos. Sunucu otomatik dolduracak, ancak manuel girmeniz onerilir.");
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', blogForm.title);
            formData.append('content', blogForm.content);
            formData.append('excerpt', blogForm.excerpt);
            formData.append('author', blogForm.author);
            formData.append('seo_title', blogForm.seo_title);
            formData.append('seo_description', blogForm.seo_description);
            formData.append('seo_keywords', blogForm.seo_keywords);

            if (blogImage) {
                formData.append('image', blogImage);
            }

            if (currentBlogPost) {
                const updatedPost = await blogAPI.update(Number(currentBlogPost.id), formData);
                setBlogPosts(prev => prev.map(post =>
                    post.id === currentBlogPost.id
                        ? {
                            ...updatedPost,
                            id: updatedPost.id.toString(),
                            imageUrl: updatedPost.image_url ? imgUrl(updatedPost.image_url) : '/placeholder.svg'
                        }
                        : post
                ));
                addNotification('success', 'Başarılı!', 'Blog yazısı güncellendi.');
            } else {
                const newPost = await blogAPI.create(formData);
                setBlogPosts(prev => [...prev, {
                    ...newPost,
                    id: newPost.id.toString(),
                    imageUrl: newPost.image_url ? imgUrl(newPost.image_url) : '/placeholder.svg'
                }]);
                addNotification('success', 'Başarılı!', 'Yeni blog yazısı yayınlandı.');
            }

            closeBlogModal();
        } catch (error) {
            addNotification('error', 'Hata!', 'Blog yazısı kaydedilirken hata oluştu:');
            addNotification('error', 'Hata!', 'Blog yazısı kaydedilirken hata oluştu.');
        }
        setLoading(false);
    };

    const openBlogModal = (post?: BlogPost) => {
        resetSEOTouched();
        if (post) {
            setCurrentBlogPost(post);
            setBlogForm({
                title: post.title,
                content: post.content || '',
                excerpt: post.excerpt || '',
                author: post.author,
                seo_title: post.seo_title || '',
                seo_description: post.seo_description || '',
                seo_keywords: post.seo_keywords || ''
            });
            // Mevcut SEO değerleri varsa touched say
            if (post.seo_title) seoTouched.current.title = true;
            if (post.seo_description) seoTouched.current.desc = true;
            if (post.seo_keywords) seoTouched.current.keywords = true;
        } else {
            setCurrentBlogPost(null);
            setBlogForm({ title: '', content: '', excerpt: '', author: '', seo_title: '', seo_description: '', seo_keywords: '' });
        }
        setBlogImage(null);
        setIsBlogModalOpen(true);
    };

    const closeBlogModal = () => {
        resetSEOTouched();
        setCurrentBlogPost(null);
        setBlogForm({ title: '', content: '', excerpt: '', author: '', seo_title: '', seo_description: '', seo_keywords: '' });
        setBlogImage(null);
        setIsBlogModalOpen(false);
    };

        const handleBlogDelete = (id: string) => {
        setDeleteConfirm(id);
    };

    const confirmBlogDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await blogAPI.delete(Number(deleteConfirm));
            setBlogPosts(prev => prev.filter(post => post.id !== deleteConfirm));
            addNotification('success', 'Başarılı!', 'Blog yazısı silindi.');
        } catch (error) {
            addNotification('error', 'Hata!', 'Blog yazısı silinirken hata oluştu.');
        }
        setDeleteConfirm(null);
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">📝 Blog Yönetimi</h2>
                        <button
                            onClick={() => openBlogModal()}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors"
                        >
                            ➕ Yeni Blog Yazısı
                        </button>
                    </div>

                    {/* Blog Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-blue-500 text-xl">📝</span>
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">{blogPosts.length}</div>
                                    <div className="text-sm text-blue-600">Toplam Yazı</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-green-500 text-xl">👁️</span>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {blogPosts.reduce((total, post) => total + (post.views || 0), 0)}
                                    </div>
                                    <div className="text-sm text-green-600">Toplam Görüntüleme</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-purple-500 text-xl">🕒</span>
                                <div>
                                    <div className="text-sm font-bold text-purple-600">
                                        {(() => {
                                            if (blogPosts.length === 0) return 'Henüz yok';
                                            try {
                                                const validDates = blogPosts
                                                    .map(p => new Date(p.date))
                                                    .filter(date => !isNaN(date.getTime()));

                                                if (validDates.length === 0) return 'Tarih bilinmiyor';

                                                const latestDate = new Date(Math.max(...validDates.map(d => d.getTime())));
                                                return latestDate.toLocaleDateString('tr-TR');
                                            } catch {
                                                return 'Tarih bilinmiyor';
                                            }
                                        })()}
                                    </div>
                                    <div className="text-sm text-purple-600">Son Yayın</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Blog Posts List */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Blog Yazıları ({blogPosts.length})
                    </h3>

                    {blogPosts.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📝</div>
                            <p className="text-gray-500 text-lg">Henüz blog yazısı yayınlanmamış.</p>
                            <button
                                onClick={() => openBlogModal()}
                                className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium transition-colors"
                            >
                                ➕ İlk Yazıyı Yayınla
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {blogPosts.map((post) => (
                                <div key={post.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300">
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Blog Image */}
                                        <div className="lg:w-48 h-32 flex-shrink-0">
                                            <img
                                                src={post.imageUrl || '/placeholder.svg'}
                                                alt={post.title}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        </div>

                                        {/* Blog Content */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-lg font-bold text-gray-900 line-clamp-2">{post.title}</h4>
                                                <div className="flex space-x-2 ml-4">
                                                    <button
                                                        onClick={() => openBlogModal(post)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-full transition-colors"
                                                        title="Düzenle"
                                                    >
                                                        ✏️ Düzenle
                                                    </button>
                                                    <button
                                                        onClick={() => handleBlogDelete(post.id)}
                                                        className="text-red-600 hover:text-red-800 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full transition-colors"
                                                        title="Sil"
                                                    >
                                                        🗑️ Sil
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>

                                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center space-x-1">
                                                    <span>✍️</span>
                                                    <span>{post.author}</span>
                                                </span>
                                                <span className="flex items-center space-x-1">
                                                    <span>📅</span>
                                                    <span>{
                                                        (() => {
                                                            try {
                                                                const date = new Date(post.date);
                                                                return !isNaN(date.getTime())
                                                                    ? date.toLocaleDateString('tr-TR')
                                                                    : 'Tarih bilinmiyor';
                                                            } catch {
                                                                return 'Tarih bilinmiyor';
                                                            }
                                                        })()
                                                    }</span>
                                                </span>
                                                {post.views && (
                                                    <span className="flex items-center space-x-1">
                                                        <span>👁️</span>
                                                        <span>{post.views} görüntüleme</span>
                                                    </span>
                                                )}
                                                <span className="flex items-center space-x-1">
                                                    <span>📊</span>
                                                    <span>{post.content?.length || 0} karakter</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Blog Modal */}
            {isBlogModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white rounded-t-xl border-b border-gray-200 p-6 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">
                                {currentBlogPost ? '✏️ Blog Yazısını Düzenle' : '➕ Yeni Blog Yazısı Ekle'}
                            </h3>
                            <button
                                onClick={closeBlogModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleBlogSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">📝 Blog Başlığı</label>
                                    <input
                                        type="text"
                                        placeholder="Blog yazısının başlığını girin..."
                                        value={blogForm.title}
                                        onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">👤 Yazar</label>
                                    <input
                                        type="text"
                                        placeholder="Yazar adı..."
                                        value={blogForm.author}
                                        onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">📷 Blog Görseli</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setBlogImage(e.target.files?.[0] || null)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">📄 Kısa Özet</label>
                                    <textarea
                                        placeholder="Blog yazısının kısa özeti (maksimum 200 karakter)..."
                                        value={blogForm.excerpt}
                                        onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        maxLength={200}
                                        required
                                    />
                                    <div className="text-right text-xs text-gray-500 mt-1">
                                        {blogForm.excerpt.length}/200 karakter
                                    </div>
                                </div>

                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">📝 Ana İçerik</label>
                                    <textarea
                                        placeholder="Blog yazısının detaylı içeriği..."
                                        value={blogForm.content}
                                        onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 h-48 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* SEO Fields */}
                                <div className="lg:col-span-2 border-t pt-4 mt-2">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            🔍 SEO Ayarları
                                            <span className="text-[10px] font-normal bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Otomatik Doldurulur</span>
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                seoTouched.current = { title: false, desc: false, keywords: false };
                                                autoFillSEO();
                                            }}
                                            className="text-xs text-accent hover:text-accent-2 underline"
                                            title="SEO alanlarını başlık ve içerikten otomatik doldur"
                                        >
                                            🔄 Yeniden Oluştur
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                SEO Başlığı
                                                {!seoTouched.current.title && blogForm.seo_title && <span className="text-green-500 ml-1 text-[10px]">(oto)</span>}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Otomatik doldurulacak - SEO başlığı (60 karakter)"
                                                value={blogForm.seo_title}
                                                onChange={(e) => { seoTouched.current.title = true; setBlogForm({ ...blogForm, seo_title: e.target.value }); }}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                maxLength={60}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                SEO Açıklaması
                                                {!seoTouched.current.desc && blogForm.seo_description && <span className="text-green-500 ml-1 text-[10px]">(oto)</span>}
                                            </label>
                                            <textarea
                                                placeholder="Otomatik doldurulacak - SEO açıklaması (160 karakter)"
                                                value={blogForm.seo_description}
                                                onChange={(e) => { seoTouched.current.desc = true; setBlogForm({ ...blogForm, seo_description: e.target.value }); }}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 h-16 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                maxLength={160}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                SEO Anahtar Kelimeleri
                                                {!seoTouched.current.keywords && blogForm.seo_keywords && <span className="text-green-500 ml-1 text-[10px]">(oto)</span>}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Otomatik doldurulacak - fındık, tarım, hendek"
                                                value={blogForm.seo_keywords}
                                                onChange={(e) => { seoTouched.current.keywords = true; setBlogForm({ ...blogForm, seo_keywords: e.target.value }); }}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {currentBlogPost && currentBlogPost.imageUrl && (
                                    <div className="lg:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">🖼️ Mevcut Görsel</label>
                                        <img
                                            src={imgUrl(currentBlogPost.imageUrl) || currentBlogPost.imageUrl}
                                            alt={currentBlogPost.title}
                                            className="w-full max-w-md h-48 object-cover rounded-lg border"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors flex-1"
                                >
                                    {loading ? '⏳ Kaydediliyor...' : (currentBlogPost ? '✅ Güncelle' : '📝 Yayınla')}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeBlogModal}
                                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-medium transition-colors"
                                >
                                    ❌ İptal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmModal
                isOpen={deleteConfirm !== null}
                title="Silme Onayı"
                message="Bu blog yazısını silmek istediğinizden emin misiniz?"
                onConfirm={confirmBlogDelete}
                onCancel={() => setDeleteConfirm(null)}
            />
        </>
    );
};

export default BlogManagement;
