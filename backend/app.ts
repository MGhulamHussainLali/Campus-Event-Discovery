// app.ts
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth';
import AuthController from './controllers/AuthController';

export function createApp(authController: AuthController): Express {
    const app = express();

    app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
    app.use(express.json());
    app.use(cookieParser());

    app.use('/auth', authRoutes(authController));

    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
    });

    return app;
}