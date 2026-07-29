import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import type { Service, Product, BlogPost, AboutPageContent, ContactPageContent, HeroContent, SEOSettings } from './types';
import { INITIAL_SERVICES, INITIAL_PRODUCTS, INITIAL_BLOG_POSTS, INITIAL_ABOUT_CONTENT, INITIAL_CONTACT_CONTENT } from './constants'; // constants.tsx
import { servicesAPI, productsAPI, blogAPI, aboutAPI, contactAPI, heroAPI, seoAPI } from './services/api';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';

const STATIC_BASE_URL = import.meta.env.VITE_STATIC_URL || 'http://localhost:3003';
const img = (p: string) => {
  if (!p) return '';
  // URL temizleme: baştaki slash'leri kaldır, /akaydin-tarim prefix'ini kaldır, çift slash'ları tek slash yap
  let cleaned = p.replace(/^\/+/, '').replace(/\/akaydin-tarim\//g, '/').replace(/\/+/g, '/');
  return `${STATIC_BASE_URL}/${cleaned}`;
};

const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

function App(): React.ReactNode {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);
  const [aboutContent, setAboutContent] = useState<AboutPageContent>(INITIAL_ABOUT_CONTENT);
  const [contactContent, setContactContent] = useState<ContactPageContent>(INITIAL_CONTACT_CONTENT);
  const [heroContents, setHeroContents] = useState<HeroContent[]>([]);
  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Verileri API'den yükle
  const loadData = async () => {
    try {
      const [servicesData, productsData, blogPostsData, aboutData, contactData, heroData, seoData] = await Promise.all([
        servicesAPI.getAll(),
        productsAPI.getAll(),
        blogAPI.getAll(),
        aboutAPI.get(),
        contactAPI.get(),
        heroAPI.getAll().catch(() => []), // Hero verisi yoksa boş array döndür
        seoAPI.getSettings().catch(() => null) // SEO verisi yoksa null döndür
      ]);

      setServices(servicesData.map((service: any) => ({
        id: service.id.toString(),
        title: service.title,
        description: service.description,
        iconName: service.icon_name || 'Consulting'
      })));

      setProducts(productsData.map((product: any) => ({
        id: product.id.toString(),
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price || 0,
        isFeatured: product.is_featured || false,
        imageUrl: product.image_url ? img(product.image_url.startsWith('/uploads/') ? product.image_url : product.image_url) : 'https://picsum.photos/300/200?random=1',
        images: product.images && Array.isArray(product.images)
          ? product.images.map((imgPath: string) => img(imgPath))
          : []
      })));

      setBlogPosts(blogPostsData.map((post: any) => ({
        id: post.id.toString(),
        title: post.title,
        summary: post.excerpt || post.summary || post.content,
        content: post.content,
        excerpt: post.excerpt || post.summary,
        author: post.author,
        date: new Date(post.created_at || Date.now()).toLocaleDateString('tr-TR'),
        views: post.views || 0,
        imageUrl: post.image_url ? img(post.image_url) : 'https://picsum.photos/400/250?random=1'
      })));

      if (aboutData) {
        setAboutContent({
          title: aboutData.title || '',
          content: aboutData.content || '',
          mission: aboutData.mission || INITIAL_ABOUT_CONTENT.mission,
          vision: aboutData.vision || INITIAL_ABOUT_CONTENT.vision,
          images: aboutData.images ? aboutData.images.map((imgPath: string) => img(imgPath)) : [],
          image: aboutData.image ? img(`/uploads/${aboutData.image}`) : undefined
        });
      }

      if (contactData) {
        setContactContent({
          company_name: contactData.company_name || 'Akaydın Tarım',
          address: contactData.address || INITIAL_CONTACT_CONTENT.address,
          phone: contactData.phone || INITIAL_CONTACT_CONTENT.phone,
          whatsapp_phone: contactData.whatsapp_phone || INITIAL_CONTACT_CONTENT.whatsapp_phone,
          email: contactData.email || INITIAL_CONTACT_CONTENT.email,
          website: contactData.website || '',
          working_hours: contactData.working_hours || '',
          map_embed: contactData.map_embed || '',
          facebook_url: contactData.facebook_url || '',
          instagram_url: contactData.instagram_url || '',
          twitter_url: contactData.twitter_url || '',
          linkedin_url: contactData.linkedin_url || '',
          youtube_url: contactData.youtube_url || ''
        });
      }

      // Hero verilerini işle
      if (heroData && heroData.length > 0) {
        setHeroContents(heroData.map((hero: any) => ({
          id: hero.id?.toString() || hero.ID?.toString() || String(hero.order_index || 1),
          title: hero.title,
          subtitle: hero.subtitle,
          description: hero.description,
          cta: hero.cta,
          backgroundGradient: hero.background_gradient || 'from-green-600 via-green-700 to-blue-800',
          backgroundImage: hero.background_image ? img(hero.background_image) : '',
          isActive: hero.is_active || true,
          order: hero.order_index || 1
        })));
      }

      // SEO verilerini işle
      if (seoData) {
        setSeoSettings(seoData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Veri yüklenirken hata oluştu:', error);
      setLoadError('Veriler yüklenemedi. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl text-red-600 font-semibold mb-2">Bir hata oluştu</div>
          <div className="text-gray-600 mb-4">{loadError}</div>
          <button
            onClick={() => { setLoadError(null); setLoading(true); loadData(); }}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <HashRouter>
          <Routes>
            {/* Admin Route - No Header/Footer */}
            <Route
              path="/admin"
              element={
                <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-xl text-gray-600">Yükleniyor...</div></div>}>
                  <AdminDashboard
                    services={services}
                    setServices={setServices}
                    products={products}
                    setProducts={setProducts}
                    blogPosts={blogPosts}
                    setBlogPosts={setBlogPosts}
                    aboutContent={aboutContent}
                    setAboutContent={setAboutContent}
                    contactContent={contactContent}
                    setContactContent={setContactContent}
                    heroContents={heroContents}
                    setHeroContents={setHeroContents}
                    refreshData={loadData}
                  />
                </React.Suspense>
              }
            />

            {/* Regular Routes - With Header/Footer */}
            <Route path="/*" element={
              <div className="flex flex-col min-h-screen bg-gray-50 text-gray-700">
                <Header contactContent={contactContent} />
                <main className="flex-grow pt-5"> {/* Add padding top to avoid content being hidden by sticky header */}
                  <Routes>
                    <Route path="/" element={<HomePage services={services.slice(0, 3)} products={products.filter(p => p.isFeatured).slice(0, 4)} heroContents={heroContents} contactContent={contactContent} seoSettings={seoSettings} />} />
                    <Route path="/hakkimizda" element={<AboutPage content={aboutContent} seoSettings={seoSettings} />} />
                    <Route path="/hizmetlerimiz" element={<ServicesPage services={services} seoSettings={seoSettings} />} />
                    <Route path="/urunler" element={<ProductsPage products={products} contactContent={contactContent} seoSettings={seoSettings} />} />
                    <Route path="/urun/:id" element={<ProductDetailPage contactContent={contactContent} seoSettings={seoSettings} />} />
                    <Route path="/blog" element={<BlogPage blogPosts={blogPosts} seoSettings={seoSettings} />} />
                    <Route path="/iletisim" element={<ContactPage content={contactContent} seoSettings={seoSettings} />} />
                  </Routes>
                </main>
                <Footer content={contactContent} />
              </div>
            } />
        </Routes>
      </HashRouter>
    </HelmetProvider>
  );
}

export default App;