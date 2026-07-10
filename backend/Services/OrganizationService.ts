import OrganizationRepository, { OrganizationUpdateFields } from '../repositories/OrganizationRepository';
import Organization from '../models/organization';

class OrganizationService {
    constructor(private organizationRepository: OrganizationRepository) { }

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

    // OrganizationService.ts
    async updateOrganization(id: number, fields: OrganizationUpdateFields, requesterOrganizerId: number | null, isAdmin: boolean): Promise<boolean> {
        if (!isAdmin) {
            if (requesterOrganizerId === null) {
                throw new Error("Not authorized to update this organization");
            }
            // requesterOrganizerId here is actually the organizer's own organizationId, fetched by the controller
            if (requesterOrganizerId !== id) {
                throw new Error("Not authorized to update this organization");
            }
        }
        return await this.organizationRepository.update(id, fields);
    }

    async deleteOrganization(id: number): Promise<boolean> {
        return await this.organizationRepository.delete(id);
    }
}
export default OrganizationService