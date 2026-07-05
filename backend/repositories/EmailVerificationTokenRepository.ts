import {IDatabase,IDatabaseClient} from '../interfaces/DBConnection'
class EmailVerificationTokenRepository
{
    constructor(
        private db:IDatabase
    )
    {

    }
    private mapObject(token:{id:number,user_id:number,token_hash:string,expires_at:Date,created_at:Date})
    {
        return {
            id:token.id,
            userId:token.user_id,
            tokenHash:token.token_hash,
            expiresAt:token.expires_at,
            createdAt:token.created_at
        }

    }
    async create(userId:number,tokenHash:string,expiresAt:Date,client?:IDatabaseClient):Promise<boolean>
    {
        const db=client??this.db;
        try{
            const result= await db.query("INSERT INTO Email_Verification_Token(user_Id,token_Hash,expires_At) VALUES($1,$2,$3) RETURNING *",[userId,tokenHash,expiresAt])
            return (result.rowCount??0)>0;
        }
        catch(err:any)
        {
            throw new Error(err.message);
        }

    }
    async findByTokenHash(tokenHash:string,client?:IDatabaseClient):Promise<{id:number,userId:number,tokenHash:string,expiresAt:Date,createdAt:Date}|null>
    {
        const db=client??this.db; 
        try
        {
            const result=await db.query("SELECT * FROM Email_Verification_Token WHERE token_hash=$1",[tokenHash]);
            return ( result.rowCount??0)==0? null :this.mapObject(result.rows[0]);
        }
        catch (err:any)
        {
            throw new Error(err.message);
        }
    }
    async deleteByUserId(userId:number,client?:IDatabaseClient):Promise<boolean>
    {
        const db=client??this.db;
        try
        {
            const result=await db.query("DELETE FROM Email_Verification_Token WHERE user_id=$1 RETURNING *",[userId]);
            return (result.rowCount??0)>0
        }
        catch(err:any)
        {
            throw new Error(err.message);
        }
    }
    async delete(id:number,client?:IDatabaseClient):Promise<boolean>
    {
        const db=client??this.db;
        try
        {
            const result= await db.query("DELETE FROM Email_Verification_Token WHERE id=$1 RETURNING *",[id])
            return (result.rowCount??0)>0
        }
        catch(err:any)
        {
            throw new Error(err.message)
        }
    }

}
export default EmailVerificationTokenRepository;