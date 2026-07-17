// server.ts
import 'dotenv/config';
import { createApp } from './app';
import PostgresDatabase from './db/PostgresDatabase';

// Repositories
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
import PlatformSettingsRepository from './repositories/PlatformSettingsRepository';
import AllowedDomainsRepository from './repositories/AllowedDomainsRepository';
import AccountStatusLogRepository from './repositories/AccountStatusLogRepository';
import EventStatusLogRepository from './repositories/EventStatusLogRepository';
import PlatformSettingsLogRepository from './repositories/PlatformSettingsLogRepository';
import NotificationRepository from './repositories/NotificationRepository';
import PushSubscriptionRepository from './repositories/PushSubscriptionRepository';

// Services
import StudentService from './services/StudentService';
import OrganizerService from './services/OrganizerService';
import AuthService from './services/AuthService';
import EmailService from './services/EmailService';
import CategoryService from './services/CategoryService';
import InterestService from './services/InterestService';
import OrganizationService from './services/OrganizationService';
import EventService from './services/EventService';
import RegistrationService from './services/RegistrationService';
import PlatformSettingsService from './services/PlatformSettingsService';
import AdminActionService from './services/AdminActionService';
import NotificationService from './services/NotificationService';
import AuditLogService from './services/AuditLogService';
import UserService from './services/UserService';

// Controllers
import AuthController from './controllers/AuthController';
import CategoryController from './controllers/CategoryController';
import InterestController from './controllers/InterestController';
import OrganizationController from './controllers/OrganizationController';
import EventController from './controllers/EventController';
import RegistrationController from './controllers/RegistrationController';
import PlatformSettingsController from './controllers/PlatformSettingsController';
import AdminActionController from './controllers/AdminActionController';
import NotificationController from './controllers/NotificationController';
import AuditLogController from './controllers/AuditLogController';
import UserController from './controllers/UserController';

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
const platformSettingsRepository = new PlatformSettingsRepository(db);
const allowedDomainsRepository = new AllowedDomainsRepository(db);
const accountStatusLogRepository = new AccountStatusLogRepository(db);
const eventStatusLogRepository = new EventStatusLogRepository(db);
const platformSettingsLogRepository = new PlatformSettingsLogRepository(db);
const notificationRepository = new NotificationRepository(db);
const pushSubscriptionRepository = new PushSubscriptionRepository(db);

// Services
const studentService = new StudentService(db, userRepository, studentRepository);
const organizerService = new OrganizerService(db, userRepository, organizerRepository);
const emailService = new EmailService();
const platformSettingsService = new PlatformSettingsService(platformSettingsRepository, allowedDomainsRepository, platformSettingsLogRepository);
const authService = new AuthService(
    db,
    loginAttemptRepository,
    userRepository,
    adminRepository,
    organizerService,
    studentService,
    emailVerificationTokenRepository,
    refreshTokenRepository,
    passwordResetTokenRepository,
    emailService,
    platformSettingsService
);
const notificationService = new NotificationService(notificationRepository, pushSubscriptionRepository);
const interestService = new InterestService(interestRepository, studentInterestRepository);
const categoryService = new CategoryService(db, categoryRepository, interestRepository);
const organizationService = new OrganizationService(organizationRepository);
const eventService = new EventService(db, eventRepository, categoryRepository, eventStatusLogRepository, registrationRepository, platformSettingsService, notificationService);
const registrationService = new RegistrationService(db, registrationRepository, eventRepository, notificationService);
const adminActionService = new AdminActionService(db, userRepository, adminRepository, accountStatusLogRepository, refreshTokenRepository, notificationService);
const auditLogService = new AuditLogService(accountStatusLogRepository, eventStatusLogRepository, platformSettingsLogRepository);
const userService = new UserService(userRepository, studentRepository, organizerRepository);

// Controllers
const authController = new AuthController(authService);
const categoryController = new CategoryController(categoryService);
const interestController = new InterestController(interestService);
const organizationController = new OrganizationController(organizationService, organizerRepository);
const eventController = new EventController(eventService);
const registrationController = new RegistrationController(registrationService);
const platformSettingsController = new PlatformSettingsController(platformSettingsService);
const adminActionController = new AdminActionController(adminActionService);
const notificationController = new NotificationController(notificationService);
const auditLogController = new AuditLogController(auditLogService);
const userController = new UserController(userService);

const app = createApp(
    authController,
    userController,
    categoryController,
    interestController,
    organizationController,
    eventController,
    registrationController,
    platformSettingsController,
    adminActionController,
    notificationController,
    auditLogController
);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});