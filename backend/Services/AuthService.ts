import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { IDatabase } from '../interfaces/DBConnection';
import UserRepository from '../repositories/UserRepository';
import { School } from '../models/student';
import Organizer from '../models/organizer';
import Student from '../models/student'
import StudentService from './StudentService'
import EmailVerificationTokenRepository from '../repositories/EmailVerificationTokenRepository';
import RefreshTokenRepository from '../repositories/RefreshTokenRepository';
import PasswordResetTokenRepository from '../repositories/PasswordResetTokenRepository';
import User from '../models/user';
import OrganizerService from './OrganizerService';
import LoginAttemptRepository from '../repositories/LoginAttemptRepository';
import AdminRepository from '../repositories/AdminRepository';
import EmailService from './EmailService';
import PlatformSettingsService from './PlatformSettingsService';

class AuthService {
    private static readonly SALT_ROUNDS = 12;
    constructor(
        private db: IDatabase,
        private loginAttemptRepository: LoginAttemptRepository,
        private userRepository: UserRepository,
        private adminRepository: AdminRepository,
        private organizerService: OrganizerService,
        private studentService: StudentService,
        private emailVerificationTokenRepository: EmailVerificationTokenRepository,
        private refreshTokenRepository: RefreshTokenRepository,
        private passwordResetTokenRepository: PasswordResetTokenRepository,
        private emailService: EmailService,
        private platformSettingsService: PlatformSettingsService,
        private maxAttempts: number = 5,
        private loginMinutesAllowed: number = 5
    ) {

    }

    async signupStudent(name: string, email: string, password: string, rollNumber: number, school: School): Promise<boolean> {
        const exists: boolean = await this.userRepository.existsByEmail(email);
        if (exists) {
            throw new Error("Email already exists")
        }
        const restrictToDomains = await this.platformSettingsService.getSetting('restrict_to_domains');
        if (restrictToDomains === true) {
            const allowedDomains = await this.platformSettingsService.getAllowedDomains();
            const emailDomain = email.split('@')[1];
            if (!emailDomain || !allowedDomains.includes(emailDomain)) {
                throw new Error("Email domain is not permitted for signup");
            }
        }

        const requireApproval = await this.platformSettingsService.getSetting('require_student_approval');
        const accountStatus = (requireApproval === false) ? 'approved' : 'pending';

        const hashedPassword = await bcrypt.hash(password, AuthService.SALT_ROUNDS);
        const newUser = new User(0, name, email, hashedPassword, null, 'student', accountStatus, false, new Date());
        try {
            const newStudent = new Student(0, name, email, hashedPassword, null, accountStatus, false, new Date(), rollNumber, school)
            const id = await this.studentService.createStudentUser(newUser, newStudent);
            const rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await this.emailVerificationTokenRepository.create(id, tokenHash, expiresAt);
            await this.emailService.sendVerificationEmail(email, rawToken);
            return true;
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    }

    async signupOrganizer(name: string, email: string, password: string, organizationId: number): Promise<boolean> {
        const exists: boolean = await this.userRepository.existsByEmail(email);
        if (exists) {
            throw new Error("Email already exists");
        }
        const restrictToDomains = await this.platformSettingsService.getSetting('restrict_to_domains');
        if (restrictToDomains === true) {
            const allowedDomains = await this.platformSettingsService.getAllowedDomains();
            const emailDomain = email.split('@')[1];
            if (!emailDomain || !allowedDomains.includes(emailDomain)) {
                throw new Error("Email domain is not permitted for signup");
            }
        }
        const requireApproval = await this.platformSettingsService.getSetting('require_organizer_approval');
        const accountStatus = (requireApproval === false) ? 'approved' : 'pending';

        const hashedPassword = await bcrypt.hash(password, AuthService.SALT_ROUNDS);
        const newUser = new User(0, name, email, hashedPassword, null, 'organizer', accountStatus, false, new Date());

        try {
            const newOrganizer = new Organizer(0, name, email, hashedPassword, null, accountStatus, false, new Date(), organizationId);
            const id = await this.organizerService.createOrganizerUser(newUser, newOrganizer);
            const rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await this.emailVerificationTokenRepository.create(id, tokenHash, expiresAt);
            await this.emailService.sendVerificationEmail(email, rawToken);
            return true;
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    }

    async login(email: string, password: string, userAgent: string | null, ipAddress: string | null): Promise<{ accessToken: string, refreshToken: string }> {

        const attempts: number = await this.loginAttemptRepository.countRecentFailedAttempts(email, this.loginMinutesAllowed)
        if (attempts >= this.maxAttempts) {
            throw new Error("Maximum number of Login Attempts failed. Try after some time");
        }
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Invalid email or password")
        }
        const hashed_password = user.getHashedPassword();
        const passwordMatch = await bcrypt.compare(password, hashed_password);
        if (!passwordMatch) {

            await this.loginAttemptRepository.create(user.getId(), email, false, ipAddress)
            throw new Error("Invalid email or password");
        }
        if (!user.getEmailVerified()) {
            throw new Error("Email not verified")
        }

        if (user.getAccountStatus() === 'pending') throw new Error('Account pending approval');
        if (user.getAccountStatus() === 'rejected') throw new Error('Account rejected');
        if (user.getAccountStatus() === 'suspended') throw new Error('Account suspended');
        if (user.getAccountStatus() !== 'approved') throw new Error('Account not approved');

        let isSuperAdmin: boolean | undefined = undefined;
        if (user.getRole() === 'admin') {
            const admin = await this.adminRepository.findById(user.getId());
            isSuperAdmin = admin?.getIsSuperAdmin();
        }

        const accessToken = jwt.sign(
            { id: user.getId(), role: user.getRole(), isSuperAdmin },
            process.env.JWT_SECRET as string,
            { expiresIn: '59m' }
        );
        const rawRefreshToken = crypto.randomBytes(32).toString('hex');
        const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await this.refreshTokenRepository.create(user.getId(), refreshTokenHash, expiresAt, userAgent, ipAddress);
        await this.loginAttemptRepository.create(user.getId(), email, true, ipAddress)
        return { accessToken, refreshToken: rawRefreshToken };
    }

    async verifyEmail(rawToken: string): Promise<boolean> {
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const tokenRow = await this.emailVerificationTokenRepository.findByTokenHash(tokenHash);
        if (!tokenRow) {
            throw new Error("Invalid or expired token");
        }
        if (tokenRow.expiresAt < new Date()) {
            throw new Error("Invalid or expired token");
        }
        await this.userRepository.updateEmailVerified(tokenRow.userId, true);
        await this.emailVerificationTokenRepository.delete(tokenRow.id);
        return true;
    }

    async refreshToken(rawRefreshToken: string): Promise<{ accessToken: string, refreshToken: string }> {
        const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
        const tokenRow = await this.refreshTokenRepository.findByTokenHash(tokenHash);
        if (!tokenRow || tokenRow.revoked || tokenRow.expiresAt < new Date()) {
            throw new Error("Invalid or expired refresh token");
        }
        const user = await this.userRepository.findById(tokenRow.userId);
        if (!user) {
            throw new Error("User not found");
        }
        await this.refreshTokenRepository.revoke(tokenRow.id);
        const accessToken = jwt.sign(
            { id: user.getId(), role: user.getRole() },
            process.env.JWT_SECRET as string,
            { expiresIn: '15m' }
        );
        const newRawRefreshToken = crypto.randomBytes(32).toString('hex');
        const newRefreshTokenHash = crypto.createHash('sha256').update(newRawRefreshToken).digest('hex');
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await this.refreshTokenRepository.create(user.getId(), newRefreshTokenHash, expiresAt, tokenRow.userAgent, tokenRow.ipAddress);
        return { accessToken, refreshToken: newRawRefreshToken };
    }

    async logout(rawRefreshToken: string): Promise<boolean> {
        const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
        const tokenRow = await this.refreshTokenRepository.findByTokenHash(tokenHash);
        if (!tokenRow) {
            return true;
        }
        await this.refreshTokenRepository.revoke(tokenRow.id);
        return true;
    }
    async logoutAllDevices(userId: number): Promise<boolean> {
        await this.refreshTokenRepository.revokeAllForUser(userId);
        return true;
    }
    async requestPasswordReset(email: string): Promise<boolean> {

        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            return true;
        }
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
        await this.passwordResetTokenRepository.create(user.getId(), tokenHash, expiresAt);
        await this.emailService.sendPasswordResetEmail(email, rawToken);
        return true;
    }

    async resetPassword(rawToken: string, newPassword: string): Promise<boolean> {
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const tokenRow = await this.passwordResetTokenRepository.findByTokenHash(tokenHash);
        if (!tokenRow || tokenRow.used || tokenRow.expiresAt < new Date()) {
            throw new Error("Invalid or expired token");
        }

        const hashedPassword = await bcrypt.hash(newPassword, AuthService.SALT_ROUNDS);
        await this.userRepository.updatePassword(tokenRow.userId, hashedPassword);
        await this.passwordResetTokenRepository.markUsed(tokenRow.id);
        await this.refreshTokenRepository.revokeAllForUser(tokenRow.userId);
        return true;
    }
    async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<boolean> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const passwordMatch = await bcrypt.compare(oldPassword, user.getHashedPassword());
        if (!passwordMatch) {
            throw new Error("Incorrect current password");
        }
        const hashedPassword = await bcrypt.hash(newPassword, AuthService.SALT_ROUNDS);
        await this.userRepository.updatePassword(userId, hashedPassword);
        return true;
    }
}
export default AuthService