import { Request, Response } from 'express';
import InterestService from '../services/InterestService';

class InterestController {
    constructor(private interestService: InterestService) {}

    create = async (req: Request, res: Response) => {
        try {
            const { name } = req.body;
            const id = await this.interestService.createInterest(name);
            res.status(201).json({ id });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    getById = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const interest = await this.interestService.getInterestById(id);
            if (!interest) {
                res.status(404).json({ error: "Interest not found" });
                return;
            }
            res.status(200).json(interest);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    getAll = async (req: Request, res: Response) => {
        try {
            const interests = await this.interestService.getAllInterests();
            res.status(200).json(interests ?? []);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    update = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const { name } = req.body;
            const result = await this.interestService.updateInterest(id, name);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    delete = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const result = await this.interestService.deleteInterest(id);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    addStudentInterest = async (req: Request, res: Response) => {
        try {
            const studentId = (req as any).user.id;
            const interestId = Number(req.params.id);
            const result = await this.interestService.addStudentInterest(studentId, interestId);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    removeStudentInterest = async (req: Request, res: Response) => {
        try {
            const studentId = (req as any).user.id;
            const interestId = Number(req.params.id);
            const result = await this.interestService.removeStudentInterest(studentId, interestId);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    getStudentInterests = async (req: Request, res: Response) => {
        try {
            const studentId = (req as any).user.id;
            const interests = await this.interestService.getStudentInterests(studentId);
            res.status(200).json(interests);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
}
export default InterestController