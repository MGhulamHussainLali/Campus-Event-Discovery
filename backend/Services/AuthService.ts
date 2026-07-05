import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { IDatabase } from '../interfaces/DBConnection';
import UserRepository from '../repositories/UserRepository';
import { School } from '../models/student';
// import EmailVerificationTokenRepository from '../repositories/EmailVerificationTokenRepository';
// import RefreshTokenRepository from '../repositories/RefreshTokenRepository';
// import PasswordResetTokenRepository from '../repositories/PasswordResetTokenRepository';
import User from '../models/user';


class AuthService {
    constructor(
        private db: IDatabase,
        private userRepository: UserRepository
        // private emailVerificationTokenRepository: EmailVerificationTokenRepository,
        // private refresh RefreshTokenRepository,
        // private passwordResetTokenReposTokenRepository:itory: PasswordResetTokenRepository
    ) {

    }
    async signupStudent(name: string, email: string, password: string, rollNumber: number, school: School): Promise<Student | null> {
        const exists: boolean = await this.userRepository.existsByEmail(email);

        if (exists) {
            throw new Error("Email already exists")

        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = new User(0, name, email, hashedPassword, null, 'student', 'pending', false, new Date()
        );
        const client = await this.db.getClient();
        await this.userRepository.create(newUser, client);


    }
}
export default AuthService