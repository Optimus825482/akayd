import { useState } from 'react';
import type { SEOSettings, PageSEO } from '../types';
import { seoAPI } from '../services/api';

export const useSEO = () => {
    const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null);
    const [pageSEOList, setPageSEOList] = useState<PageSEO[]>([]);
    const [loading, setLoading] = useState(false);

    const loadSEOSettings = async () => {
        try {
            setLoading(true);
            const data = await seoAPI.getSettings();
            setSeoSettings(data);
        } catch (error) {
            console.error('SEO ayarları yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSEOSettings = async (newSettings: SEOSettings) => {
        try {
            setLoading(true);
            await seoAPI.updateSettings(newSettings);
            setSeoSettings(newSettings);
        } catch (error) {
            console.error('SEO ayarları güncellenirken hata:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const loadPageSEO = async () => {
        try {
            const data = await seoAPI.getAllPageSEO();
            setPageSEOList(data);
        } catch (error) {
            console.error('Sayfa SEO verileri yüklenirken hata:', error);
        }
    };

    return {
        seoSettings,
        pageSEOList,
        loading,
        loadSEOSettings,
        updateSEOSettings,
        loadPageSEO
    };
};
