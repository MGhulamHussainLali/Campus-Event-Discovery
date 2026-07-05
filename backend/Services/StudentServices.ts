import { IDatabase } from '../interfaces/DBConnection'
import UserRepository from '../repositories/UserRepository'
import StudentRepository from '../repositories/StudentRepository'
import User from '../models/user';
import Student from '../models/student';

class StudentService {
    constructor(
        private db: IDatabase,
        private userRepository: UserRepository,
        private studentRepository: StudentRepository
    ) {

    }
    async createStudentUser(userData: User, studentData: Student): Promise<boolean> {

        const client = await this.db.getClient();
        try {
            await client.query("BEGIN");
            await this.userRepository.create(userData, client);
            await this.studentRepository.create(studentData, client);
            await client.query("COMMIT")
            return true;
        }
        catch (error: any) 
        {
            await client.query('ROLLBACK');
            throw error;
        }
        finally 
        {
            client.release();
        }


    }

}

export default StudentService