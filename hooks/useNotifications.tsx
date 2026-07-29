import { useState } from 'react';
import type { Notification } from '../types';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = (type: Notification['type'], title: string, message: string) => {
        const notification: Notification = {
            id: Date.now().toString(),
            type,
            title,
            message,
            duration: 5000
        };
        setNotifications(prev => [...prev, notification]);
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return {
        notifications,
        addNotification,
        removeNotification
    };
};
