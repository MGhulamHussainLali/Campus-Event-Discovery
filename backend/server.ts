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
import LoginAttemptRepository from './repositories/LoginAttemptRepository';
import CategoryRepository from './repositories/CategoryRepository';
import InterestRepository from './repositories/InterestRepository';
import StudentInterestRepository from './repositories/StudentInterestRepository';
import OrganizationRepository from './repositories/OrganizationRepository';
import EventRepository from './repositories/EventRepository';
import RegistrationRepository from './repositories/RegistrationRepository';

import StudentService from './services/StudentService';
import OrganizerService from './services/OrganizerService';
import AuthService from './services/AuthService';
import EmailService from './services/EmailService';
import CategoryService from './services/CategoryService';
import InterestService from './services/InterestService';
import OrganizationService from './services/OrganizationService';
import EventService from './services/EventService';
import RegistrationService from './services/RegistrationService';

import AuthController from './controllers/AuthController';
import CategoryController from './controllers/CategoryController';
import InterestController from './controllers/InterestController';
import OrganizationController from './controllers/OrganizationController';
import EventController from './controllers/EventController';
import RegistrationController from './controllers/RegistrationController';

const db = new PostgresDatabase();

// Repositories
const userRepository = new UserRepository(db);
const studentRepository = new StudentRepository(db);
const organizerRepository = new OrganizerRepository(db);
const adminRepository = new AdminRepository(db);
const emailVerificationTokenRepository = new EmailVerificationTokenRepository(db);
const refreshTokenRepository = new RefreshTokenRepository(db);
const passwordResetTokenRepository = new PasswordResetTokenRepository(db);
const loginAttemptRepository = new LoginAttemptRepository(db);
const categoryRepository = new CategoryRepository(db);
const interestRepository = new InterestRepository(db);
const studentInterestRepository = new StudentInterestRepository(db);
const organizationRepository = new OrganizationRepository(db);
const eventRepository = new EventRepository(db);
const registrationRepository = new RegistrationRepository(db);

// Services
const studentService = new StudentService(db, userRepository, studentRepository);
const organizerService = new OrganizerService(db, userRepository, organizerRepository);
const emailService = new EmailService();
const authService = new AuthService(
    db,
    loginAttemptRepository,
    userRepository,
    organizerService,
    studentService,
    emailVerificationTokenRepository,
    refreshTokenRepository,
    passwordResetTokenRepository,
    emailService
);
const categoryService = new CategoryService(categoryRepository);
const interestService = new InterestService(interestRepository, studentInterestRepository);
const organizationService = new OrganizationService(organizationRepository);
const eventService = new EventService(eventRepository, categoryRepository);
const registrationService = new RegistrationService(db, registrationRepository, eventRepository);

// Controllers
const authController = new AuthController(authService);
const categoryController = new CategoryController(categoryService);
const interestController = new InterestController(interestService);
const organizationController = new OrganizationController(organizationService);
const eventController = new EventController(eventService);
const registrationController = new RegistrationController(registrationService);

const app = createApp(
    authController,
    categoryController,
    interestController,
    organizationController,
    eventController,
    registrationController
);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});