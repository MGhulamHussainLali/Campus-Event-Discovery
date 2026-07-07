import { Request, Response } from 'express'
import AuthService from '../Services/AuthService'

class AuthController {
    constructor(private authService: AuthService) { }
    signupStudent = async (req: Request, res: Response) => {
        try {
            const { name, email, password, rollNumber, school } = req.body;
            const result = await this.authService.signupStudent(name, email, password, rollNumber, school);
            res.status(201).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
    signupOrganizer = async (req: Request, res: Response) => {
        try {
            const { name, email, password, organizationId } = req.body;
            const result = await this.authService.signupOrganizer(name, email, password, organizationId);
            res.status(201).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
    verifyEmail = async (req: Request, res: Response) => {
        try {
            const token = req.query.token as string;
            const result = await this.authService.verifyEmail(token);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const userAgent = req.headers['user-agent'] ?? null;
            const ipAddress = req.ip ?? null;
            const result = await this.authService.login(email, password, userAgent, ipAddress);
            res.status(200).json(result);
        } catch (err: any) {
            res.status(401).json({ error: err.message });
        }
    }
    refreshToken = async (req: Request, res: Response) => {
        try {
            const rawRefreshToken = req.cookies?.refreshToken;
            const result = await this.authService.refreshToken(rawRefreshToken);
            res.status(200).json(result);
        } catch (err: any) {
            res.status(401).json({ error: err.message });
        }
    }

    logout = async (req: Request, res: Response) => {
        try {
            const rawRefreshToken = req.cookies?.refreshToken;
            const result = await this.authService.logout(rawRefreshToken);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    logoutAllDevices = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const result = await this.authService.logoutAllDevices(userId);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
    requestPasswordReset = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;
            const result = await this.authService.requestPasswordReset(email);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
    resetPassword = async (req: Request, res: Response) => {
        try {
            const { token, newPassword } = req.body;
            const result = await this.authService.resetPassword(token, newPassword);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
    changePassword = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const { oldPassword, newPassword } = req.body;
            const result = await this.authService.changePassword(userId, oldPassword, newPassword);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }



}
export default AuthController;