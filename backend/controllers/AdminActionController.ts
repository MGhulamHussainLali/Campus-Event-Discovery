import { Request, Response } from 'express';
import AdminActionService from '../services/AdminActionService';

class AdminActionController {
    constructor(private adminActionService: AdminActionService) { }

    approveAccount = async (req: Request, res: Response) => {
        try {
            const adminId = (req as any).user.id;
            const userId = Number(req.params.id);
            const result = await this.adminActionService.approveAccount(userId, adminId);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    rejectAccount = async (req: Request, res: Response) => {
        try {
            const adminId = (req as any).user.id;
            const userId = Number(req.params.id);
            const { reason } = req.body;
            const result = await this.adminActionService.rejectAccount(userId, adminId, reason);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    suspendAccount = async (req: Request, res: Response) => {
        try {
            const adminId = (req as any).user.id;
            const userId = Number(req.params.id);
            const { reason } = req.body;
            const result = await this.adminActionService.suspendAccount(userId, adminId, reason);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    // AdminActionController.ts
    pendingAccounts = async (req: Request, res: Response) => {
        try {
            const role = req.query.role as string | undefined;
            const accounts = await this.adminActionService.getPendingAccounts(role);
            res.status(200).json(accounts ? accounts.map(u => u.toSafeObject()) : []);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    allAdmins = async (req: Request, res: Response) => {
        try {
            const admins = await this.adminActionService.getAllAdmins();
            res.status(200).json(admins ? admins.map(a => a.toSafeObject()) : []);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    createAdmin = async (req: Request, res: Response) => {
        try {
            const createdByAdminId = (req as any).user.id;
            const { name, email, password, isSuperAdmin } = req.body;
            const result = await this.adminActionService.createAdmin(name, email, password, isSuperAdmin ?? false, createdByAdminId);
            res.status(201).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
}
export default AdminActionController