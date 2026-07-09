import { Request, Response } from 'express';
import PlatformSettingsService from '../services/PlatformSettingsService';

class PlatformSettingsController {
    constructor(private platformSettingsService: PlatformSettingsService) {}

    getAll = async (req: Request, res: Response) => {
        try {
            const settings = await this.platformSettingsService.getAllSettings();
            res.status(200).json(settings);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    getOne = async (req: Request, res: Response) => {
        try {
            const key = req.params.key as string;
            const value = await this.platformSettingsService.getSetting(key);
            if (value === null) {
                res.status(404).json({ error: "Setting not found" });
                return;
            }
            res.status(200).json({ key, value });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    update = async (req: Request, res: Response) => {
        try {
            const key = req.params.key as string;
            const { value } = req.body;
            const adminId = (req as any).user.id;
            const result = await this.platformSettingsService.updateSetting(key, value, adminId);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    addDomain = async (req: Request, res: Response) => {
        try {
            const { domain } = req.body;
            const id = await this.platformSettingsService.addAllowedDomain(domain);
            res.status(201).json({ id });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    getDomains = async (req: Request, res: Response) => {
        try {
            const domains = await this.platformSettingsService.getAllowedDomains();
            res.status(200).json(domains);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    removeDomain = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const result = await this.platformSettingsService.removeAllowedDomain(id);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
}
export default PlatformSettingsController