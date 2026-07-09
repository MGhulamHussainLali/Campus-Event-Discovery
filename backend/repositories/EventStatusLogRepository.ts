// EventStatusLogRepository.ts
import { EventStatus } from "../models/event";
import { IDatabase, IDatabaseClient } from "../interfaces/DBConnection";

export type EventStatusLog = {
    id: number;
    eventId: number;
    changedByAdminId: number;
    oldStatus: string | null;
    newStatus: string;
    reason: string | null;
    createdAt: Date;
};

class EventStatusLogRepository {
    constructor(
        private db: IDatabase
    ) {

    }
    private mapRow(row: any): EventStatusLog {
        return {
            id: row.id,
            eventId: row.event_id,
            changedByAdminId: row.changed_by_admin_id,
            oldStatus: row.old_status,
            newStatus: row.new_status,
            reason: row.reason,
            createdAt: row.created_at
        };
    }

    async create(eventId: number, changedByAdminId: number, oldStatus: EventStatus | null, newStatus: EventStatus, reason: string | null, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query("INSERT INTO Event_Status_Log (event_id,changed_by_admin_id,old_status,new_status,reason) VALUES($1,$2,$3,$4,$5) RETURNING *", [eventId, changedByAdminId, oldStatus, newStatus, reason])
            return (result.rowCount ?? 0) > 0
        }
        catch (error: any) {
            throw new Error(error.message)
        }
    }

    async findByEventId(eventId: number, client?: IDatabaseClient): Promise<EventStatusLog[] | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM Event_Status_Log WHERE event_id=$1 ORDER BY created_at DESC", [eventId])
            if ((result.rowCount ?? 0) == 0) {
                return null;
            }
            else {
                return result.rows.map((row: any) => this.mapRow(row));
            }
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    }
}
export default EventStatusLogRepository