import { Request, Response } from 'express';
import AuditLogService from '../services/AuditLogService';

class AuditLogController {
    constructor(
        private auditLogService: AuditLogService
    ) {

    }

    accountHistory = async (req: Request, res: Response) => {
        const userId = Number(req.params.userId);
        try {
            const history = await this.auditLogService.getAccountHistory(userId);
            res.status(200).json(history ?? []);
        }
        catch (err: any) {
            res.status(400).json({ error: err.message });
        }

    }
    eventHistory = async (req: Request, res: Response) => {
        try {
            const eventId = Number(req.params.eventId);
            const history = await this.auditLogService.getEventHistory(eventId);
            res.status(200).json(history ?? []);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }

    }
    settingsHistory = async (req: Request, res: Response) => {
        try {
            const key = req.params.key as string;
            const history = await this.auditLogService.getSettingsHistory(key);
            res.status(200).json(history ?? []);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

}
export default AuditLogController