// UserService.ts
import UserRepository, { UserUpdateFields } from '../repositories/UserRepository';
import StudentRepository, { StudentUpdateFields } from '../repositories/StudentRepository';
import OrganizerRepository, { OrganizerUpdateFields } from '../repositories/OrganizerRepository';
import Student from '../models/student';
import Organizer from '../models/organizer';
import User from '../models/user';

class UserService {
    constructor(
        private userRepository: UserRepository,
        private studentRepository: StudentRepository,
        private organizerRepository: OrganizerRepository
    ) { }

    async getMyProfile(userId: number): Promise<User | null> {
        return await this.userRepository.findById(userId);
    }

    async updateMyProfile(userId: number, fields: UserUpdateFields): Promise<User | null> {
        // Prevent self-service changes to security/moderation-sensitive fields
        const { accountStatus, emailVerified, ...safeFields } = fields as any;
        return await this.userRepository.update(userId, safeFields);
    }

    // UserService.ts
    async updateMyStudentDetails(studentId: number, fields: StudentUpdateFields): Promise<Student | null> {
        return await this.studentRepository.update(studentId, fields);
    }

    async updateMyOrganizerDetails(organizerId: number, fields: OrganizerUpdateFields): Promise<Organizer | null> {
        const { organizationId, ...safeFields } = fields as any;
        return await this.organizerRepository.update(organizerId, safeFields);
    }
}
export default UserService