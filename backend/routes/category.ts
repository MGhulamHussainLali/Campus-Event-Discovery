import { Router } from 'express';
import CategoryController from '../controllers/CategoryController';
import { authenticate, authorize } from '../middleware/auth';

export default function categoryRoutes(categoryController: CategoryController): Router {
    const router = Router();

    router.post('/', authenticate, authorize('admin'), categoryController.create);
    router.get('/:id', categoryController.getById);
    router.get('/', categoryController.getAll);
    router.patch('/:id', authenticate, authorize('admin'), categoryController.update);
    router.delete('/:id', authenticate, authorize('admin'), categoryController.delete);

    return router;
}