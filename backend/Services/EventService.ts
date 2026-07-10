// EventService.ts
import { IDatabase } from '../interfaces/DBConnection';
import EventRepository, { EventUpdateFields } from '../repositories/EventRepository';
import CategoryRepository from '../repositories/CategoryRepository';
import EventStatusLogRepository from '../repositories/EventStatusLogRepository';
import RegistrationRepository from '../repositories/RegistrationRepository';
import PlatformSettingsService from './PlatformSettingsService';
import NotificationService from './NotificationService';
import Event, { EventStatus } from '../models/event';
import { NotificationType } from '../models/notification';

class EventService {
    constructor(
        private db: IDatabase,
        private eventRepository: EventRepository,
        private categoryRepository: CategoryRepository,
        private eventStatusLogRepository: EventStatusLogRepository,
        private registrationRepository: RegistrationRepository,
        private platformSettingsService: PlatformSettingsService,
        private notificationService: NotificationService
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

        const requireApproval = await this.platformSettingsService.getSetting('require_event_approval');
        const status = (requireApproval === false) ? EventStatus.APPROVED : EventStatus.PENDING;

        const event = new Event(
            0, title, description, categoryId, organizerId, organizationId,
            venueName, address, posterUrl, startTime, endTime, maxCapacity,
            status, new Date(), new Date()
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
        const oldStatus = event.getStatus();
        const client = await this.db.getClient();
        try {
            await client.query("BEGIN");
            const result = await this.eventRepository.updateStatus(id, EventStatus.APPROVED, client);
            await this.eventStatusLogRepository.create(id, adminId, oldStatus, EventStatus.APPROVED, null, client);
            await client.query("COMMIT");

            await this.notificationService.notify(
                event.getOrganizerId(),
                "Event approved",
                `Your event "${event.getTitle()}" has been approved.`,
                NotificationType.EVENT_APPROVED,
                id
            );
            return result;
        } catch (error: any) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async rejectEvent(id: number, adminId: number, reason: string): Promise<boolean> {
        const event = await this.eventRepository.findById(id);
        if (!event) {
            throw new Error("Event not found");
        }
        const oldStatus = event.getStatus();
        const client = await this.db.getClient();
        try {
            await client.query("BEGIN");
            const result = await this.eventRepository.updateStatus(id, EventStatus.REJECTED, client);
            await this.eventStatusLogRepository.create(id, adminId, oldStatus, EventStatus.REJECTED, reason, client);
            await client.query("COMMIT");

            await this.notificationService.notify(
                event.getOrganizerId(),
                "Event rejected",
                `Your event "${event.getTitle()}" was rejected. Reason: ${reason}`,
                NotificationType.EVENT_REJECTED,
                id
            );
            return result;
        } catch (error: any) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async cancelEvent(id: number, organizerId: number): Promise<boolean> {
        const event = await this.eventRepository.findById(id);
        if (!event) {
            throw new Error("Event not found");
        }
        if (event.getOrganizerId() !== organizerId) {
            throw new Error("Not authorized to cancel this event");
        }
        const oldStatus = event.getStatus();
        const client = await this.db.getClient();
        try {
            await client.query("BEGIN");
            const result = await this.eventRepository.updateStatus(id, EventStatus.CANCELLED, client);
            await this.eventStatusLogRepository.create(id, organizerId, oldStatus, EventStatus.CANCELLED, null, client);
            await client.query("COMMIT");

            const attendees = await this.registrationRepository.findByEventId(id);
            if (attendees) {
                for (const registration of attendees) {
                    if (registration.getStatus() === 'going' || registration.getStatus() === 'interested' || registration.getStatus() === 'waitlisted') {
                        await this.notificationService.notify(
                            registration.getStudentId(),
                            "Event cancelled",
                            `The event "${event.getTitle()}" you registered for has been cancelled.`,
                            NotificationType.EVENT_CANCELLED,
                            id
                        );
                    }
                }
            }
            return result;
        } catch (error: any) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
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