import User from '../models/user';
import { IDatabase, IDatabaseClient } from '../interfaces/DBConnection'; 

interface UserUpdateFields {
    name?: string;
    email?: string;
    hashedPassword?: string;
    pictureURL?: string | null;
    accountStatus?: 'pending' | 'approved' | 'rejected' | 'suspended';
    emailVerified?: boolean;
}

const fieldMap: Record<string, string> = {
    name: 'name',
    email: 'email',
    hashedPassword: 'hashed_password',
    pictureURL: 'picture_url',
    accountStatus: 'account_status',
    emailVerified: 'email_verified'
};

class UserRepository {
    constructor(
        private db: IDatabase
    ) 
    {

    }
    private mapRowToUser(row: any): User {
        return new User(
            row.id,
            row.name,
            row.email,
            row.hashed_password,
            row.picture_url,
            row.role,
            row.account_status,
            row.email_verified,
            row.created_at
        );
    }

    async create(user: User, client?: IDatabaseClient): Promise<number> {
        const db = client ?? this.db;
        try {
            const result = await db.query("INSERT INTO users (name,email,hashed_password,picture_url,role,account_status,email_verified,created_at)\
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)\
            RETURNING id", [user.getName(), user.getEmail(), user.getHashedPassword(), user.getPictureURL(), user.getRole(), user.getAccountStatus(), user.getEmailVerified(), user.getCreatedAt()])
            return (result.rowCount ?? 0)?result.rows[0]:-1;
        }
        catch (err: any) 
        {
            if (err.code === '23505') {
                throw new Error('Email already exists');
            }
            else {
                throw err;
            }
        }

    }
    async findById(id: number, client?: IDatabaseClient):Promise<User|null>{
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM users WHERE id=$1 ", [id])
            if (result.rowCount === 0) return null;
            return this.mapRowToUser(result.rows[0]);
        }


        catch (err: any) {
            throw new Error(err.message)

        }


    }
    async findByEmail(email: string, client?: IDatabaseClient):Promise<User|null>{
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM users WHERE   email=$1 ", [email])
           
            if (result.rowCount === 0) return null;
            return this.mapRowToUser(result.rows[0]);
        }


        catch (err: any) {
            throw new Error(err.message)

        }

    }
    async existsByEmail(email: string, client?: IDatabaseClient):Promise<boolean> 
    {
        const db = client ?? this.db;
        try{
            const result:any= await db.query("SELECT * from users WHERE email=$1",[email])
            return (result.rowCount??0)>0
        }
        catch(err:any){
            throw new Error(err.message)
        }

    }
  async updateAccountStatus(id: number, status: string, client?: IDatabaseClient): Promise<boolean> {
  const db = client ?? this.db;
  try {
    const result = await db.query(
      "UPDATE users SET account_status = $1 WHERE id = $2",
      [status, id]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (err) {
    throw err;
  }
}
    async updateEmailVerified(id: number, verified: boolean, client?: IDatabaseClient):Promise<boolean> {
        const db = client ?? this.db;
        try
        {
            const result:any=await db.query("UPDATE users SET email_verified=$1 WHERE id=$2 RETURNING *",[verified,id]);
            return (result.rowCount??0)>0
        }
        catch(err:any)
        {
            throw err;
        }
    }

    async updatePassword(id: number, hashedPassword: string, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try
        {
            const result:any=await db.query("UPDATE users SET hashed_password=$1 WHERE id=$2 RETURNING *",[hashedPassword,id]);
            return (result.rowCount??0)>0
        }
        catch(err:any)
        {
            throw err;
        }
    }

    async findAll(filters?: { role?: string; accountStatus?: string }, client?: IDatabaseClient): Promise<User[]> {
        const db = client ?? this.db;
        let filter_conditions:string[]=[];
        let filter_value:string[]=[];
        let paramIndex=1; 
        
        if (filters?.role){
            filter_conditions.push(`role=$${paramIndex++}`);
            filter_value.push(filters.role)
        }
        if (filters?.accountStatus)
        {
            filter_conditions.push(`account_status=$${paramIndex++}`); 
            filter_value.push(filters.accountStatus)
        }

        const whereClause=filter_conditions.length?`WHERE ${filter_conditions.join(" AND ")}`:"";
        


        try{
            const result = await db.query(`SELECT * FROM users ${whereClause}`, filter_value);
            return result.rows.map((row: any) => this.mapRowToUser(row));
        }
        catch(err:any)
        {
            throw new Error(err.message);

        }
    }
    async update(id: number, fields: UserUpdateFields, client?: IDatabaseClient): Promise<User | null> {
        const db = client ?? this.db;
        const user_fileds=Object.entries(fields);
        const setClause=user_fileds.map(([key],i)=>`${fieldMap[key]}=$${i+1}`).join(',');
        const setValues=user_fileds.map(([,value],i)=> value)

        try
        {
            const result=await db.query(`UPDATE users SET ${setClause} WHERE id =$${user_fileds.length+1} RETURNING *`,[...setValues, id])
            if ((result.rowCount??0)==0)
                throw new Error("UNABLE TO UPDATE")
            return this.mapRowToUser(result.rows[0]);
        }
        catch(err:any)
        {
            throw new Error(err.message);
        }

    }
    async delete(id: number, client?: IDatabaseClient): Promise<boolean> 
    {
        const db = client ?? this.db;
        try
        {
            const result =await db.query(`DELETE FROM users WHERE id=$1 RETURNING *`, [id])
            if ((result.rowCount??0)>0)
                return true
            return false
        }
        catch(err:any)
        {
            throw new Error(err.message);
        }
    }
}
export default UserRepository