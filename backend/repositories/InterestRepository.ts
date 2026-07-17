import Interest from "../models/interest";
import { IDatabase, IDatabaseClient } from "../interfaces/DBConnection";

class InterestRepository {
    constructor(
        private db: IDatabase
    ) {

    }

    private mapRow(row: any): Interest {
        return new Interest(row.id, row.name, row.created_by_user_id, row.source_category_id, row.created_at);
    }

    async create(interest: Interest, createdByUserId: number | null, client?: IDatabaseClient): Promise<number> {
        const db = client ?? this.db;
        try {
            const result = await db.query(
                "INSERT INTO Interest (name, created_by_user_id, source_category_id) VALUES($1,$2,$3) RETURNING id",
                [interest.getName(), createdByUserId, interest.getSourceCategoryId()]
            );
            if ((result.rowCount ?? 0) === 0) {
                throw new Error("Unable to create interest");
            }
            return result.rows[0].id;
        }
        catch (err: any) {
            if (err.code === '23505') {
                throw new Error('Interest already exists');
            }
            throw new Error(err.message);
        }
    }

    async findById(id: number, client?: IDatabaseClient): Promise<Interest | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM Interest WHERE id=$1", [id]);
            if ((result.rowCount ?? 0) === 0) return null;
            return this.mapRow(result.rows[0]);
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async findByName(name: string, client?: IDatabaseClient): Promise<Interest | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM Interest WHERE name=$1", [name]);
            if ((result.rowCount ?? 0) === 0) return null;
            return this.mapRow(result.rows[0]);
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async findAll(client?: IDatabaseClient): Promise<Interest[] | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM Interest", []);
            if (result.rows.length === 0) return null;
            return result.rows.map((row: any) => this.mapRow(row));
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async update(id: number, name: string, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query("UPDATE Interest SET name=$1 WHERE id=$2 RETURNING *", [name, id]);
            return (result.rowCount ?? 0) > 0;
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async updateNameBySourceCategoryId(categoryId: number, name: string, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query("UPDATE Interest SET name=$1 WHERE source_category_id=$2 RETURNING *", [name, categoryId]);
            return (result.rowCount ?? 0) > 0;
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async delete(id: number, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query("DELETE FROM Interest WHERE id=$1 RETURNING *", [id]);
            return (result.rowCount ?? 0) > 0;
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async getTrendingInterests(client?: IDatabaseClient): Promise<{interestId: number, name: string, studentCount: number}[]> {
        const db = client ?? this.db;
        try {
            const result = await db.query(
                `SELECT i.id as interest_id, i.name, COUNT(si.student_id) as student_count
                 FROM Interest i
                 JOIN Student_Interest si ON i.id = si.interest_id
                 GROUP BY i.id, i.name
                 ORDER BY student_count DESC`,
                []
            );
            return result.rows.map((row: any) => ({
                interestId: row.interest_id,
                name: row.name,
                studentCount: parseInt(row.student_count, 10)
            }));
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }
}
export default InterestRepository