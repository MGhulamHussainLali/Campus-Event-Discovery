// AccountStatusLogRepository.ts
import { IDatabase, IDatabaseClient } from "../interfaces/DBConnection";

export type AccountStatusLog = {
    id: number;
    userId: number;
    changedByAdminId: number;
    oldStatus: string | null;
    newStatus: string;
    reason: string | null;
    createdAt: Date;
};

class AccountStatusLogRepository {
    constructor(
        private db: IDatabase
    ) {

    }
    private mapRow(row: any): AccountStatusLog {
        return {
            id: row.id,
            userId: row.user_id,
            changedByAdminId: row.changed_by_admin_id,
            oldStatus: row.old_status,
            newStatus: row.new_status,
            reason: row.reason,
            createdAt: row.created_at
        };
    }

    async create(userId: number, changedByAdminId: number, oldStatus: 'pending' | 'approved' | 'rejected' | 'suspended' | null, newStatus: 'pending' | 'approved' | 'rejected' | 'suspended', reason: string | null, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db
        try {
            const result = await db.query("INSERT INTO Account_Status_Log (user_id,changed_by_admin_id,old_status,new_status,reason) VALUES ($1,$2,$3,$4,$5) RETURNING *", [userId, changedByAdminId, oldStatus, newStatus, reason])
            return (result.rowCount ?? 0) > 0
        }
        catch (error: any) {
            throw new Error(error.message)
        }
    }
    async findByUserId(userId: number, client?: IDatabaseClient): Promise<AccountStatusLog[] | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM Account_Status_Log WHERE user_id=$1 ORDER BY created_at DESC", [userId])
            if ((result.rowCount ?? 0) === 0) {
                return null;
            }
            return result.rows.map((row: any) => this.mapRow(row));
        }
        catch (error: any) {
            throw new Error(error.message)
        }
    }
}
export default AccountStatusLogRepository