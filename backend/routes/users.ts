// routes/user.ts
import { Router } from 'express';
import UserController from '../controllers/UserController';
import { authenticate } from '../middleware/auth';

export default function userRoutes(userController: UserController): Router {
    const router = Router();

    router.get('/me', authenticate, userController.getMe);
    router.patch('/me', authenticate, userController.updateMe);
    router.patch('/me/student', authenticate, userController.updateMyStudentDetails);
    router.patch('/me/organizer', authenticate, userController.updateMyOrganizerDetails);

    return router;
}