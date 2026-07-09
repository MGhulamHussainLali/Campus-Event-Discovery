// AllowedDomainsRepository.ts
import { IDatabase, IDatabaseClient } from "../interfaces/DBConnection"
class AllowedDomainsRepository {
    constructor(
        private db: IDatabase
    ) {

    }
    async create(domain: string, client?: IDatabaseClient): Promise<number> {
        const db = client ?? this.db
        try {
            const result = await db.query("INSERT INTO Allowed_Domains (domain) VALUES($1) RETURNING id", [domain])
            if ((result.rowCount ?? 0) === 0) {
                throw new Error("Unable to add domain")
            }
            return result.rows[0].id
        }
        catch (error: any) {
            if (error.code === '23505') {
                throw new Error('Domain already exists');
            }
            throw new Error(error.message);
        }
    }
    async findAll(client?: IDatabaseClient): Promise<string[]> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM Allowed_Domains", [])
            return result.rows.map((row: any) => row.domain)
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    }
    async delete(id: number, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query("DELETE FROM Allowed_Domains WHERE id=$1 RETURNING *", [id])
            return (result.rowCount ?? 0) > 0
        }
        catch (error: any) {
            throw new Error(error.message)
        }
    }
}
export default AllowedDomainsRepository