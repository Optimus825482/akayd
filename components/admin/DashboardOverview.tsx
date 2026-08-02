import React from 'react';
import type { Product, BlogPost } from '../../types';

interface DashboardOverviewProps {
    stats: {
        totalServices: number;
        totalProducts: number;
        totalBlogPosts: number;
        recentActivity: string[];
    };
    products: Product[];
    blogPosts: BlogPost[];
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
    stats,
    products,
    blogPosts
}) => {
    const featuredProductsCount = products.filter(p => p.isFeatured).length;
    const recentBlogPosts = [...blogPosts] // P3-13: props'u mutate etme
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-green-600 via-green-700 to-blue-800 text-white rounded-xl shadow-lg p-6">
                <div>
                    <h1 className="text-2xl font-bold mb-2">🌱 Akaydın Tarım Admin Paneli</h1>
                    <p className="text-green-100">Hoş geldiniz! Sistem durumunuz ve istatistikleriniz aşağıda görüntüleniyor.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                            <span className="text-2xl">🛠️</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Hizmetler</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                            <span className="text-2xl">📦</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Ürünler</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                            <span className="text-2xl">📝</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Blog Yazıları</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalBlogPosts}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
                            <span className="text-2xl">⭐</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Öne Çıkan Ürünler</p>
                            <p className="text-2xl font-bold text-gray-900">{featuredProductsCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Blog Posts */}
            {recentBlogPosts.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">📝 Son Blog Yazıları</h2>
                    <div className="space-y-3">
                        {recentBlogPosts.map(post => (
                            <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{post.title}</p>
                                    <p className="text-sm text-gray-500">{post.date} • {post.author}</p>
                                </div>
                                <span className="text-sm text-gray-400">{post.views || 0} görüntülenme</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardOverview;
