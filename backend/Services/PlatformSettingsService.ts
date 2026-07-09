import PlatformSettingsRepository from '../repositories/PlatformSettingsRepository';
import AllowedDomainsRepository from '../repositories/AllowedDomainsRepository';
import PlatformSettingsLogRepository from '../repositories/PlatformSettingsLogRepository';

class PlatformSettingsService {
    constructor(
        private platformSettingsRepository: PlatformSettingsRepository,
        private allowedDomainsRepository: AllowedDomainsRepository,
        private platformSettingsLogRepository: PlatformSettingsLogRepository
    ) {}

    async getSetting(key: string): Promise<any | null> {
        return await this.platformSettingsRepository.getSetting(key);
    }

    async getAllSettings(): Promise<Record<string, any>> {
        return await this.platformSettingsRepository.getAllSettings();
    }

    async updateSetting(key: string, value: any, adminId: number): Promise<boolean> {
        const oldValue = await this.platformSettingsRepository.getSetting(key);
        const result = await this.platformSettingsRepository.updateSetting(key, value, adminId);
        if (result) {
            await this.platformSettingsLogRepository.create(key, adminId, oldValue, value);
        }
        return result;
    }

    async isMaintenanceMode(): Promise<boolean> {
        const value = await this.platformSettingsRepository.getSetting('maintenance_mode');
        return value === true;
    }

    async addAllowedDomain(domain: string): Promise<number> {
        return await this.allowedDomainsRepository.create(domain);
    }

    async getAllowedDomains(): Promise<string[]> {
        return await this.allowedDomainsRepository.findAll();
    }

    async removeAllowedDomain(id: number): Promise<boolean> {
        return await this.allowedDomainsRepository.delete(id);
    }
}
export default PlatformSettingsService