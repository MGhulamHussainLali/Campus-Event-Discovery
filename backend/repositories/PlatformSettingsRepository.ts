import { IDatabase, IDatabaseClient } from "../interfaces/DBConnection"
class PlatformSettingsRepository {
    constructor(
        private db: IDatabase
    ) {

    }
    async getSetting(key: string, client?: IDatabaseClient): Promise<any | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT value FROM Platform_Settings WHERE key=$1", [key]);
            if ((result.rowCount ?? 0) === 0) return null;
            return result.rows[0].value; // already parsed back to a JS value by pg
        }
        catch (err: any)
        {
            throw new Error(err.message);
        }
    }
    async getAllSettings(client?: IDatabaseClient): Promise<Record<string, any>> {
        const db = client ?? this.db;
        try
        {
            const result = await db.query("SELECT key,value from Platform_Settings", [])
            const settings: Record<string, any> = {};
            for (const row of result.rows)
            {
                settings[row.key] = row.value;
            }
            return settings;

        }
        catch (err: any)
        {
            throw new Error(err.message);
        }

    }
    async updateSetting(key: string, value: any, adminId: number, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try
        {
            const result = await db.query(
                "UPDATE Platform_Settings SET value=$1, updated_at=NOW(), updated_by_admin_id=$2 WHERE key=$3 RETURNING *",
                [JSON.stringify(value), adminId, key]
            )
            return (result.rowCount ?? 0) > 0
        }
        catch (error: any)
        {
            throw new Error(error.message);
        }

    }
}
export default PlatformSettingsRepository