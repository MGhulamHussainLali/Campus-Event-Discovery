// RegistrationService.ts
import { IDatabase } from '../interfaces/DBConnection';
import RegistrationRepository from '../repositories/RegistrationRepository';
import EventRepository from '../repositories/EventRepository';
import NotificationService from './NotificationService';
import Registration, { RegistrationStatus } from '../models/registration';
import { EventStatus } from '../models/event';
import { NotificationType } from '../models/notification';

class RegistrationService {
    constructor(
        private db: IDatabase,
        private registrationRepository: RegistrationRepository,
        private eventRepository: EventRepository,
        private notificationService: NotificationService
    ) {}

    async rsvp(studentId: number, eventId: number, desiredStatus: RegistrationStatus): Promise<Registration> {
    const client = await this.db.getClient();
    try {
        await client.query("BEGIN");

        const event = await this.eventRepository.findByIdForUpdate(eventId, client);
        if (!event) {
            throw new Error("Event not found");
        }
        if (event.getStatus() !== EventStatus.APPROVED) {
            throw new Error("Event is not open for RSVPs");
        }

        const existing = await this.registrationRepository.findByStudentAndEvent(studentId, eventId, client);

        let finalStatus = desiredStatus;
        if (desiredStatus === RegistrationStatus.GOING) {
            const maxCapacity = event.getMaxCapacity();
            if (maxCapacity !== null) {
                const currentGoing = await this.eventRepository.getCurrentGoingCount(eventId, client);
                if (currentGoing >= maxCapacity) {
                    finalStatus = RegistrationStatus.WAITLISTED;
                }
            }
        }

        let registrationId: number;
        if (existing) {
            await this.registrationRepository.updateStatus(existing.getId(), finalStatus, client);
            registrationId = existing.getId();
        } else {
            const registration = new Registration(0, studentId, eventId, finalStatus, new Date(), new Date());
            registrationId = await this.registrationRepository.create(registration, client);
        }

        await client.query("COMMIT");

        const result = await this.registrationRepository.findById(registrationId);
        return result as Registration;
    }
    catch (error: any) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}

    async cancelRsvp(studentId: number, eventId: number): Promise<boolean> {
        const existing = await this.registrationRepository.findByStudentAndEvent(studentId, eventId);
        if (!existing) {
            throw new Error("No registration found for this student and event");
        }

        const wasGoing = existing.getStatus() === RegistrationStatus.GOING;
        const client = await this.db.getClient();
        let promotedStudentId: number | null = null;
        try {
            await client.query("BEGIN");
            const result = await this.registrationRepository.updateStatus(existing.getId(), RegistrationStatus.CANCELLED, client);

            if (wasGoing) {
                const nextInLine = await this.registrationRepository.getOldestWaitlisted(eventId, client);
                if (nextInLine) {
                    await this.registrationRepository.updateStatus(nextInLine.getId(), RegistrationStatus.GOING, client);
                    promotedStudentId = nextInLine.getStudentId();
                }
            }

            await client.query("COMMIT");

            if (promotedStudentId) {
                const event = await this.eventRepository.findById(eventId);
                await this.notificationService.notify(
                    promotedStudentId,
                    "You're off the waitlist!",
                    `A spot opened up for "${event?.getTitle() ?? 'an event'}" and you've been moved to Going.`,
                    NotificationType.WAITLIST_PROMOTED,
                    eventId
                );
            }

            return result;
        }
        catch (error: any) {
            await client.query("ROLLBACK");
            throw error;
        }
        finally {
            client.release();
        }
    }

    async getMyRegistrations(studentId: number): Promise<Registration[] | null> {
        return await this.registrationRepository.findByStudentId(studentId);
    }

    async getEventAttendees(eventId: number, organizerId: number): Promise<Registration[] | null> {
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new Error("Event not found");
        }
        if (event.getOrganizerId() !== organizerId) {
            throw new Error("Not authorized to view attendees for this event");
        }
        return await this.registrationRepository.findByEventId(eventId);
    }
}
export default RegistrationService