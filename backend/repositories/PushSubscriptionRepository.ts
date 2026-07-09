// PushSubscriptionRepository.ts
import { IDatabase, IDatabaseClient } from "../interfaces/DBConnection"

export type PushSubscription = {
    id: number;
    userId: number;
    endpoint: string;
    p256dhKey: string;
    authKey: string;
    createdAt: Date;
};

class PushSubscriptionRepository {
    constructor(
        private db: IDatabase
    ) {

    }
    private mapRow(row: any): PushSubscription {
        return {
            id: row.id,
            userId: row.user_id,
            endpoint: row.endpoint,
            p256dhKey: row.p256dh_key,
            authKey: row.auth_key,
            createdAt: row.created_at
        };
    }
    async create(userId: number, endpoint: string, p256dhKey: string, authKey: string, client?: IDatabaseClient): Promise<number> {
        const db = client ?? this.db;
        try {
            const result = await db.query("INSERT INTO Push_Subscription (user_id,endpoint,p256dh_key,auth_key) VALUES($1,$2,$3,$4) RETURNING id", [userId, endpoint, p256dhKey, authKey])
            if ((result.rowCount ?? 0) === 0) {
                throw new Error("Unable to create push subscription")
            }
            return result.rows[0].id
        }
        catch (error: any) {
            if (error.code === '23505') {
                throw new Error('Subscription already exists');
            }
            throw new Error(error.message)
        }
    }
    async findByUserId(userId: number, client?: IDatabaseClient): Promise<PushSubscription[] | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM Push_Subscription WHERE user_id=$1", [userId])
            if ((result.rowCount ?? 0) == 0) {
                return null;
            }
            return result.rows.map((row: any) => this.mapRow(row))
        }
        catch (error: any) {
            throw new Error(error.message)
        }
    }
    async delete(id: number, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query("DELETE FROM Push_Subscription WHERE id=$1 RETURNING *", [id])
            return (result.rowCount ?? 0) > 0
        }
        catch (error: any) {
            throw new Error(error.message)
        }
    }
}
export default PushSubscriptionRepository