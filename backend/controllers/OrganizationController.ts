import { Request, Response } from 'express';
import OrganizationService from '../services/OrganizationService';

class OrganizationController {
    constructor(private organizationService: OrganizationService) {}

    create = async (req: Request, res: Response) => {
        try {
            const { name, description, logoUrl } = req.body;
            const id = await this.organizationService.createOrganization(name, description, logoUrl ?? null);
            res.status(201).json({ id });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    getById = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const organization = await this.organizationService.getOrganizationById(id);
            if (!organization) {
                res.status(404).json({ error: "Organization not found" });
                return;
            }
            res.status(200).json(organization);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    getAll = async (req: Request, res: Response) => {
        try {
            const organizations = await this.organizationService.getAllOrganizations();
            res.status(200).json(organizations ?? []);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    update = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const fields = req.body;
            const result = await this.organizationService.updateOrganization(id, fields);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    delete = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const result = await this.organizationService.deleteOrganization(id);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
}
export default OrganizationController