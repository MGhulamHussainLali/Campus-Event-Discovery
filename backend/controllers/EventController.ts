import { Request, Response } from 'express';
import EventService from '../services/EventService';

class EventController {
    constructor(private eventService: EventService) {}

    create = async (req: Request, res: Response) => {
        try {
            const organizerId = (req as any).user.id;
            const { organizationId, title, description, categoryId, venueName, address, posterUrl, startTime, endTime, maxCapacity } = req.body;
            const id = await this.eventService.createEvent(
                organizerId, organizationId, title, description, categoryId,
                venueName ?? null, address ?? null, posterUrl ?? null,
                new Date(startTime), new Date(endTime), maxCapacity ?? null
            );
            res.status(201).json({ id });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    getById = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const event = await this.eventService.getEventById(id);
            if (!event) {
                res.status(404).json({ error: "Event not found" });
                return;
            }
            res.status(200).json(event);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    search = async (req: Request, res: Response) => {
        try {
            const { categoryId, status, organizerId, organizationId, title } = req.query;
            const filters = {
                categoryId: categoryId ? Number(categoryId) : undefined,
                status: status as any,
                organizerId: organizerId ? Number(organizerId) : undefined,
                organizationId: organizationId ? Number(organizationId) : undefined,
                titleSearch: title as string | undefined
            };
            const events = await this.eventService.searchEvents(filters);
            res.status(200).json(events ?? []);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    approve = async (req: Request, res: Response) => {
        try {
            const adminId = (req as any).user.id;
            const id = Number(req.params.id);
            const result = await this.eventService.approveEvent(id, adminId);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    reject = async (req: Request, res: Response) => {
        try {
            const adminId = (req as any).user.id;
            const id = Number(req.params.id);
            const { reason } = req.body;
            const result = await this.eventService.rejectEvent(id, adminId, reason);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    cancel = async (req: Request, res: Response) => {
        try {
            const organizerId = (req as any).user.id;
            const id = Number(req.params.id);
            const result = await this.eventService.cancelEvent(id, organizerId);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    update = async (req: Request, res: Response) => {
        try {
            const organizerId = (req as any).user.id;
            const id = Number(req.params.id);
            const fields = req.body;
            const result = await this.eventService.updateEvent(id, organizerId, fields);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    delete = async (req: Request, res: Response) => {
        try {
            const organizerId = (req as any).user.id;
            const id = Number(req.params.id);
            const result = await this.eventService.deleteEvent(id, organizerId);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
}
export default EventController