import Organization from "../models/organization"
import { IDatabase, IDatabaseClient } from "../interfaces/DBConnection"
export type OrganizationUpdateFields = {
    name?: string;
    description?: string;
    logoUrl?: string | null;
};

const fieldMap: Record<string, string> = {
    name: 'name',
    description: 'description',
    logoUrl: 'logo_url'
};

class OrganizationRepository {
    constructor(
        private db: IDatabase
    ) {

    }
    async create(organization: Organization, client?: IDatabaseClient):Promise<number> {
        const db = client ?? this.db
        try {
            const result = await db.query("INSERT INTO Organization (name,description,logo_url) VALUES($1,$2,$3) RETURNING organization_id", [organization.getName(), organization.getDescription(), organization.getLogoUrl()])
            if ((result.rowCount ?? 0) == 0) {
                throw new Error("Unable to create")
            }
            return result.rows[0].organization_id
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    }
    async findById(id: number, client?: IDatabaseClient):Promise<Organization | null> {
        const db = client ?? this.db
        try {
            const result = await db.query("SELECT * FROM Organization WHERE organization_id=$1",[id])
            if ((result.rowCount??0) ==0)
            {
                return null;
            }
            
            return (new Organization(result.rows[0].organization_id,result.rows[0].name,result.rows[0].description,result.rows[0].logo_url,result.rows[0].created_at))
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    }
    async findAll(client?: IDatabaseClient): Promise<Organization[] | null> {
        const db = client ?? this.db
        try {
            const result = await db.query("SELECT * FROM Organization",[])
            if ((result.rowCount??0) ==0)
            {
                return null;
            }
            return result.rows.map((row:any)=>new Organization(row.organization_id,row.name,row.description,row.logo_url,row.created_at))
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    }
    async findByName(name: string, client?: IDatabaseClient):Promise<Organization | null> {
        const db = client ?? this.db
        try {
            const result = await db.query("SELECT * FROM Organization WHERE name=$1",[name])
            if ((result.rowCount??0) ==0)
            {
                return null;
            }
            
            return (new Organization(result.rows[0].organization_id,result.rows[0].name,result.rows[0].description,result.rows[0].logo_url,result.rows[0].created_at))
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    }
    async update(id: number, fields: OrganizationUpdateFields, client?: IDatabaseClient):Promise<boolean> {
        const db = client ?? this.db
        const entries=Object.entries(fields)
        const setQuery=entries.map(([key],i)=>`${fieldMap[key]}=$${i+1}`).join(',');
        const values=entries.map(([,value])=>value)
        try {
            const result = await db.query(`UPDATE Organization SET ${setQuery} WHERE organization_id=$${entries.length+1} RETURNING *`,[...values,id])
            return (result.rowCount??0)>0
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    }
    async delete(id: number, client?: IDatabaseClient):Promise<boolean> {
        const db = client ?? this.db
        try {
            const result = await db.query("DELETE FROM Organization WHERE organization_id=$1 RETURNING *",[id])
            return (result.rowCount??0)>0
        }
        catch (error: any) {
            throw new Error(error.message);
        }

    }
}
export default OrganizationRepository