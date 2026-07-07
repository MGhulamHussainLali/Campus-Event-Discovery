import { IDatabase } from '../interfaces/DBConnection'
import UserRepository from '../repositories/UserRepository'
import AdminRepository from '../repositories/AdminRepository'
import User from '../models/user';
import Admin from '../models/admin';

class AdminService {
    constructor(
        private db: IDatabase,
        private userRepository: UserRepository,
        private adminRepository: AdminRepository
    ) {

    }
    async createAdminUser(userData: User, adminData: Admin): Promise<number> {

        const client = await this.db.getClient();
        try {
            await client.query("BEGIN");
            const id=await this.userRepository.create(userData, client);
            await this.adminRepository.create(adminData,id, client);
            await client.query("COMMIT")
            return id;
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

export default AdminService