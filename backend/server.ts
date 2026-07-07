// server.ts
import 'dotenv/config';
import { createApp } from './app';
import PostgresDatabase from './db/PostgresDatabase';
import UserRepository from './repositories/UserRepository';
import StudentRepository from './repositories/StudentRepository';
import OrganizerRepository from './repositories/OrganizerRepository';
import AdminRepository from './repositories/AdminRepository';
import EmailVerificationTokenRepository from './repositories/EmailVerificationTokenRepository';
import RefreshTokenRepository from './repositories/RefreshTokenRepository';
import PasswordResetTokenRepository from './repositories/PasswordResetTokenRepository';
import StudentService from './services/StudentService';
import OrganizerService from './services/OrganizerService';
import AuthService from './services/AuthService';
import AuthController from './controllers/AuthController';
import LoginAttemptRepository from './repositories/LoginAttemptRepository';

const db = new PostgresDatabase();

const userRepository = new UserRepository(db);
const studentRepository = new StudentRepository(db);
const organizerRepository = new OrganizerRepository(db);
const adminRepository = new AdminRepository(db);
const emailVerificationTokenRepository = new EmailVerificationTokenRepository(db);
const refreshTokenRepository = new RefreshTokenRepository(db);
const passwordResetTokenRepository = new PasswordResetTokenRepository(db);
const loginAttemptRepository=new LoginAttemptRepository(db)
const studentService = new StudentService(db, userRepository, studentRepository);
const organizerService = new OrganizerService(db, userRepository, organizerRepository);

const authService = new AuthService(
    db,
    loginAttemptRepository,
    userRepository,
    organizerService,
    studentService,
    emailVerificationTokenRepository,
    refreshTokenRepository,
    passwordResetTokenRepository,
    5,5
);

const authController = new AuthController(authService);

const app = createApp(authController);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});