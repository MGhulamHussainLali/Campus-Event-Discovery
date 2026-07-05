import { IDatabase } from '../interfaces/DBConnection'
import UserRepository from '../repositories/UserRepository'
import OrganizerRepository from '../repositories/OrganizerRepository.ts'
import User from '../models/user';
import Organizer from '../models/organizer';

class OrganizerService {
    constructor(
        private db: IDatabase,
        private userRepository: UserRepository,
        private organizerRepository: OrganizerRepository
    ) {

    }
    async createOrganizerUser(userData: User, organizerData: Organizer): Promise<boolean> {

        const client = await this.db.getClient();
        try {
            await client.query("BEGIN");
            await this.userRepository.create(userData, client);
            await this.organizerRepository.create(organizerData, client);
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

export default OrganizerService