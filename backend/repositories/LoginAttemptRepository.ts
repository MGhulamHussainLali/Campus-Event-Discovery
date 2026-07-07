import {IDatabase,IDatabaseClient} from '../interfaces/DBConnection'
class LoginAttemptRepository
{
    constructor(
        private db:IDatabase
    )
    {

    }
    async create(userId: number | null, email: string, success: boolean, ipAddress: string | null, client?:IDatabaseClient):Promise<boolean>
    {   const db=client??this.db;
        try
        {
            const result= await db.query("INSERT INTO Login_Attempt (user_id,email,success,ip_address) VALUES($1,$2,$3,$4) RETURNING *",[userId,email,success,ipAddress])
            return (result.rowCount??0)>0;
        }
        catch(error:any)
        {
            throw new Error(error.message);
        }
    }
    async countRecentFailedAttempts(email: string, sinceMinutes: number, client?:IDatabaseClient): Promise<number>
    {
        const db=client??this.db;
        try{
            const cutoff = new Date(Date.now() - sinceMinutes * 60 * 1000);
            const result = await db.query("SELECT COUNT(*) FROM Login_Attempt WHERE email=$1 AND success=false AND attempted_at>=$2", [email, cutoff])
            return parseInt(result.rows[0].count,10)
        }
        catch(error:any)
        {
            throw new Error(error.message)
        }
    }
}
export default LoginAttemptRepository