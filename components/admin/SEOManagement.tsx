import React, { useState, useEffect } from 'react';
import type { SEOSettings, PageSEO, SEOAnalysis } from '../../types';
import { seoAPI } from '../../services/api';

interface SEOManagementProps {
    addNotification: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

const SEOManagement: React.FC<SEOManagementProps> = ({ addNotification }) => {
    const [activeTab, setActiveTab] = useState<'settings' | 'pages' | 'analysis' | 'sitemap'>('settings');
    const [loading, setLoading] = useState(false);

    // SEO Settings State
    const [seoSettings, setSeoSettings] = useState<SEOSettings>({
        site_title: '',
        site_description: '',
        site_keywords: '',
        site_author: '',
        og_title: '',
        og_description: '',
        og_image: '',
        og_url: '',
        twitter_card: 'summary_large_image',
        twitter_site: '',
        twitter_creator: '',
        canonical_url: '',
        robots_txt: '',
        google_analytics_id: '',
        google_search_console: '',
        facebook_pixel_id: '',
        schema_organization: '',
        sitemap_enabled: true
    });

    // Page SEO State
    const [pageSEOList, setPageSEOList] = useState<PageSEO[]>([]);
    const [newPageSEO, setNewPageSEO] = useState<Partial<PageSEO>>({
        page_path: '',
        page_title: '',
        meta_description: '',
        meta_keywords: '',
        og_title: '',
        og_description: '',
        og_image: '',
        canonical_url: '',
        noindex: false,
        nofollow: false
    });
    // P1-16: düzenleme modunda id — kaydedince update, yoksa create (duplicate önleme)
    const [editingPageSEOId, setEditingPageSEOId] = useState<number | null>(null);

    // SEO Analysis State
    const [analysisUrl, setAnalysisUrl] = useState('');
    const [analysisResult, setAnalysisResult] = useState<SEOAnalysis | null>(null);

    // Load data
    useEffect(() => {
        loadSEOSettings();
        loadPageSEO();
    }, []);

    const loadSEOSettings = async () => {
        try {
            const data = await seoAPI.getSettings();
            setSeoSettings({ ...seoSettings, ...data });
        } catch (error) {
            addNotification('error', 'Hata!', 'SEO ayarları yüklenirken hata:');
        }
    };

    const loadPageSEO = async () => {
        try {
            const data = await seoAPI.getAllPageSEO();
            setPageSEOList(data);
        } catch (error) {
            addNotification('error', 'Hata!', 'Sayfa SEO verileri yüklenirken hata:');
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await seoAPI.updateSettings(seoSettings);
            addNotification('success', 'Başarılı!', 'SEO ayarları güncellendi.');
        } catch (error) {
            addNotification('error', 'Hata!', 'SEO ayarları güncellenirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPageSEO = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingPageSEOId !== null) {
                await seoAPI.updatePageSEO(editingPageSEOId, newPageSEO);
                addNotification('success', 'Başarılı!', 'Sayfa SEO ayarı güncellendi.');
            } else {
                await seoAPI.createPageSEO(newPageSEO);
                addNotification('success', 'Başarılı!', 'Sayfa SEO ayarı eklendi.');
            }
            setNewPageSEO({
                page_path: '',
                page_title: '',
                meta_description: '',
                meta_keywords: '',
                og_title: '',
                og_description: '',
                og_image: '',
                canonical_url: '',
                noindex: false,
                nofollow: false
            });
            setEditingPageSEOId(null);
            loadPageSEO();
        } catch (error) {
            addNotification('error', 'Hata!', 'Sayfa SEO ayarı kaydedilirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzePage = async () => {
        if (!analysisUrl) return;
        setLoading(true);
        try {
            const result = await seoAPI.analyzePage(analysisUrl);
            setAnalysisResult(result);
            addNotification('info', 'Analiz Tamamlandı', 'SEO analizi başarıyla tamamlandı.');
        } catch (error) {
            addNotification('error', 'Hata!', 'SEO analizi yapılırken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSitemap = async () => {
        setLoading(true);
        try {
            await seoAPI.generateSitemap();
            addNotification('success', 'Başarılı!', 'Sitemap yeniden oluşturuldu.');
        } catch (error) {
            addNotification('error', 'Hata!', 'Sitemap oluşturulurken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white text-xl">🔍</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">SEO Yönetimi</h2>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
                    {[
                        { id: 'settings', label: '⚙️ Genel Ayarlar', icon: '⚙️' },
                        { id: 'pages', label: '📄 Sayfa SEO', icon: '📄' },
                        { id: 'analysis', label: '📊 SEO Analizi', icon: '📊' },
                        { id: 'sitemap', label: '🗺️ Sitemap', icon: '🗺️' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Temel SEO Bilgileri */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">🌐 Temel SEO Bilgileri</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Başlığı</label>
                                    <input
                                        type="text"
                                        value={seoSettings.site_title}
                                        onChange={(e) => setSeoSettings({ ...seoSettings, site_title: e.target.value })}
                                        className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500"
                                        placeholder="Akaydın Tarım - Fındık Üretimi ve Satışı"
                                        maxLength={60}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{seoSettings.site_title.length}/60 karakter</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Açıklaması</label>
                                    <textarea
                                        value={seoSettings.site_description}
                                        onChange={(e) => setSeoSettings({ ...seoSettings, site_description: e.target.value })}
                                        className="border border-gray-300 rounded-lg px-4 py-3 h-24 w-full focus:ring-2 focus:ring-blue-500"
                                        placeholder="Kaliteli fındık üretimi ve satışı. Hendek/Sakarya'da organik tarım ürünleri."
                                        maxLength={160}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{seoSettings.site_description.length}/160 karakter</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Anahtar Kelimeler</label>
                                    <input
                                        type="text"
                                        value={seoSettings.site_keywords}
                                        onChange={(e) => setSeoSettings({ ...seoSettings, site_keywords: e.target.value })}
                                        className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500"
                                        placeholder="fındık, tarım, hendek, sakarya, organik"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Sahibi</label>
                                    <input
                                        type="text"
                                        value={seoSettings.site_author}
                                        onChange={(e) => setSeoSettings({ ...seoSettings, site_author: e.target.value })}
                                        className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500"
                                        placeholder="Akaydın Tarım"
                                    />
                                </div>
                            </div>

                            {/* Open Graph & Social Media */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">📱 Sosyal Medya (Open Graph)</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">OG Başlığı</label>
                                    <input
                                        type="text"
                                        value={seoSettings.og_title}
                                        onChange={(e) => setSeoSettings({ ...seoSettings, og_title: e.target.value })}
                                        className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500"
                                        placeholder="Akaydın Tarım - Premium Fındık Üreticisi"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">OG Açıklaması</label>
                                    <textarea
                                        value={seoSettings.og_description}
                                        onChange={(e) => setSeoSettings({ ...seoSettings, og_description: e.target.value })}
                                        className="border border-gray-300 rounded-lg px-4 py-3 h-20 w-full focus:ring-2 focus:ring-blue-500"
                                        placeholder="Hendek/Sakarya'da kaliteli fındık üretimi"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">OG Resmi URL</label>
                                    <input
                                        type="url"
                                        value={seoSettings.og_image}
                                        onChange={(e) => setSeoSettings({ ...seoSettings, og_image: e.target.value })}
                                        className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500"
                                        placeholder="https://www.akaydintarim.com.tr/images/og-image.jpg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Twitter Card Türü</label>
                                    <select
                                        value={seoSettings.twitter_card}
                                        onChange={(e) => setSeoSettings({ ...seoSettings, twitter_card: e.target.value as any })}
                                        className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="summary">Summary</option>
                                        <option value="summary_large_image">Summary Large Image</option>
                                        <option value="app">App</option>
                                        <option value="player">Player</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Twitter Site</label>
                                    <input
                                        type="text"
                                        value={seoSettings.twitter_site}
                                        onChange={(e) => setSeoSettings({ ...seoSettings, twitter_site: e.target.value })}
                                        className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500"
                                        placeholder="@akaydintarim"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Analytics & Tracking */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">📈 Google Analytics ID</label>
                                <input
                                    type="text"
                                    value={seoSettings.google_analytics_id || ''}
                                    onChange={(e) => setSeoSettings({ ...seoSettings, google_analytics_id: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500"
                                    placeholder="G-XXXXXXXXXX"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Search Console</label>
                                <input
                                    type="text"
                                    value={seoSettings.google_search_console || ''}
                                    onChange={(e) => setSeoSettings({ ...seoSettings, google_search_console: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500"
                                    placeholder="verification-code"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">📘 Facebook Pixel ID</label>
                                <input
                                    type="text"
                                    value={seoSettings.facebook_pixel_id || ''}
                                    onChange={(e) => setSeoSettings({ ...seoSettings, facebook_pixel_id: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500"
                                    placeholder="123456789012345"
                                />
                            </div>
                        </div>

                        {/* Canonical URL ve Robots.txt */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">🔗 Canonical URL</label>
                            <input
                                type="url"
                                value={seoSettings.canonical_url || ''}
                                onChange={(e) => setSeoSettings({ ...seoSettings, canonical_url: e.target.value })}
                                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500"
                                placeholder="https://www.akaydintarim.com.tr"
                            />
                            <p className="text-xs text-gray-500 mt-1">Sitemap bu URL'yi baz alır. Doğru domain yazdığınızdan emin olun.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">🤖 Robots.txt İçeriği</label>
                            <textarea
                                value={seoSettings.robots_txt}
                                onChange={(e) => setSeoSettings({ ...seoSettings, robots_txt: e.target.value })}
                                className="border border-gray-300 rounded-lg px-4 py-3 h-32 w-full focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                placeholder={`User-agent: *\nAllow: /\nSitemap: https://www.akaydintarim.com.tr/sitemap.xml`}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                            >
                                {loading ? 'Kaydediliyor...' : '💾 SEO Ayarlarını Kaydet'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Pages Tab */}
                {activeTab === 'pages' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">📄 Sayfa Bazlı SEO Ayarları</h3>

                        {/* Add New Page SEO */}
                        <form onSubmit={handleAddPageSEO} className="bg-gray-50 p-4 rounded-lg space-y-4">
                            <h4 className="font-medium text-gray-900">Yeni Sayfa SEO Ayarı Ekle</h4>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sayfa Yolu</label>
                                    <input
                                        type="text"
                                        value={newPageSEO.page_path || ''}
                                        onChange={(e) => setNewPageSEO({ ...newPageSEO, page_path: e.target.value })}
                                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500"
                                        placeholder="/urunler"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sayfa Başlığı</label>
                                    <input
                                        type="text"
                                        value={newPageSEO.page_title || ''}
                                        onChange={(e) => setNewPageSEO({ ...newPageSEO, page_title: e.target.value })}
                                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ürünlerimiz - Akaydın Tarım"
                                        required
                                    />
                                </div>

                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta Açıklaması</label>
                                    <textarea
                                        value={newPageSEO.meta_description || ''}
                                        onChange={(e) => setNewPageSEO({ ...newPageSEO, meta_description: e.target.value })}
                                        className="border border-gray-300 rounded-lg px-4 py-2 h-20 w-full focus:ring-2 focus:ring-blue-500"
                                        placeholder="Kaliteli fındık ürünlerimizi keşfedin"
                                        maxLength={160}
                                        required
                                    />
                                </div>

                                <div className="lg:col-span-2 flex items-center space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={newPageSEO.noindex || false}
                                            onChange={(e) => setNewPageSEO({ ...newPageSEO, noindex: e.target.checked })}
                                            className="mr-2"
                                        />
                                        No Index
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={newPageSEO.nofollow || false}
                                            onChange={(e) => setNewPageSEO({ ...newPageSEO, nofollow: e.target.checked })}
                                            className="mr-2"
                                        />
                                        No Follow
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                ➕ Sayfa SEO Ekle
                            </button>
                        </form>

                        {/* Existing Page SEO List */}
                        <div className="space-y-3">
                            {pageSEOList.map((pageSEO) => (
                                <div key={pageSEO.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h5 className="font-medium text-gray-900">{pageSEO.page_path}</h5>
                                                {pageSEO.noindex && <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">No Index</span>}
                                                {pageSEO.nofollow && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">No Follow</span>}
                                            </div>
                                            <p className="text-sm text-gray-600">{pageSEO.page_title}</p>
                                            {pageSEO.meta_description && (
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{pageSEO.meta_description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            <button
                                                onClick={() => {
                                                    setNewPageSEO({
                                                        page_path: pageSEO.page_path,
                                                        page_title: pageSEO.page_title,
                                                        meta_description: pageSEO.meta_description,
                                                        meta_keywords: pageSEO.meta_keywords,
                                                        og_title: pageSEO.og_title,
                                                        og_description: pageSEO.og_description,
                                                        og_image: pageSEO.og_image,
                                                        canonical_url: pageSEO.canonical_url,
                                                        noindex: pageSEO.noindex,
                                                        nofollow: pageSEO.nofollow
                                                    });
                                                    setEditingPageSEOId(pageSEO.id ?? null); // P1-16
                                                    // Scroll to form
                                                    document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className="text-blue-600 hover:text-blue-800 text-sm bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded transition-colors"
                                                title="Düzenle"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (confirm(`${pageSEO.page_path} için SEO ayarlarını silmek istediğinize emin misiniz?`)) {
                                                        await seoAPI.deletePageSEO(pageSEO.id!);
                                                        loadPageSEO();
                                                        addNotification('success', 'Silindi', 'Sayfa SEO ayarı kaldırıldı.');
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-800 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors"
                                                title="Sil"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Analysis Tab */}
                {activeTab === 'analysis' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">📊 SEO Analizi</h3>

                        <div className="flex space-x-4">
                            <input
                                type="url"
                                value={analysisUrl}
                                onChange={(e) => setAnalysisUrl(e.target.value)}
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                                placeholder="https://www.akaydintarim.com.tr/urunler"
                            />
                            <button
                                onClick={handleAnalyzePage}
                                disabled={loading || !analysisUrl}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                🔍 Analiz Et
                            </button>
                        </div>

                        {analysisResult && (
                            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                                <h4 className="font-semibold text-gray-900">Analiz Sonuçları: {analysisResult.page_url}</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-white p-4 rounded-lg">
                                        <h5 className="text-sm font-medium text-gray-600">Başlık Uzunluğu</h5>
                                        <p className={`text-lg font-bold ${(analysisResult.title_length || 0) > 60 ? 'text-red-600' : 'text-green-600'}`}>
                                            {analysisResult.title_length || 0} karakter
                                        </p>
                                    </div>

                                    <div className="bg-white p-4 rounded-lg">
                                        <h5 className="text-sm font-medium text-gray-600">Açıklama Uzunluğu</h5>
                                        <p className={`text-lg font-bold ${(analysisResult.description_length || 0) > 160 ? 'text-red-600' : 'text-green-600'}`}>
                                            {analysisResult.description_length || 0} karakter
                                        </p>
                                    </div>

                                    <div className="bg-white p-4 rounded-lg">
                                        <h5 className="text-sm font-medium text-gray-600">Meta Description</h5>
                                        <p className="text-lg font-bold text-blue-600">
                                            {analysisResult.has_meta_description ? '✅ Var' : '❌ Yok'}
                                        </p>
                                    </div>

                                    <div className="bg-white p-4 rounded-lg">
                                        <h5 className="text-sm font-medium text-gray-600">OG Tags</h5>
                                        <p className="text-lg font-bold text-purple-600">
                                            {analysisResult.has_og_tags ? '✅ Var' : '❌ Yok'}
                                        </p>
                                    </div>
                                </div>

                                {/* Content Stats */}
                                {analysisResult.content_stats && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white p-4 rounded-lg">
                                            <h5 className="text-sm font-medium text-gray-600">Ürünler</h5>
                                            <p className="text-lg font-bold text-green-600">{analysisResult.content_stats.total_products}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg">
                                            <h5 className="text-sm font-medium text-gray-600">Blog Yazıları</h5>
                                            <p className="text-lg font-bold text-blue-600">{analysisResult.content_stats.total_blog_posts}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg">
                                            <h5 className="text-sm font-medium text-gray-600">Hizmetler</h5>
                                            <p className="text-lg font-bold text-purple-600">{analysisResult.content_stats.total_services}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Site Health */}
                                {analysisResult.site_health && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white p-4 rounded-lg">
                                            <h5 className="text-sm font-medium text-gray-600">Schema Markup</h5>
                                            <p className={`text-sm font-bold ${analysisResult.site_health.has_schema ? 'text-green-600' : 'text-red-600'}`}>
                                                {analysisResult.site_health.has_schema ? '✅ Mevcut' : '❌ Eksik'}
                                            </p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg">
                                            <h5 className="text-sm font-medium text-gray-600">Sitemap</h5>
                                            <p className={`text-sm font-bold ${analysisResult.site_health.sitemap_enabled ? 'text-green-600' : 'text-red-600'}`}>
                                                {analysisResult.site_health.sitemap_enabled ? '✅ Aktif' : '❌ Pasif'}
                                            </p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg">
                                            <h5 className="text-sm font-medium text-gray-600">Analytics</h5>
                                            <p className={`text-sm font-bold ${analysisResult.site_health.has_analytics ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {analysisResult.site_health.has_analytics ? '✅ Mevcut' : '⚠️ Eksik'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white p-4 rounded-lg">
                                    <h5 className="font-medium text-gray-900 mb-3">📋 Öneriler</h5>
                                    <ul className="space-y-2">
                                        {analysisResult.recommendations.map((rec, index) => (
                                            <li key={index} className="flex items-start space-x-2">
                                                <span className="text-blue-600">•</span>
                                                <span className="text-sm text-gray-700">{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Sitemap Tab */}
                {activeTab === 'sitemap' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">🗺️ Sitemap Yönetimi</h3>

                        <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="font-medium text-gray-900">XML Sitemap</h4>
                                    <p className="text-sm text-gray-600">Arama motorları için site haritanızı yönetin</p>
                                </div>
                                <button
                                    onClick={handleGenerateSitemap}
                                    disabled={loading}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    🔄 Sitemap Yenile
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white rounded border">
                                    <span className="text-sm font-medium">sitemap.xml</span>
                                    <a
                                        href="/sitemap.xml"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Görüntüle
                                    </a>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded border">
                                    <span className="text-sm font-medium">robots.txt</span>
                                    <a
                                        href="/robots.txt"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Görüntüle
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


export default SEOManagement;
