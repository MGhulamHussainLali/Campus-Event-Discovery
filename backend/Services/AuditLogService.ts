import AccountStatusLogRepository, { AccountStatusLog } from "../repositories/AccountStatusLogRepository";
import EventStatusLogRepository, { EventStatusLog } from "../repositories/EventStatusLogRepository";
import PlatformSettingsLogRepository, { PlatformSettingsLog } from "../repositories/PlatformSettingsLogRepository";

class AuditLogService
{
    constructor(
        private accountStatusLogRepository:AccountStatusLogRepository,
        private eventStatusLogRepository:EventStatusLogRepository,
        private platformSettingsLog:PlatformSettingsLogRepository
    )   
    {
        
    }
    async getAccountHistory(userId:number): Promise<AccountStatusLog[] | null>
    {
        return await this.accountStatusLogRepository.findByUserId(userId)
    }
    async getEventHistory(eventId:number): Promise<EventStatusLog[] | null>
    {
        return await this.eventStatusLogRepository.findByEventId(eventId);
    }
    async getSettingsHistory(key:string): Promise<PlatformSettingsLog[] | null>
    {
        return await this.platformSettingsLog.findBySettingKey(key);
    }
}
export default AuditLogService