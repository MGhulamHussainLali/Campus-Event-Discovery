import { IDatabase,IDatabaseClient } from "../interfaces/DBConnection"
export type TokenType=
{
    userId:number,
    tokenHash:string,
    expiresAt:Date,
    userAgent:string|null,
    ipAddress:string|null,
    createdAt:Date
}

class RefreshTokenRepository
{
    constructor(private db:IDatabase)
    {
    
    }
    private mapObject(row: {id: number, user_id: number, token_hash: string, expires_at: Date, revoked: boolean, user_agent: string | null, ip_address: string | null, created_at: Date}) {
    return {
        id: row.id,
        userId: row.user_id,
        tokenHash: row.token_hash,
        expiresAt: row.expires_at,
        revoked: row.revoked,
        userAgent: row.user_agent,
        ipAddress: row.ip_address,
        createdAt: row.created_at
    }
}
    async create (userId:number,tokenHash:string,expiresAt:Date,userAgent:string|null,ipAddress:string|null,client?:IDatabaseClient):Promise<boolean>
    {
        const db=client??this.db; 
        try
        {
            const result=await db.query("INSERT INTO Refresh_Token(user_id,token_hash,expires_at,user_agent,ip_address) VALUES($1,$2,$3,$4,$5) RETURNING *",[userId,tokenHash,expiresAt,userAgent,ipAddress])
            return (result.rowCount??0)>0;
        }
        catch(err:any)
        {
            throw new Error(err.message);
        }
    }
    async findByTokenHash(tokenHash:string, client?:IDatabaseClient):Promise<TokenType|null>
    {
        const db=client??this.db;
        try
        {
            const result=await db.query("SELECT * FROM Refresh_Token WHERE token_hash=$1",[tokenHash])
            return (result.rowCount??0)?this.mapObject(result.rows[0]):null
        }
        catch (error:any)
        {
            throw new Error(error.message);
        }  

    }
    async revoke(id:number,client?:IDatabaseClient):Promise<boolean>
    {
        const db=client??this.db
        try
        {
            const result=await db.query("UPDATE Refresh_Token SET revoked=true WHERE id=$1",[id]);
            return (result.rowCount??0)>0;
        }
        catch(err:any)
        {
            throw new Error(err.message);
        }
    }
    async revokeAllForUser(userId:number,client?:IDatabaseClient):Promise<boolean>
    {
        const db=client??this.db
        try
        {
            const result=await db.query("UPDATE Refresh_Token SET revoked=true WHERE user_id=$1",[userId])
            return (result.rowCount??0)>0;
        }
        catch(err:any)
        {
            throw new Error(err.message);
        }
    }

}
export default RefreshTokenRepository
