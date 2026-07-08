import Interest from "../models/interest";
import { IDatabaseClient, IDatabase } from '../interfaces/DBConnection';
class InterestRepository {
    constructor(
        private db: IDatabase
    ) {

    }
    async create(interest: Interest, client?: IDatabaseClient): Promise<number> {
        const db = client ?? this.db;
        try {
            const result = await db.query("INSERT INTO Interest (name) VALUES($1) RETURNING id", [interest.getName()])
            if ((result.rowCount ?? 0) === 0) {
                throw new Error("Creation failed")

            }
            return result.rows[0].id
        }
        catch (err: any) {
            throw new Error(err.message);
        }

    }

    async findById(id: number, client?: IDatabaseClient): Promise<Interest | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM Interest WHERE id=$1", [id])
            if ((result.rowCount ?? 0) == 0)
                 {
                return null;
            }
            const interest = new Interest(result.rows[0].id, result.rows[0].name, result.rows[0].created_at)
            return interest;
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    }

    async findByName(name: string, client?: IDatabaseClient): Promise<Interest | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM Interest WHERE name=$1", [name])
            if ((result.rowCount ?? 0) == 0) {
                return null
            }
            const interest = new Interest(result.rows[0].id, result.rows[0].name, result.rows[0].created_at)
            return interest;
        }
        catch (error: any) {
            throw new Error(error.message);
        }

    }
    async findAll(client?: IDatabaseClient): Promise<Interest[] | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM Interest ")


            if (result.rows.length === 0) return null;
            return result.rows.map((row: any) => new Interest(row.id, row.name, row.created_at))
        }
        catch (error: any) {
            throw new Error(error.message)
        }
    }
    async update(id: number, name: string, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query("UPDATE Interest SET name = $1 WHERE id=$2 RETURNING *", [name, id])
            return (result.rowCount ?? 0) > 0
        }
        catch (error: any) {
            throw new Error(error.message)
        }
    }
    async delete(id: number, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query("DELETE FROM Interest WHERE id=$1 RETURNING *", [id])
            return (result.rowCount ?? 0) > 0
        }
        catch (error: any) {
            throw new Error(error.message)
        }
    }
}
export default InterestRepository