import { Router } from 'express';
import InterestController from '../controllers/InterestController';
import { authenticate, authorize } from '../middleware/auth';

export default function interestRoutes(interestController: InterestController): Router {
    const router = Router();

    router.post('/', authenticate, authorize('admin'), interestController.create);
    router.get('/mine', authenticate, authorize('student'), interestController.getStudentInterests);
    router.get('/:id', interestController.getById);
    router.get('/', interestController.getAll);
    router.patch('/:id', authenticate, authorize('admin'), interestController.update);
    router.delete('/:id', authenticate, authorize('admin'), interestController.delete);
    router.post('/:id/select', authenticate, authorize('student'), interestController.addStudentInterest);
    router.delete('/:id/select', authenticate, authorize('student'), interestController.removeStudentInterest);

    return router;
}