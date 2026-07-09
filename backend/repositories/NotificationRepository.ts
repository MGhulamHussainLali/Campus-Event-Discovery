import Notification, { NotificationType } from "../models/notification"
import { IDatabase, IDatabaseClient } from "../interfaces/DBConnection"

class NotificationRepository {
    constructor(
        private db: IDatabase
    ) {

    }

    private mapRowToNotification(row: any): Notification {
        return new Notification(
            row.id, row.user_id, row.title, row.message, row.type,
            row.related_event_id, row.is_read, row.created_at
        );
    }

    async create(notification: Notification, client?: IDatabaseClient): Promise<number> {
        const db = client ?? this.db;
        try {
            const result = await db.query(
                "INSERT INTO Notifications (user_id,title,message,type,related_event_id,is_read) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",
                [
                    notification.getUserId(),
                    notification.getTitle(),
                    notification.getMessage(),
                    notification.getType(),
                    notification.getRelatedEventId(),
                    notification.getIsRead()
                ]
            );
            if ((result.rowCount ?? 0) === 0) {
                throw new Error("Notification insert failed: no row returned");
            }
            return result.rows[0].id;
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async findByUserId(userId: number, client?: IDatabaseClient): Promise<Notification[] | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM Notifications WHERE user_id=$1 ORDER BY created_at DESC", [userId]);
            if (result.rows.length === 0) return null;
            return result.rows.map((row: any) => this.mapRowToNotification(row));
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async markRead(id: number, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query("UPDATE Notifications SET is_read=true WHERE id=$1 RETURNING *", [id]);
            return (result.rowCount ?? 0) > 0;
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async markAllRead(userId: number, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query("UPDATE Notifications SET is_read=true WHERE user_id=$1 RETURNING *", [userId]);
            return (result.rowCount ?? 0) > 0;
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async getUnreadCount(userId: number, client?: IDatabaseClient): Promise<number> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT COUNT(*) FROM Notifications WHERE user_id=$1 AND is_read=false", [userId]);
            return parseInt(result.rows[0].count, 10);
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }
}
export default NotificationRepository
