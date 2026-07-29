import { useState } from 'react';
import type { ContactPageContent } from '../types';
import { contactAPI } from '../services/api';

export const useContactPage = () => {
    const [contactContent, setContactContent] = useState<ContactPageContent>({
        company_name: 'Akaydın Tarım',
        address: '',
        phone: '',
        whatsapp_phone: '',
        email: '',
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
        linkedin_url: '',
        youtube_url: '',
        website: '',
        working_hours: '',
        map_embed: ''
    });
    const [loading, setLoading] = useState(false);

    const loadContactContent = async () => {
        try {
            setLoading(true);
            const data = await contactAPI.get();
            setContactContent(data);
        } catch (error) {
            console.error('İletişim bilgileri yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateContactContent = async (newContent: ContactPageContent) => {
        try {
            setLoading(true);
            await contactAPI.update(newContent);
            setContactContent(newContent);
        } catch (error) {
            console.error('İletişim bilgileri güncellenirken hata:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        contactContent,
        loading,
        loadContactContent,
        updateContactContent
    };
};
