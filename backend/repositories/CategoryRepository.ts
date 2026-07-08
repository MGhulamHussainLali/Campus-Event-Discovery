import Category from "../models/category";
import { IDatabaseClient, IDatabase } from '../interfaces/DBConnection';
class CategoryRepository {
    constructor(
        private db: IDatabase
    ) {

    }
    async create(category: Category, client?: IDatabaseClient): Promise<number> {
        const db = client ?? this.db;
        try {
            const result = await db.query("INSERT INTO Category (name) VALUES($1) RETURNING id", [category.getName()])
            if ((result.rowCount ?? 0) === 0) {
                throw new Error("Creation failed")

            }
            return result.rows[0].id
        }
        catch (err: any) {
            throw new Error(err.message);
        }

    }

    async findById(id: number, client?: IDatabaseClient): Promise<Category | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM Category WHERE id=$1", [id])
            if ((result.rowCount ?? 0) == 0)
                 {
                return null;
            }
            const category = new Category(result.rows[0].id, result.rows[0].name, result.rows[0].created_at)
            return category;
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    }

    async findByName(name: string, client?: IDatabaseClient): Promise<Category | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM Category WHERE name=$1", [name])
            if ((result.rowCount ?? 0) == 0) {
                return null
            }
            const category = new Category(result.rows[0].id, result.rows[0].name, result.rows[0].created_at)
            return category;
        }
        catch (error: any) {
            throw new Error(error.message);
        }

    }
    async findAll(client?: IDatabaseClient): Promise<Category[] | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM Category ")


            if (result.rows.length === 0) return null;
            return result.rows.map((row: any) => new Category(row.id, row.name, row.created_at))
        }
        catch (error: any) {
            throw new Error(error.message)
        }
    }
    async update(id: number, name: string, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query("UPDATE Category SET name = $1 WHERE id=$2 RETURNING *", [name, id])
            return (result.rowCount ?? 0) > 0
        }
        catch (error: any) {
            throw new Error(error.message)
        }
    }
    async delete(id: number, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query("DELETE FROM Category WHERE id=$1 RETURNING *", [id])
            return (result.rowCount ?? 0) > 0
        }
        catch (error: any) {
            throw new Error(error.message)
        }
    }
}
export default CategoryRepository