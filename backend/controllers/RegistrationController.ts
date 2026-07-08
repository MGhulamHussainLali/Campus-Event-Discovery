import { Request, Response } from 'express';
import RegistrationService from '../services/RegistrationService';

class RegistrationController {
    constructor(private registrationService: RegistrationService) {}

    rsvp = async (req: Request, res: Response) => {
        try {
            const studentId = (req as any).user.id;
            const eventId = Number(req.params.id);
            const { status } = req.body;
            const registration = await this.registrationService.rsvp(studentId, eventId, status);
            res.status(200).json(registration);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    cancel = async (req: Request, res: Response) => {
        try {
            const studentId = (req as any).user.id;
            const eventId = Number(req.params.id);
            const result = await this.registrationService.cancelRsvp(studentId, eventId);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    myRegistrations = async (req: Request, res: Response) => {
        try {
            const studentId = (req as any).user.id;
            const registrations = await this.registrationService.getMyRegistrations(studentId);
            res.status(200).json(registrations ?? []);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    eventAttendees = async (req: Request, res: Response) => {
        try {
            const organizerId = (req as any).user.id;
            const eventId = Number(req.params.id);
            const attendees = await this.registrationService.getEventAttendees(eventId, organizerId);
            res.status(200).json(attendees ?? []);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
}
export default RegistrationController