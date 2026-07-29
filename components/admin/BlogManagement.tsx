import React, { useState } from 'react';
import type { BlogPost, Notification } from '../../types';
import { blogAPI } from '../../services/api';

const STATIC_URL = import.meta.env.VITE_STATIC_URL || 'http://localhost:3003';
const imgUrl = (path: string) => path ? `${STATIC_URL}${path}` : '';

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

    const handleBlogSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                            imageUrl: updatedPost.image_url ? imgUrl(updatedPost.image_url) : 'https://picsum.photos/400/250?random=1'
                        }
                        : post
                ));
                addNotification('success', 'Başarılı!', 'Blog yazısı güncellendi.');
            } else {
                const newPost = await blogAPI.create(formData);
                setBlogPosts(prev => [...prev, {
                    ...newPost,
                    id: newPost.id.toString(),
                    imageUrl: newPost.image_url ? imgUrl(newPost.image_url) : 'https://picsum.photos/400/250?random=1'
                }]);
                addNotification('success', 'Başarılı!', 'Yeni blog yazısı yayınlandı.');
            }

            closeBlogModal();
        } catch (error) {
            console.error('Blog yazısı kaydedilirken hata oluştu:', error);
            addNotification('error', 'Hata!', 'Blog yazısı kaydedilirken hata oluştu.');
        }
        setLoading(false);
    };

    const openBlogModal = (post?: BlogPost) => {
        if (post) {
            setCurrentBlogPost(post);
            setBlogForm({
                title: post.title,
                content: post.content || '',
                excerpt: post.excerpt || '',
                author: post.author,
                seo_title: (post as any).seo_title || '',
                seo_description: (post as any).seo_description || '',
                seo_keywords: (post as any).seo_keywords || ''
            });
        } else {
            setCurrentBlogPost(null);
            setBlogForm({ title: '', content: '', excerpt: '', author: '', seo_title: '', seo_description: '', seo_keywords: '' });
        }
        setBlogImage(null);
        setIsBlogModalOpen(true);
    };

    const closeBlogModal = () => {
        setCurrentBlogPost(null);
        setBlogForm({ title: '', content: '', excerpt: '', author: '', seo_title: '', seo_description: '', seo_keywords: '' });
        setBlogImage(null);
        setIsBlogModalOpen(false);
    };

    const handleBlogDelete = async (id: string) => {
        if (confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
            try {
                await blogAPI.delete(Number(id));
                setBlogPosts(prev => prev.filter(post => post.id !== id));
                addNotification('success', 'Başarılı!', 'Blog yazısı silindi.');
            } catch (error) {
                console.error('Blog yazısı silinirken hata oluştu:', error);
                addNotification('error', 'Hata!', 'Blog yazısı silinirken hata oluştu.');
            }
        }
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
                                                src={post.imageUrl || 'https://picsum.photos/400/250?random=1'}
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
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">🔍 SEO Ayarları (Opsiyonel)</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">SEO Başlığı</label>
                                            <input
                                                type="text"
                                                placeholder="SEO başlığı (60 karakter)"
                                                value={blogForm.seo_title}
                                                onChange={(e) => setBlogForm({ ...blogForm, seo_title: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                maxLength={60}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">SEO Açıklaması</label>
                                            <textarea
                                                placeholder="SEO açıklaması (160 karakter)"
                                                value={blogForm.seo_description}
                                                onChange={(e) => setBlogForm({ ...blogForm, seo_description: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 h-16 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                maxLength={160}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">SEO Anahtar Kelimeleri</label>
                                            <input
                                                type="text"
                                                placeholder="fındık, tarım, hendek"
                                                value={blogForm.seo_keywords}
                                                onChange={(e) => setBlogForm({ ...blogForm, seo_keywords: e.target.value })}
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
        </>
    );
};

export default BlogManagement;
