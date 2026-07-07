import Organizer from "../models/organizer";

import { IDatabase, IDatabaseClient } from "../interfaces/DBConnection";

export type OrganizerUpdateFields = {
    organizationId?: number;
};

const fieldMap: Record<string, string> = {
    organizationId: 'organization_id'
};

class OrganizerRepository {
    constructor(
        private db: IDatabase
    )
    {

    }

    private mapRowToOrganizer(row: any): Organizer {
        return new Organizer(
            row.organizer_id,
            row.name,
            row.email,
            row.hashed_password,
            row.picture_url,
            row.account_status,
            row.email_verified,
            row.created_at,
            row.organization_id
        );
    }

    async create(organizer: Organizer,id:number, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query(
                "INSERT INTO organizer (organizer_id, organization_id) VALUES ($1,$2) RETURNING *",
                [id, organizer.getOrganizationId()]
            );
            return (result.rowCount ?? 0) > 0;
        }
        catch (err: any) {
            throw err;
        }
    }

    async update(organizerId: number, fields: OrganizerUpdateFields, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        const entries = Object.entries(fields);
        const setClause = entries.map(([key], i) => `${fieldMap[key]}=$${i + 1}`).join(',');
        const setValues = entries.map(([, value]) => value);

        try {
            const result = await db.query(
                `UPDATE organizer SET ${setClause} WHERE organizer_id=$${entries.length + 1} RETURNING *`,
                [...setValues, organizerId]
            );
            return (result.rowCount ?? 0) > 0;
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async findAll(client?: IDatabaseClient): Promise<Organizer[] | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query(
                "SELECT u.*, o.organization_id FROM organizer o JOIN users u ON u.id = o.organizer_id",
                []
            );
            if (result.rows.length === 0) return null;
            return result.rows.map((row: any) => this.mapRowToOrganizer(row));
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async findById(organizerId: number, client?: IDatabaseClient): Promise<Organizer | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query(
                "SELECT u.*, o.organization_id FROM organizer o JOIN users u ON u.id = o.organizer_id WHERE o.organizer_id=$1",
                [organizerId]
            );
            if (result.rows.length === 0) return null;
            return this.mapRowToOrganizer(result.rows[0]);
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async delete(organizerId: number, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query("DELETE FROM organizer WHERE organizer_id=$1 RETURNING *", [organizerId]);
            return (result.rowCount ?? 0) > 0;
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }
}

export default OrganizerRepository