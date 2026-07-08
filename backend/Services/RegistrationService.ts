import RegistrationRepository from '../repositories/RegistrationRepository';
import EventRepository from '../repositories/EventRepository';
import Registration, { RegistrationStatus } from '../models/registration';
import { EventStatus } from '../models/event';
import { IDatabase } from '../interfaces/DBConnection';

class RegistrationService {
    constructor(
        private db: IDatabase,
        private registrationRepository: RegistrationRepository,
        private eventRepository: EventRepository
    ) {}

    async rsvp(studentId: number, eventId: number, desiredStatus: RegistrationStatus): Promise<Registration> {
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new Error("Event not found");
        }
        if (event.getStatus() !== EventStatus.APPROVED) {
            throw new Error("Event is not open for RSVPs");
        }

        const existing = await this.registrationRepository.findByStudentAndEvent(studentId, eventId);

        let finalStatus = desiredStatus;
        if (desiredStatus === RegistrationStatus.GOING) {
            const maxCapacity = event.getMaxCapacity();
            if (maxCapacity !== null) {
                const currentGoing = await this.eventRepository.getCurrentGoingCount(eventId);
                if (currentGoing >= maxCapacity) {
                    finalStatus = RegistrationStatus.WAITLISTED;
                }
            }
        }

        if (existing) {
            await this.registrationRepository.updateStatus(existing.getId(), finalStatus);
            const updated = await this.registrationRepository.findById(existing.getId());
            return updated as Registration;
        } else {
            const registration = new Registration(0, studentId, eventId, finalStatus, new Date(), new Date());
            const id = await this.registrationRepository.create(registration);
            const created = await this.registrationRepository.findById(id);
            return created as Registration;
        }
    }

    async cancelRsvp(studentId: number, eventId: number): Promise<boolean> {
        const existing = await this.registrationRepository.findByStudentAndEvent(studentId, eventId);
        if (!existing) {
            throw new Error("No registration found for this student and event");
        }

        const wasGoing = existing.getStatus() === RegistrationStatus.GOING;
        const client = await this.db.getClient();
        try {
            await client.query("BEGIN");
            const result = await this.registrationRepository.updateStatus(existing.getId(), RegistrationStatus.CANCELLED, client);

            if (wasGoing) {
                const nextInLine = await this.registrationRepository.getOldestWaitlisted(eventId, client);
                if (nextInLine) {
                    await this.registrationRepository.updateStatus(nextInLine.getId(), RegistrationStatus.GOING, client);
                    // notification to promoted student deferred to Notifications module
                }
            }

            await client.query("COMMIT");
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