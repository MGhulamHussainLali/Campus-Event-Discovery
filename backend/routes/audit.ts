import { Router } from 'express';
import AuditLogController from '../controllers/AuditLogController';
import { authenticate, authorize } from '../middleware/auth';

export default function auditRoutes(auditLogController: AuditLogController): Router {
    const router = Router();

    router.get('/accounts/:userId', authenticate, authorize('admin'), auditLogController.accountHistory);
    router.get('/events/:eventId', authenticate, authorize('admin'), auditLogController.eventHistory);
    router.get('/settings/:key', authenticate, authorize('admin'), auditLogController.settingsHistory);

    return router;
}