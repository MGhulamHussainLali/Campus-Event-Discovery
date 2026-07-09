import { Router } from 'express';
import NotificationController from '../controllers/NotificationController';
import { authenticate } from '../middleware/auth';

export default function notificationRoutes(notificationController: NotificationController): Router {
    const router = Router();

    router.get('/', authenticate, notificationController.myNotifications);
    router.get('/unread-count', authenticate, notificationController.unreadCount);
    router.patch('/read-all', authenticate, notificationController.markAllRead);
    router.patch('/:id/read', authenticate, notificationController.markRead);
    router.post('/subscribe', authenticate, notificationController.subscribe);
    router.delete('/subscribe/:id', authenticate, notificationController.unsubscribe);

    return router;
}