import { IDatabase, IDatabaseClient } from "../interfaces/DBConnection"
export type PlatformSettingsLog = {
    id: number;
    settingKey: string;
    changedByAdminId: number;
    oldValue: any;
    newValue: any;
    createdAt: Date;
};

class PlatformSettingLogRepository {
    constructor(
        private db: IDatabase
    ) {

    }
    // PlatformSettingsLogRepository
    private mapRow(row: any): PlatformSettingsLog {
        return {
            id: row.id,
            settingKey: row.setting_key,
            changedByAdminId: row.changed_by_admin_id,
            oldValue: row.old_value,
            newValue: row.new_value,
            createdAt: row.created_at
        };
    }
    async create(settingKey: string, changedByAdminId: number, oldValue: string, newValue: string, client?: IDatabaseClient): Promise<boolean> {
        const db=client??this.db;
        try
        {
            const result=await db.query("INSERT INTO Platform_Setting_Log (setting_key,changed_by_admin_id,old_value,new_value) VALUES($1,$2,$3,$4) RETURNING *",[settingKey,changedByAdminId,oldValue,newValue])
            return (result.rowCount??0)>0;
        }
        catch(error:any)
        {
            throw new Error(error.message);
        }
    }
    async findBySettingKey(key: string, client?: IDatabaseClient): Promise<PlatformSettingsLog[] | null> 
    {
        const db = client??this.db; 
        try
        {
            const result= await db.query("SELECT * FROM Platform_Setting_Repository WHERE key=$1",[key])
            return result.map((row:any)=>this.mapRow(row));
        }
        catch(error:any)
        {
            throw new Error(error.message);
        }
    }
}
export default PlatformSettingLogRepository