import { Request, Response } from 'express';
import NotificationService from '../services/NotificationService';

class NotificationController {
    constructor(private notificationService: NotificationService) {}

    myNotifications = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const notifications = await this.notificationService.getMyNotifications(userId);
            res.status(200).json(notifications ?? []);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    markRead = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const id = Number(req.params.id);
            const result = await this.notificationService.markAsRead(id, userId);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    markAllRead = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const result = await this.notificationService.markAllAsRead(userId);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    unreadCount = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const count = await this.notificationService.getUnreadCount(userId);
            res.status(200).json({ count });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    subscribe = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const { endpoint, p256dhKey, authKey } = req.body;
            const result = await this.notificationService.subscribeToPush(userId, endpoint, p256dhKey, authKey);
            res.status(201).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    unsubscribe = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const id = Number(req.params.id);
            const result = await this.notificationService.unsubscribeFromPush(id, userId);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
}
export default NotificationController