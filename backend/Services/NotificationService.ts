import NotificationRepository from '../repositories/NotificationRepository';
import PushSubscriptionRepository from '../repositories/PushSubscriptionRepository';
import Notification, { NotificationType } from '../models/notification';

class NotificationService {
    constructor(
        private notificationRepository: NotificationRepository,
        private pushSubscriptionRepository: PushSubscriptionRepository
    ) { }

    async notify(userId: number, title: string, message: string, type: NotificationType, relatedEventId: number | null = null): Promise<boolean> {
        const notification = new Notification(0, userId, title, message, type, relatedEventId, false, new Date());
        await this.notificationRepository.create(notification);
        // Web Push delivery to be wired in once VAPID keys/push sending logic is set up
        return true;
    }

    async getMyNotifications(userId: number): Promise<Notification[] | null> {
        return await this.notificationRepository.findByUserId(userId);
    }

    async markAsRead(id: number, userId: number): Promise<boolean> {
        return await this.notificationRepository.markRead(id, userId);
    }

    async markAllAsRead(userId: number): Promise<boolean> {
        return await this.notificationRepository.markAllRead(userId);
    }

    async getUnreadCount(userId: number): Promise<number> {
        return await this.notificationRepository.getUnreadCount(userId);
    }

    async subscribeToPush(userId: number, endpoint: string, p256dhKey: string, authKey: string): Promise<boolean> {
        await this.pushSubscriptionRepository.create(userId, endpoint, p256dhKey, authKey);
        return true;
    }

    async unsubscribeFromPush(subscriptionId: number, userId: number): Promise<boolean> {
        return await this.pushSubscriptionRepository.delete(subscriptionId);
    }
}
export default NotificationService