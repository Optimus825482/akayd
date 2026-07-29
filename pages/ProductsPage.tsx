
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Product, ContactPageContent, SEOSettings, PageSEO } from '../types';
import ProductCard from '../components/ProductCard';
import SEOHead from '../components/SEOHead';
import { seoAPI } from '../services/api';

interface ProductsPageProps {
  products: Product[];
  contactContent: ContactPageContent;
  seoSettings?: SEOSettings | null;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ products, contactContent, seoSettings }) => {
  const [pageSEO, setPageSEO] = useState<PageSEO | null>(null);

  // SEO verilerini yükle
  useEffect(() => {
    const loadPageSEO = async () => {
      try {
        const data = await seoAPI.getPageSEO('/urunler');
        setPageSEO(data);
      } catch (error) {
        // SEO verileri yüklenemedi
      }
    };
    loadPageSEO();
  }, []);

  return (
    <>
      <SEOHead
        seoSettings={seoSettings || undefined}
        pageSEO={pageSEO || undefined}
        pageTitle="Ürünlerimiz"
        pageDescription="Akaydın Tarım'ın kaliteli ve organik fındık ürünlerini keşfedin. Premium kalite, doğal lezzet."
        pageKeywords="ürünlerimiz, fındık ürünleri, organik fındık, doğal ürünler, kaliteli fındık, hendek fındık"
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-400 to-orange-400 opacity-20 rounded-full filter blur-3xl transform -translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-red-400 to-amber-400 opacity-20 rounded-full filter blur-3xl transform translate-x-1/3 translate-y-1/3"></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center text-white">
              <div className="inline-flex items-center bg-gradient-to-r from-yellow-300 to-orange-300 text-orange-900 px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
                <span className="mr-2 text-xl">🌾</span>
                Akaydın Tarım Ürünleri
              </div>

              <p className="text-xl md:text-2xl text-amber-100 max-w-4xl mx-auto leading-relaxed font-medium mb-8">
                Veriminizi artıracak gübreler, bitki besleme ürünleri ve en kaliteli işlenmiş fındık çeşitleri.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/iletisim"
                  className="group bg-yellow-400 hover:bg-yellow-300 text-orange-900 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  <span className="flex items-center justify-center">
                    <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Ürün Bilgisi Al
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
                <span className="mr-2 text-lg">⭐</span>
                TÜM ÜRÜNLERİMİZ
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Premium <span className="text-amber-600">Ürün Kataloğu</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Tarımsal üretiminizi destekleyecek en kaliteli ürünler ve işlenmiş fındık çeşitlerimiz.
              </p>
            </div>

            {/* Product Categories */}
            {products.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-16">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="transform hover:scale-105 transition-all duration-500 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ProductCard
                      product={product}
                      contactPhone={contactContent.phone.replace(/[^\d]/g, '')}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 mb-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Henüz ürün bulunmuyor</h3>
                <p className="text-gray-600 mb-6">Yakında yeni ürünler eklenecek.</p>
                <Link
                  to="/"
                  className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Ana Sayfaya Dön
                </Link>
              </div>
            )}

            {/* Quality Assurance Section */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-8 md:p-12 mb-16">
              <div className="text-center mb-12">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Neden <span className="text-amber-600">Akaydın Tarım</span> Ürünleri?
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-white">🏆</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Kalite Garantisi</h4>
                  <p className="text-gray-600">ISO standartlarında üretilmiş, sertifikalı ürünler</p>
                </div>

                <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-white">🚚</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Hızlı Teslimat</h4>
                  <p className="text-gray-600">Hendek ve çevre illere aynı gün teslimat</p>
                </div>

                <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-white">💰</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Uygun Fiyat</h4>
                  <p className="text-gray-600">Toptan ve perakende avantajlı fiyatlar</p>
                </div>

                <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-white">🤝</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Güvenilir Destek</h4>
                  <p className="text-gray-600">Satış sonrası teknik destek ve danışmanlık</p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-8 md:p-12 shadow-2xl text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Özel Ürün Talepleriniz Var mı?
              </h3>
              <p className="text-amber-100 text-lg mb-8 max-w-2xl mx-auto">
                Katalogumuzda bulamadığınız özel ürünler için bizimle iletişime geçin.
                Size özel çözümler geliştirebiliriz.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/iletisim"
                  className="group bg-white hover:bg-gray-100 text-amber-600 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  <span className="flex items-center justify-center">
                    <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 0L6 8H3m4 5v6a1 1 0 001 1h1m0 0h4m-5 0a1 1 0 100 2 1 1 0 000-2m4 0a1 1 0 100 2 1 1 0 000-2" />
                    </svg>
                    Sipariş Ver
                  </span>
                </Link>
                <Link
                  to="/hizmetlerimiz"
                  className="group border-2 border-white text-white hover:bg-white hover:text-amber-600 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center justify-center">
                    <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Hizmetlerimizi Gör
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ProductsPage;
