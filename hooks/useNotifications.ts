import { useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import type { QueueItem } from '@/types';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export type UseNotificationsReturn = {
    requestPermission: () => Promise<boolean>;
    scheduleReminder: (item: QueueItem, date: Date) => Promise<string>;
    cancelReminder: (notificationId: string) => Promise<void>;
};

export function useNotifications(): UseNotificationsReturn {
    const requestPermission = useCallback(async (): Promise<boolean> => {
        const { status: existing } = await Notifications.getPermissionsAsync();
        if (existing === 'granted') return true;
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    }, []);

    const scheduleReminder = useCallback(
        async (item: QueueItem, date: Date): Promise<string> => {
            const granted = await requestPermission();
            if (!granted) throw new Error('Notification permission denied.');

            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🎬 Time to watch!',
                    body: item.title,
                    data: { itemId: item.id },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date,
                },
            });
            return id;
        },
        [requestPermission]
    );

    const cancelReminder = useCallback(async (notificationId: string): Promise<void> => {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    }, []);

    return { requestPermission, scheduleReminder, cancelReminder };
}