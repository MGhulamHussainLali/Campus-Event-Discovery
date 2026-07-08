import { Router } from 'express';
import OrganizationController from '../controllers/OrganizationController';
import { authenticate, authorize } from '../middleware/auth';

export default function organizationRoutes(organizationController: OrganizationController): Router {
    const router = Router();

    router.post('/', authenticate, authorize('admin'), organizationController.create);
    router.get('/:id', organizationController.getById);
    router.get('/', organizationController.getAll);
    router.patch('/:id', authenticate, authorize('admin', 'organizer'), organizationController.update);
    router.delete('/:id', authenticate, authorize('admin'), organizationController.delete);

    return router;
}