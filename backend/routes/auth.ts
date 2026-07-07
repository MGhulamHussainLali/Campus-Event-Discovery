import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { authenticate } from '../middleware/auth';

export default function authRoutes(authController: AuthController): Router {
    const router = Router();

    router.post('/signup/student', authController.signupStudent);
    router.post('/signup/organizer', authController.signupOrganizer);
    router.get('/verify-email', authController.verifyEmail);
    router.post('/login', authController.login);
    router.post('/refresh', authController.refreshToken);
    router.post('/logout', authController.logout);
    router.post('/logout-all', authenticate, authController.logoutAllDevices);
    router.post('/password-reset/request', authController.requestPasswordReset);
    router.post('/password-reset/confirm', authController.resetPassword);
    router.post('/change-password', authenticate, authController.changePassword);

    return router;
}
