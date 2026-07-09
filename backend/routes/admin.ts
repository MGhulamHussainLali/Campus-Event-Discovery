import { Router } from 'express';
import AdminActionController from '../controllers/AdminActionController';
import { authenticate, authorize, requireSuperAdmin } from '../middleware/auth';

export default function adminRoutes(adminActionController: AdminActionController): Router {
    const router = Router();

    router.patch('/accounts/:id/approve', authenticate, authorize('admin'), adminActionController.approveAccount);
    router.patch('/accounts/:id/reject', authenticate, authorize('admin'), adminActionController.rejectAccount);
    router.patch('/accounts/:id/suspend', authenticate, authorize('admin'), adminActionController.suspendAccount);
    router.get('/accounts/pending', authenticate, authorize('admin'), adminActionController.pendingAccounts);
    router.post('/admins', authenticate, authorize('admin'), requireSuperAdmin, adminActionController.createAdmin);
    router.get('/admins', authenticate, authorize('admin'), requireSuperAdmin, adminActionController.allAdmins);

    return router;
}