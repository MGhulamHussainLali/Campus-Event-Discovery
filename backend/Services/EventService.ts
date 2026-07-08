import EventRepository, { EventUpdateFields } from '../repositories/EventRepository';
import CategoryRepository from '../repositories/CategoryRepository';
import Event, { EventStatus } from '../models/event';

class EventService {
    constructor(
        private eventRepository: EventRepository,
        private categoryRepository: CategoryRepository
    ) {}

    async createEvent(
        organizerId: number,
        organizationId: number,
        title: string,
        description: string,
        categoryId: number,
        venueName: string | null,
        address: string | null,
        posterUrl: string | null,
        startTime: Date,
        endTime: Date,
        maxCapacity: number | null
    ): Promise<number> {
        const category = await this.categoryRepository.findById(categoryId);
        if (!category) {
            throw new Error("Invalid category");
        }
        if (endTime <= startTime) {
            throw new Error("End time must be after start time");
        }
        const event = new Event(
            0, title, description, categoryId, organizerId, organizationId,
            venueName, address, posterUrl, startTime, endTime, maxCapacity,
            EventStatus.PENDING, new Date(), new Date()
        );
        return await this.eventRepository.create(event);
    }

    async getEventById(id: number): Promise<Event | null> {
        return await this.eventRepository.findById(id);
    }

    async searchEvents(filters?: {categoryId?: number, status?: EventStatus, organizerId?: number, organizationId?: number, titleSearch?: string}): Promise<Event[] | null> {
        return await this.eventRepository.findAll(filters);
    }

    async approveEvent(id: number, adminId: number): Promise<boolean> {
        const event = await this.eventRepository.findById(id);
        if (!event) {
            throw new Error("Event not found");
        }
        return await this.eventRepository.updateStatus(id, EventStatus.APPROVED);
    }

    async rejectEvent(id: number, adminId: number, reason: string): Promise<boolean> {
        const event = await this.eventRepository.findById(id);
        if (!event) {
            throw new Error("Event not found");
        }
        return await this.eventRepository.updateStatus(id, EventStatus.REJECTED);
    }

    async cancelEvent(id: number, organizerId: number): Promise<boolean> {
        const event = await this.eventRepository.findById(id);
        if (!event) {
            throw new Error("Event not found");
        }
        if (event.getOrganizerId() !== organizerId) {
            throw new Error("Not authorized to cancel this event");
        }
        return await this.eventRepository.updateStatus(id, EventStatus.CANCELLED);
    }

    async updateEvent(id: number, organizerId: number, fields: EventUpdateFields): Promise<boolean> {
        const event = await this.eventRepository.findById(id);
        if (!event) {
            throw new Error("Event not found");
        }
        if (event.getOrganizerId() !== organizerId) {
            throw new Error("Not authorized to update this event");
        }
        return await this.eventRepository.update(id, fields);
    }

    async deleteEvent(id: number, organizerId: number): Promise<boolean> {
        const event = await this.eventRepository.findById(id);
        if (!event) {
            throw new Error("Event not found");
        }
        if (event.getOrganizerId() !== organizerId) {
            throw new Error("Not authorized to delete this event");
        }
        if (event.getStartTime() <= new Date()) {
            throw new Error("Cannot delete an event that has already started");
        }
        return await this.eventRepository.delete(id);
    }
}
export default EventService