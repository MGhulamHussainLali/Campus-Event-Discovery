import OrganizationRepository, { OrganizationUpdateFields } from '../repositories/OrganizationRepository';
import Organization from '../models/organization';

class OrganizationService {
    constructor(private organizationRepository: OrganizationRepository) {}

    async createOrganization(name: string, description: string, logoUrl: string | null): Promise<number> {
        const existing = await this.organizationRepository.findByName(name);
        if (existing) {
            throw new Error("Organization already exists");
        }
        const organization = new Organization(0, name, description, logoUrl, new Date());
        return await this.organizationRepository.create(organization);
    }

    async getOrganizationById(id: number): Promise<Organization | null> {
        return await this.organizationRepository.findById(id);
    }

    async getAllOrganizations(): Promise<Organization[] | null> {
        return await this.organizationRepository.findAll();
    }

    async updateOrganization(id: number, fields: OrganizationUpdateFields): Promise<boolean> {
        return await this.organizationRepository.update(id, fields);
    }

    async deleteOrganization(id: number): Promise<boolean> {
        return await this.organizationRepository.delete(id);
    }
}
export default OrganizationService