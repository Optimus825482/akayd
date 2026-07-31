import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center px-6">
        {/* 🌱 Decorasyon */}
        <div className="text-6xl mb-6">🌱</div>

        {/* 404 */}
        <h1 className="text-8xl font-bold text-accent mb-4">404</h1>

        {/* Mesaj */}
        <p className="text-xl text-ink-2 mb-8">
          Aradığınız sayfa bulunamadı
        </p>

        {/* Ana Sayfaya Dön */}
        <Link
          to="/"
          className="inline-block bg-accent text-white rounded-xl px-6 py-3 font-medium hover:brightness-110 transition-all"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
