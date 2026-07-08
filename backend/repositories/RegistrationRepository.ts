import Registration, { RegistrationStatus } from "../models/registration"
import { IDatabase, IDatabaseClient } from "../interfaces/DBConnection"

class RegistrationRepository {
    constructor(
        private db: IDatabase
    ) {

    }

    private mapRowToRegistration(row: any): Registration {
        return new Registration(row.id, row.student_id, row.event_id, row.status, row.created_at, row.updated_at);
    }

    async create(registration: Registration, client?: IDatabaseClient): Promise<number> {
        const db = client ?? this.db;
        try {
            const result = await db.query(
                "INSERT INTO Registration (student_id,event_id,status) VALUES ($1,$2,$3) RETURNING id",
                [registration.getStudentId(), registration.getEventId(), registration.getStatus()]
            );
            if ((result.rowCount ?? 0) === 0) {
                throw new Error('Registration insert failed: no row returned');
            }
            return result.rows[0].id;
        }
        catch (err: any) {
            if (err.code === '23505') {
                throw new Error('Registration already exists for this student and event');
            }
            throw new Error(err.message);
        }
    }

    async findById(id: number, client?: IDatabaseClient): Promise<Registration | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM Registration WHERE id=$1", [id]);
            if ((result.rowCount ?? 0) === 0) return null;
            return this.mapRowToRegistration(result.rows[0]);
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async findByStudentAndEvent(studentId: number, eventId: number, client?: IDatabaseClient): Promise<Registration | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM Registration WHERE student_id=$1 AND event_id=$2", [studentId, eventId]);
            if ((result.rowCount ?? 0) === 0) return null;
            return this.mapRowToRegistration(result.rows[0]);
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async findByEventId(eventId: number, client?: IDatabaseClient): Promise<Registration[] | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM Registration WHERE event_id=$1", [eventId]);
            if (result.rows.length === 0) return null;
            return result.rows.map((row: any) => this.mapRowToRegistration(row));
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async findByStudentId(studentId: number, client?: IDatabaseClient): Promise<Registration[] | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM Registration WHERE student_id=$1", [studentId]);
            if (result.rows.length === 0) return null;
            return result.rows.map((row: any) => this.mapRowToRegistration(row));
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async updateStatus(id: number, status: RegistrationStatus, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query("UPDATE Registration SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *", [status, id]);
            return (result.rowCount ?? 0) > 0;
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async getOldestWaitlisted(eventId: number, client?: IDatabaseClient): Promise<Registration | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query(
                "SELECT * FROM Registration WHERE event_id=$1 AND status='waitlisted' ORDER BY created_at ASC LIMIT 1",
                [eventId]
            );
            if ((result.rowCount ?? 0) === 0) return null;
            return this.mapRowToRegistration(result.rows[0]);
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }
}
export default RegistrationRepository