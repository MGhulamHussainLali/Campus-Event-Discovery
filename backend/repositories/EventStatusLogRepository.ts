import { EventStatus } from "../models/event";
import { IDatabase,IDatabaseClient } from "../interfaces/DBConnection";

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
    // EventStatusLogRepository
    constructor(
        private db:IDatabase
    )
    {

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

    async create(eventId:number, changedByAdminId:number, oldStatus:EventStatus, newStatus:EventStatus, reason:string, client?:IDatabaseClient)
    {
        const db=client??this.db;
        try{
        const result=await db.query("INSERT INTO Event_Status_Log_Repository VALUES($1,$2,$3,$4,$5) RETURNING *",[eventId,changedByAdminId,oldStatus,newStatus,reason])
        return (result.rowCount??0)>0
        }
        catch(error:any)
        {
            throw new Error(error.message)
        }
        
    }

    async findByEventId(eventId:number, client?:IDatabaseClient): Promise<EventStatusLog[] | null>
    {
        const db=client??this.db; 
        try
        {
            const result=await db.query("SELECT * FROM Event_Status_Log WHERE eventId=$1",[eventId])
            if ((result.rowCount??0)==0)
            {
                return null;
            }
            else
            {
            return result.rows.map((row:any)=>this.mapRow(row));
            }
        }
        catch(error:any)
        {
            throw new Error(error.message);
        }
    }

}
export default EventStatusLogRepository
