import { Router } from 'express';
import EventController from '../controllers/EventController';
import { authenticate, authorize } from '../middleware/auth';

export default function eventRoutes(eventController: EventController): Router {
    const router = Router();

    router.post('/', authenticate, authorize('organizer'), eventController.create);
    router.get('/:id', eventController.getById);
    router.get('/', eventController.search);
    router.patch('/:id/approve', authenticate, authorize('admin'), eventController.approve);
    router.patch('/:id/reject', authenticate, authorize('admin'), eventController.reject);
    router.patch('/:id/cancel', authenticate, authorize('organizer'), eventController.cancel);
    router.patch('/:id', authenticate, authorize('organizer'), eventController.update);
    router.delete('/:id', authenticate, authorize('organizer'), eventController.delete);

    return router;
}