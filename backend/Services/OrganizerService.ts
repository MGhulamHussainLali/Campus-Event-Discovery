import { IDatabase } from '../interfaces/DBConnection.ts'
import UserRepository from '../repositories/UserRepository.ts'
import OrganizerRepository from '../repositories/OrganizerRepository.ts'
import User from '../models/user.ts';
import Organizer from '../models/organizer.ts';

class OrganizerService {
    constructor(
        private db: IDatabase,
        private userRepository: UserRepository,
        private organizerRepository: OrganizerRepository
    ) {

    }
    async createOrganizerUser(userData: User, organizerData: Organizer): Promise<number> {

        const client = await this.db.getClient();
        try {
            await client.query("BEGIN");
            const id=await this.userRepository.create(userData, client);
            await this.organizerRepository.create(organizerData, id,client);
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

export default OrganizerService