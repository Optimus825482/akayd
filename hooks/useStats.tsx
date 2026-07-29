import { useState, useEffect } from 'react';
import type { Service, Product, BlogPost } from '../types';

export const useStats = (services: Service[], products: Product[], blogPosts: BlogPost[], isAuthenticated: boolean) => {
    const [stats, setStats] = useState({
        totalServices: 0,
        totalProducts: 0,
        totalBlogPosts: 0,
        recentActivity: [] as string[]
    });

    useEffect(() => {
        if (isAuthenticated) {
            setStats({
                totalServices: services.length,
                totalProducts: products.length,
                totalBlogPosts: blogPosts.length,
                recentActivity: [
                    `${services.length} Hizmet`,
                    `${products.length} Ürün`,
                    `${blogPosts.length} Blog Yazısı`
                ]
            });
        }
    }, [services, products, blogPosts, isAuthenticated]);

    return stats;
};
