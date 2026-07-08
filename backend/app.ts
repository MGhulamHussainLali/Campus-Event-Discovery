// app.ts
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/category';
import interestRoutes from './routes/interest';
import organizationRoutes from './routes/organization';
import eventRoutes from './routes/event';
import registrationRoutes from './routes/registration';
import AuthController from './controllers/AuthController';
import CategoryController from './controllers/CategoryController';
import InterestController from './controllers/InterestController';
import OrganizationController from './controllers/OrganizationController';
import EventController from './controllers/EventController';
import RegistrationController from './controllers/RegistrationController';

export function createApp(
    authController: AuthController,
    categoryController: CategoryController,
    interestController: InterestController,
    organizationController: OrganizationController,
    eventController: EventController,
    registrationController: RegistrationController
): Express {
    const app = express();

    app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
    app.use(express.json());
    app.use(cookieParser());

    app.use('/auth', authRoutes(authController));
    app.use('/categories', categoryRoutes(categoryController));
    app.use('/interests', interestRoutes(interestController));
    app.use('/organizations', organizationRoutes(organizationController));
    app.use('/events', eventRoutes(eventController));
    app.use('/', registrationRoutes(registrationController));

    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
    });

    return app;
}