import Event from "../models/event"
import { IDatabase, IDatabaseClient } from "../interfaces/DBConnection"
import User from "../models/user"

export type EventUpdateFields = {
    title?: string;
    description?: string;
    venueName?: string | null;
    address?: string | null;
    posterUrl?: string | null;
    startTime?: Date;
    endTime?: Date;
    maxCapacity?: number | null;
};

const fieldMap: Record<string, string> = {
    title: 'title',
    description: 'description',
    venueName: 'venue_name',
    address: 'address',
    posterUrl: 'poster_url',
    startTime: 'start_time',
    endTime: 'end_time',
    maxCapacity: 'max_capacity'
};
class EventRepository {
    constructor
        (
            private db: IDatabase
        ) {

    }
    async create(event: Event, client?: IDatabaseClient): Promise<number> {
        const db = client ?? this.db;
        try {
            const result = await db.query(
                "INSERT INTO Event (title,description,category_id,organizer_id,organization_id,venue_name,address,poster_url,start_time,end_time,max_capacity,status,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id",
                [
                    event.getTitle(),
                    event.getDescription(),
                    event.getCategoryId(),
                    event.getOrganizerId(),
                    event.getOrganizationId(),
                    event.getVenueName(),
                    event.getAddress(),
                    event.getPosterUrl(),
                    event.getStartTime(),
                    event.getEndTime(),
                    event.getMaxCapacity(),
                    event.getStatus(),
                    event.getCreatedAt(),
                    event.getUpdatedAt()
                ]
            );
            if ((result.rowCount ?? 0) === 0) {
                throw new Error('Event insert failed: no row returned');
            }
            return result.rows[0].id;
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }
    async findById(id: number, client?: IDatabaseClient): Promise<Event | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT * FROM Event WHERE id=$1", [id]);
            if ((result.rowCount ?? 0) === 0) {
                return null;
            }
            const row = result.rows[0];
            return new Event(
                row.id, row.title, row.description, row.category_id, row.organizer_id,
                row.organization_id, row.venue_name, row.address, row.poster_url,
                row.start_time, row.end_time, row.max_capacity, row.status,
                row.created_at, row.updated_at
            );
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async findAll(filters?: { categoryId?: number, status?: string, organizerId?: number, organizationId?: number, titleSearch?: string }, client?: IDatabaseClient): Promise<Event[] | null> {
        const db = client ?? this.db;
        const conditions: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (filters?.categoryId) {
            conditions.push(`category_id=$${paramIndex++}`);
            values.push(filters.categoryId);
        }
        if (filters?.status) {
            conditions.push(`status=$${paramIndex++}`);
            values.push(filters.status);
        }
        if (filters?.organizerId) {
            conditions.push(`organizer_id=$${paramIndex++}`);
            values.push(filters.organizerId);
        }
        if (filters?.organizationId) {
            conditions.push(`organization_id=$${paramIndex++}`);
            values.push(filters.organizationId);
        }
        if (filters?.titleSearch) {
            conditions.push(`title ILIKE $${paramIndex++}`);
            values.push(`%${filters.titleSearch}%`);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        try {
            const result = await db.query(`SELECT * FROM Event ${whereClause}`, values);
            if (result.rows.length === 0) return null;
            return result.rows.map((row: any) => new Event(
                row.id, row.title, row.description, row.category_id, row.organizer_id,
                row.organization_id, row.venue_name, row.address, row.poster_url,
                row.start_time, row.end_time, row.max_capacity, row.status,
                row.created_at, row.updated_at
            ));
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async updateStatus(id: number, status: string, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query("UPDATE Event SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *", [status, id]);
            return (result.rowCount ?? 0) > 0;
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async update(id: number, fields: EventUpdateFields, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        const entries = Object.entries(fields);
        const setClause = entries.map(([key], i) => `${fieldMap[key]}=$${i + 1}`).join(',');
        const values = entries.map(([, value]) => value);
        try {
            const result = await db.query(`UPDATE Event SET ${setClause}, updated_at=NOW() WHERE id=$${entries.length + 1} RETURNING *`, [...values, id]);
            return (result.rowCount ?? 0) > 0;
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async delete(id: number, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query("DELETE FROM Event WHERE id=$1 RETURNING *", [id]);
            return (result.rowCount ?? 0) > 0;
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async getCurrentGoingCount(eventId: number, client?: IDatabaseClient): Promise<number> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT COUNT(*) FROM Registration WHERE event_id=$1 AND status='going'", [eventId]);
            return parseInt(result.rows[0].count, 10);
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }
    async findByIdForUpdate(id: number, client: IDatabaseClient): Promise<Event | null> {
        try {
            const result = await client.query("SELECT * FROM Event WHERE id=$1 FOR UPDATE", [id]);
            if ((result.rowCount ?? 0) === 0) return null;
            const row = result.rows[0];
            return new Event(
                row.id, row.title, row.description, row.category_id, row.organizer_id,
                row.organization_id, row.venue_name, row.address, row.poster_url,
                row.start_time, row.end_time, row.max_capacity, row.status,
                row.created_at, row.updated_at
            );
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }
}

export default EventRepository