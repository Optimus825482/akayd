import { useState } from 'react';
import type { ContactMessage } from '../types';
import { contactMessagesAPI } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

export const useContactMessages = () => {
    const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const loadContactMessages = async () => {
        setLoadingMessages(true);
        try {
            const messages = await contactMessagesAPI.getAll();
            setContactMessages(messages);
        } catch (error) {
            console.error('Mesajlar yüklenirken hata oluştu:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleMarkAsRead = async (messageId: string) => {
        try {
            await contactMessagesAPI.markAsRead(Number(messageId));
            setContactMessages(prev =>
                prev.map(msg =>
                    msg.id === messageId ? { ...msg, is_read: true } : msg
                )
            );
        } catch (error) {
            console.error('Mesaj okundu olarak işaretlenirken hata oluştu:', error);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        setDeleteTarget(messageId);
        try {
            await contactMessagesAPI.delete(Number(messageId));
            setContactMessages(prev => prev.filter(msg => msg.id !== messageId));
            setIsMessageModalOpen(false);
            setSelectedMessage(null);
        } catch (error) {
            console.error('Mesaj silinirken hata oluştu:', error);
        }
    };

    // Confirm modal state — rendered by ContactMessagesManagement
    return {
        contactMessages,
        setContactMessages,
        loadingMessages,
        isMessageModalOpen,
        setIsMessageModalOpen,
        selectedMessage,
        setSelectedMessage,
        confirmDeleteMessage,
        deleteTarget,
        setDeleteTarget,
        loadContactMessages,
        handleMarkAsRead,
        handleDeleteMessage
    };
};
