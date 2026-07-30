import React, { useState } from 'react';
import type { Service, Product, BlogPost, AboutPageContent, ContactPageContent, HeroContent } from '../types';


import ToastContainer from '../components/ToastContainer';
import { useAdminAuth, useNotifications, useContactMessages, useStats, useContactPage } from '../hooks/useAdmin';
import DashboardOverview from '../components/admin/DashboardOverview';
import ServiceManagement from '../components/admin/ServiceManagement';
import ProductManagement from '../components/admin/ProductManagement';
import BlogManagement from '../components/admin/BlogManagement';
import ContactMessagesManagement from '../components/admin/ContactMessagesManagement';
import ContactPageManagement from '../components/admin/ContactPageManagement';
import HeroManagement from '../components/admin/HeroManagement';
import AboutManagement from '../components/admin/AboutManagement';
import SEOManagement from '../components/admin/SEOManagement';
import SerpRankTracker from '../components/admin/SerpRankTracker';


interface AdminDashboardProps {
    services: Service[];
    setServices: React.Dispatch<React.SetStateAction<Service[]>>;
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    blogPosts: BlogPost[];
    setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
    aboutContent: AboutPageContent;
    setAboutContent: React.Dispatch<React.SetStateAction<AboutPageContent>>;
    contactContent: ContactPageContent;
    setContactContent: React.Dispatch<React.SetStateAction<ContactPageContent>>;
    heroContents: HeroContent[];
    setHeroContents: React.Dispatch<React.SetStateAction<HeroContent[]>>;
    refreshData: () => Promise<void>;
}
const AdminDashboard: React.FC<AdminDashboardProps> = ({
    services,
    setServices,
    products,
    setProducts,
    blogPosts,
    setBlogPosts,
    aboutContent,
    setAboutContent,
    contactContent,
    setContactContent,
    heroContents,
    setHeroContents,
    refreshData
}) => {
    // UI State
    const [activeSection, setActiveSection] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Custom Hooks
    const { isAuthenticated, password, setPassword, error, handleLogin, handleLogout } = useAdminAuth();
    const { notifications, addNotification, removeNotification } = useNotifications();
    const { updateContactContent } = useContactPage();
    const { loadContactMessages } = useContactMessages();
    const stats = useStats(services, products, blogPosts, isAuthenticated);

    // Load contact messages when section is active
    React.useEffect(() => {
        if (isAuthenticated && activeSection === 'contact-messages') {
            loadContactMessages();
        }
    }, [isAuthenticated, activeSection]);

    // Auto refresh data every 30 seconds when authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            const interval = setInterval(() => {
                refreshData();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, refreshData]);

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
                            <span className="text-white text-2xl">🌱</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Akay Tarım</h1>
                        <p className="text-gray-600">Admin Paneli</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Şifre
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Admin şifresini girin"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-medium"
                        >
                            🔐 Giriş Yap
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const menuItems = [
        { id: 'dashboard', name: 'Kontrol Paneli', icon: '📊' },
        { id: 'hero', name: 'Ana Sayfa Hero', icon: '🎬' },
        { id: 'services', name: 'Hizmetler', icon: '🛠️' },
        { id: 'products', name: 'Ürünler', icon: '📦' },
        { id: 'blog', name: 'Blog', icon: '📝' },
        { id: 'about', name: 'Hakkımızda', icon: 'ℹ️' },
        { id: 'contact-page', name: 'İletişim Sayfası', icon: '📧' },
        { id: 'contact-messages', name: 'İletişim Mesajları', icon: '💬' },
        { id: 'seo', name: 'SEO Yönetimi', icon: '🔍' },
        { id: 'serp-rankings', name: 'Rank Takip', icon: '📈' }
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col`}>
                {/* Logo & Toggle */}
                <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        {sidebarOpen && (
                            <div className="flex items-center space-x-3">
                                <img
                                    src="/akaylogo.png"
                                    alt="Akaydın Tarım Logo"
                                    className="w-8 h-8 object-contain"
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        target.onerror = null;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                            const span = document.createElement('span');
                                            span.textContent = '🌱';
                                            span.className = 'w-8 h-8 text-xl flex items-center justify-center';
                                            parent.prepend(span);
                                        }
                                    }}
                                />
                                <span className="font-bold text-lg">Akaydın Tarım</span>
                            </div>
                        )}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            {sidebarOpen ? '◀' : '▶'}
                        </button>
                    </div>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 p-4">
                    <div className="space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeSection === item.id
                                    ? 'bg-green-600 text-white shadow-lg'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {sidebarOpen && <span className="font-medium">{item.name}</span>}
                            </button>
                        ))}
                    </div>
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-600 transition-colors text-gray-300"
                    >
                        <span className="text-xl">🚪</span>
                        {sidebarOpen && <span className="font-medium">Çıkış Yap</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {menuItems.find(item => item.id === activeSection)?.name || 'Admin Paneli'}
                            </h1>
                            <p className="text-gray-600">
                                {activeSection === 'dashboard' && 'Sistem durumunuz ve genel istatistikler'}
                                {activeSection === 'services' && 'Hizmetlerinizi yönetin'}
                                {activeSection === 'products' && 'Ürünlerinizi düzenleyin'}
                                {activeSection === 'blog' && 'Blog yazılarınızı yayınlayın'}
                                {activeSection === 'about' && 'Hakkımızda sayfasını düzenleyin'}
                                {activeSection === 'hero' && 'Ana sayfa hero bölümünü yönetin'}
                                {activeSection === 'contact-page' && 'İletişim sayfası bilgilerini güncelleyin'}
                                {activeSection === 'contact-messages' && 'Gelen mesajları görüntüleyin'}
                                {activeSection === 'seo' && 'SEO ayarları ve optimizasyonlarını yönetin'}
                                {activeSection === 'serp-rankings' && 'Arama motoru sıralama takibi ve analizi'}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-500">
                                Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
                            </div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="p-6 overflow-y-auto" style={{ height: 'calc(100vh - 88px)' }}>
                    {activeSection === 'dashboard' && (
                        <DashboardOverview
                            stats={stats}
                            products={products}
                            blogPosts={blogPosts}
                        />
                    )}

                    {activeSection === 'services' && (
                        <ServiceManagement
                            services={services}
                            setServices={setServices}
                            loading={loading}
                            setLoading={setLoading}
                            addNotification={addNotification}
                        />
                    )}

                    {activeSection === 'products' && (
                        <ProductManagement
                            products={products}
                            setProducts={setProducts}
                            loading={loading}
                            setLoading={setLoading}
                            addNotification={addNotification}
                        />
                    )}

                    {activeSection === 'blog' && (
                        <BlogManagement
                            blogPosts={blogPosts}
                            setBlogPosts={setBlogPosts}
                            loading={loading}
                            setLoading={setLoading}
                            addNotification={addNotification}
                        />
                    )}

                    {activeSection === 'hero' && (
                        <HeroManagement
                            heroContents={heroContents}
                            setHeroContents={setHeroContents}
                            loading={loading}
                            setLoading={setLoading}
                            addNotification={addNotification}
                        />
                    )}

                    {activeSection === 'about' && (
                        <AboutManagement
                            aboutContent={aboutContent}
                            setAboutContent={setAboutContent}
                            addNotification={addNotification}
                            onSave={refreshData}
                        />
                    )}
                    {activeSection === 'contact-page' && (
                        <ContactPageManagement
                            contactContent={contactContent}
                            onUpdateContact={async (updatedContact) => {
                                try {
                                    await updateContactContent(updatedContact);
                                    setContactContent(updatedContact);
                                    await refreshData();
                                    addNotification('success', 'Başarılı!', 'İletişim bilgileri güncellendi.');
                                } catch (error) {
                                    addNotification('error', 'Hata!', 'İletişim bilgileri güncellenirken hata oluştu.');
                                }
                            }}
                            loading={loading}
                        />
                    )}

                    {activeSection === 'contact-messages' && (
                        <ContactMessagesManagement />
                    )}

                    {activeSection === 'seo' && (
                        <SEOManagement
                            addNotification={addNotification}
                        />
                    )}

                    {activeSection === 'serp-rankings' && (
                        <SerpRankTracker
                            addNotification={addNotification}
                        />
                    )}
                </main>
            </div>

            {/* Toast Notifications */}
            <ToastContainer
                notifications={notifications}
                onClose={removeNotification}
            />
        </div>
    );
};

export default AdminDashboard;
