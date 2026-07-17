// UserController.ts
import { Request, Response } from 'express';
import UserService from '../services/UserService';

class UserController {
    constructor(private userService: UserService) { }

    // UserController.ts
    getMe = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const user = await this.userService.getMyProfile(userId);
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            res.status(200).json(user.toSafeObject());
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    updateMe = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const user = await this.userService.updateMyProfile(userId, req.body);
            res.status(200).json(user ? user.toSafeObject() : null);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    // UserController.ts
updateMyStudentDetails = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const student = await this.userService.updateMyStudentDetails(userId, req.body);
        res.status(200).json(student ? student.toSafeObject() : null);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
}

updateMyOrganizerDetails = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const organizer = await this.userService.updateMyOrganizerDetails(userId, req.body);
        res.status(200).json(organizer ? organizer.toSafeObject() : null);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
}
}
export default UserController