import { IDatabase } from '../interfaces/DBConnection';
import UserRepository from '../repositories/UserRepository';
import AdminRepository from '../repositories/AdminRepository';
import AccountStatusLogRepository from '../repositories/AccountStatusLogRepository';
import RefreshTokenRepository from '../repositories/RefreshTokenRepository';
import User from '../models/user';
import Admin from '../models/admin';
import bcrypt from 'bcrypt';

class AdminActionService {
    private static readonly SALT_ROUNDS = 12;

    constructor(
        private db: IDatabase,
        private userRepository: UserRepository,
        private adminRepository: AdminRepository,
        private accountStatusLogRepository: AccountStatusLogRepository,
        private refreshTokenRepository: RefreshTokenRepository
    ) {}

    async approveAccount(userId: number, adminId: number): Promise<boolean> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const oldStatus = user.getAccountStatus() as 'pending' | 'approved' | 'rejected' | 'suspended';
        const client = await this.db.getClient();
        try {
            await client.query("BEGIN");
            const result = await this.userRepository.updateAccountStatus(userId, 'approved', client);
            await this.accountStatusLogRepository.create(userId, adminId, oldStatus, 'approved', null, client);
            await client.query("COMMIT");
            return result;
        } catch (error: any) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async rejectAccount(userId: number, adminId: number, reason: string): Promise<boolean> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const oldStatus = user.getAccountStatus() as 'pending' | 'approved' | 'rejected' | 'suspended';
        const client = await this.db.getClient();
        try {
            await client.query("BEGIN");
            const result = await this.userRepository.updateAccountStatus(userId, 'rejected', client);
            await this.accountStatusLogRepository.create(userId, adminId, oldStatus, 'rejected', reason, client);
            await client.query("COMMIT");
            return result;
        } catch (error: any) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async suspendAccount(userId: number, adminId: number, reason: string): Promise<boolean> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const oldStatus = user.getAccountStatus() as 'pending' | 'approved' | 'rejected' | 'suspended';
        const client = await this.db.getClient();
        try {
            await client.query("BEGIN");
            const result = await this.userRepository.updateAccountStatus(userId, 'suspended', client);
            await this.accountStatusLogRepository.create(userId, adminId, oldStatus, 'suspended', reason, client);
            await this.refreshTokenRepository.revokeAllForUser(userId, client);
            await client.query("COMMIT");
            return result;
        } catch (error: any) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async getPendingAccounts(role?: string): Promise<User[] | null> {
        return await this.userRepository.findAll({ role, accountStatus: 'pending' });
    }

    async createAdmin(name: string, email: string, password: string, isSuperAdmin: boolean, createdByAdminId: number): Promise<boolean> {
        const exists = await this.userRepository.existsByEmail(email);
        if (exists) {
            throw new Error("Email already exists");
        }
        const hashedPassword = await bcrypt.hash(password, AdminActionService.SALT_ROUNDS);
        const newUser = new User(0, name, email, hashedPassword, null, 'admin', 'approved', true, new Date());
        const client = await this.db.getClient();
        try {
            await client.query("BEGIN");
            const id = await this.userRepository.create(newUser, client);
            const newAdmin = new Admin(id, name, email, hashedPassword, null, 'approved', true, new Date(), isSuperAdmin, createdByAdminId);
            await this.adminRepository.create(newAdmin, id, client);
            await client.query("COMMIT");
            return true;
        } catch (error: any) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async getAllAdmins(): Promise<Admin[] | null> {
        return await this.adminRepository.findAll();
    }
}
export default AdminActionService