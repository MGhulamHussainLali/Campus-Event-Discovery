import { Pool, PoolClient } from 'pg';
import { IDatabase, IDatabaseClient } from '../interfaces/DBConnection';

class PostgresDatabase implements IDatabase {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });
    }

    async query(text: string, params?: any[]): Promise<any> {
        return this.pool.query(text, params);
    }

    async getClient(): Promise<IDatabaseClient> {
        const client: PoolClient = await this.pool.connect();
        return {
            query: (text: string, params?: any[]) => client.query(text, params),
            release: () => client.release(),
        };
    }
}

export default PostgresDatabase;