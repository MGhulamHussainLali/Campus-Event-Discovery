import { Router } from 'express';
import PlatformSettingsController from '../controllers/PlatformSettingsController';
import { authenticate, authorize } from '../middleware/auth';

export default function settingsRoutes(platformSettingsController: PlatformSettingsController): Router {
    const router = Router();

    router.get('/', authenticate, authorize('admin'), platformSettingsController.getAll);
    router.get('/domains', authenticate, authorize('admin'), platformSettingsController.getDomains);
    router.post('/domains', authenticate, authorize('admin'), platformSettingsController.addDomain);
    router.delete('/domains/:id', authenticate, authorize('admin'), platformSettingsController.removeDomain);
    router.get('/:key', authenticate, authorize('admin'), platformSettingsController.getOne);
    router.patch('/:key', authenticate, authorize('admin'), platformSettingsController.update);

    return router;
}