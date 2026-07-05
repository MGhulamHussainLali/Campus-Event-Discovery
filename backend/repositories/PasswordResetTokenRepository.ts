import {IDatabaseClient,IDatabase} from '../interfaces/DBConnection'
export type PasswordResetToken={
    id:number
    userId:number, 
    tokenHash:string, 
    expiresAt:Date
    used:boolean
    createdAt:Date
}

class PasswordResetTokenRepository
{
constructor( private db:IDatabase)
{

}
private mapObject(obj:{id:number,user_id:number,token_hash:string,expires_at:Date,used:boolean,created_at:Date}):PasswordResetToken
{
    const token= {id:obj.id,userId:obj.user_id,tokenHash:obj.token_hash,expiresAt:obj.expires_at,used:obj.used,createdAt:obj.created_at}
    return token;
}
async create(userId:number,tokenHash:string,expiresAt:Date,client?:IDatabaseClient):Promise<boolean>
{
    const db=client??this.db;
    try
    {
        const result=await db.query("INSERT INTO Password_Reset_Token(user_id,token_hash,expires_at) VALUES($1,$2,$3) RETURNING *",[userId,tokenHash,expiresAt])
        return (result.rowCount??0)>0
    }
    catch(err:any)
    {
        throw new Error(err.message);
    }
}
async findByTokenHash(tokenHash:string,client?:IDatabaseClient):Promise<PasswordResetToken|null>
{
const db=client??this.db;
try
{
    const result=await db.query("SELECT * FROM  Password_Reset_Token WHERE token_hash=$1",[tokenHash])
    return ((result.rowCount??0) ? this.mapObject(result.rows[0]): null)

}
catch(err:any)
{
    throw new Error(err.message);
}
}  
async markUsed(id:number,client?:IDatabaseClient):Promise<boolean>
{
    const db=client??this.db; 
    try
    {
        const result=await db.query("UPDATE Password_Reset_Token SET used=true WHERE id=$1 RETURNING *",[id])
        return (result.rowCount??0)>0
    }
    catch(error:any)
    {
        throw new Error(error.message);
    }
}
}
export default PasswordResetTokenRepository