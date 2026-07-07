import Admin from '../models/admin.ts'
import { IDatabase, IDatabaseClient } from '../interfaces/DBConnection.ts'

type AdminUpdateFields = {
    isSuperAdmin?: boolean;
    createdByAdminId?: number | null;
};

const fieldMap: Record<string, string> = {
    isSuperAdmin: 'is_super_admin',
    createdByAdminId: 'created_by_admin_id'
};

class AdminRepository
{
    constructor(
        private db:IDatabase
    )
    {

    }
    private mapRowToAdmin(row:any):Admin
    {
        return new Admin(
            row.admin_id,
            row.name, 
            row.email, 
            row.hashed_password, 
            row.picture_url, 
            row.account_status, 
            row.email_verified,
            row.created_at,
            row.is_super_admin, 
            row.created_by_admin_id 
           
        ); 
    }
    async create(admin:Admin,id:number, client?:IDatabaseClient):Promise<boolean>
    {
        const db=client??this.db;
        try
        {
            const result=await db.query("INSERT INTO admin (admin_id,is_super_admin,created_by_admin_id) VALUES($1,$2,$3) RETURNING admin_id",[id,admin.getIsSuperAdmin(),admin.getCreatedByAdminId()])
            return (result.rowCount??0)>0;
        }
        catch(err:any)
        {
            throw err;
        }
    }

    async findById(adminId:number,client?:IDatabaseClient):Promise<Admin|null>
    {
        const db=client??this.db;
        try
        {
            const result=await db.query("SELECT u.*, a.is_super_admin, a.created_by_admin_id FROM admin a JOIN users u ON u.id=a.admin_id Where a.admin_id=$1",[adminId])
            return result.rows.length>0? this.mapRowToAdmin(result.rows[0]):null
        }
        catch(err:any)
        {
            throw new Error(err.message);
        }
    }
    async findAll(client?:IDatabaseClient):Promise<Admin[]|null>
    {
        const db = client ?? this.db;
        try
        {
            const result=await db.query("SELECT u.*,a.is_super_admin,a.created_by_admin_id FROM admin a JOIN users u ON u.id=a.admin_id",[])
            if (result.rows.length==0)
            {
                return null;
            }
            else 
            {
                return result.rows.map((row:any)=>this.mapRowToAdmin(row));
            }
        }
        catch(err:any)
        {
            throw new Error(err.message);
        }
    }

    async update(adminId: number,fields: AdminUpdateFields,client?:IDatabaseClient):Promise<boolean>
    {
        const db = client ?? this.db;
        const entries=Object.entries(fields); 
        const setClause= entries.map(([key],i)=>`${fieldMap[key]}=$${i+1}`).join(',');
        const setValues = entries.map(([, value]) => value);
        try
        {
            const result=await db.query(`UPDATE admin SET ${setClause} WHERE admin_id=$${entries.length+1} RETURNING *`,[...setValues,adminId]);
            return (result.rowCount??0)>0
        }
        catch(err:any)
        {
            throw new Error(err.message);
        }
    }
    async delete(adminId: number, client?: IDatabaseClient): Promise<boolean> {
    const db = client ?? this.db;
    try {
        const result = await db.query("DELETE FROM admin WHERE admin_id=$1 RETURNING *", [adminId]);
        return (result.rowCount ?? 0) > 0;
    }
    catch (err: any) {
        throw new Error(err.message);
    }
}
}
export default AdminRepository