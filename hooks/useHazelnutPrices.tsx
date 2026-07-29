import { useState } from 'react';
import type { Notification, HazelnutPrices } from '../types';
import { hazelnutPricesAPI } from '../services/api';

export const useHazelnutPrices = (addNotification: (type: Notification['type'], title: string, message: string) => void) => {
    const [hazelnutPrices, setHazelnutPrices] = useState<HazelnutPrices | null>(null);
    const [pricesHistory, setPricesHistory] = useState<HazelnutPrices[]>([]);
    const [pricesForm, setPricesForm] = useState({
        price: 0,
        daily_change: 0,
        change_percentage: 0,
        source: 'manual' as 'manual' | 'scraped',
        update_mode: 'manual' as 'manual' | 'automatic',
        scraping_enabled: true,
        notes: ''
    });
    const [loadingPrices, setLoadingPrices] = useState(false);
    const [isAutoUpdateActive, setIsAutoUpdateActive] = useState(false);

    const loadHazelnutPrices = async () => {
        setLoadingPrices(true);
        try {
            const prices = await hazelnutPricesAPI.get();
            setHazelnutPrices(prices);
            setPricesForm({
                price: Number(prices.price) || 0,
                daily_change: Number(prices.daily_change) || 0,
                change_percentage: Number(prices.change_percentage) || 0,
                source: prices.source || 'manual',
                update_mode: prices.update_mode || 'manual',
                scraping_enabled: prices.scraping_enabled !== undefined ? prices.scraping_enabled : true,
                notes: prices.notes || ''
            });
            setIsAutoUpdateActive(prices.update_mode === 'automatic');
        } catch (error) {
            console.error('Fındık fiyatları yüklenirken hata oluştu:', error);
            addNotification('error', 'Hata!', 'Fındık fiyatları yüklenirken hata oluştu.');
        } finally {
            setLoadingPrices(false);
        }
    };

    const loadPricesHistory = async () => {
        try {
            const history = await hazelnutPricesAPI.getHistory();
            setPricesHistory(history);
        } catch (error) {
            console.error('Fiyat geçmişi yüklenirken hata oluştu:', error);
            addNotification('error', 'Hata!', 'Fiyat geçmişi yüklenirken hata oluştu.');
        }
    };

    const handlePricesUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingPrices(true);
        try {
            await hazelnutPricesAPI.create(pricesForm);
            addNotification('success', 'Başarılı!', 'Yeni fındık fiyatı kaydedildi.');
            await loadHazelnutPrices();
            await loadPricesHistory();
        } catch (error) {
            console.error('Fiyat kaydedilirken hata oluştu:', error);
            addNotification('error', 'Hata!', 'Fiyat kaydedilirken hata oluştu.');
        } finally {
            setLoadingPrices(false);
        }
    };

    const handleScrapePrice = async () => {
        setLoadingPrices(true);
        try {
            const result = await hazelnutPricesAPI.scrape();
            addNotification('success', 'Başarılı!', `Güncel fiyat çekildi: ₺${result.scrapedPrice}`);
            await loadHazelnutPrices();
        } catch (error) {
            console.error('Fiyat çekme hatası:', error);
            addNotification('error', 'Hata!', 'Fiyat çekme işlemi başarısız oldu.');
        } finally {
            setLoadingPrices(false);
        }
    };

    const handleApplyScrapedPrice = async () => {
        setLoadingPrices(true);
        try {
            const result = await hazelnutPricesAPI.applyScraped();
            addNotification('success', 'Başarılı!', result.message);
            await loadHazelnutPrices();
        } catch (error) {
            console.error('Scraped fiyat uygulama hatası:', error);
            addNotification('error', 'Hata!', 'Scraped fiyat uygulanırken hata oluştu.');
        } finally {
            setLoadingPrices(false);
        }
    };

    const toggleUpdateMode = async () => {
        const newMode: 'manual' | 'automatic' = pricesForm.update_mode === 'manual' ? 'automatic' : 'manual';
        const updatedForm = { ...pricesForm, update_mode: newMode };

        setLoadingPrices(true);
        try {
            await hazelnutPricesAPI.update(updatedForm);
            setPricesForm(updatedForm);
            setIsAutoUpdateActive(newMode === 'automatic');
            addNotification('success', 'Başarılı!', `${newMode === 'automatic' ? 'Otomatik' : 'Manuel'} mod aktifleştirildi.`);
            await loadHazelnutPrices();
        } catch (error) {
            console.error('Mod değiştirme hatası:', error);
            addNotification('error', 'Hata!', 'Mod değiştirme işlemi başarısız oldu.');
        } finally {
            setLoadingPrices(false);
        }
    };

    return {
        hazelnutPrices,
        pricesHistory,
        pricesForm,
        setPricesForm,
        loadingPrices,
        isAutoUpdateActive,
        loadHazelnutPrices,
        loadPricesHistory,
        handlePricesUpdate,
        handleScrapePrice,
        handleApplyScrapedPrice,
        toggleUpdateMode
    };
};
