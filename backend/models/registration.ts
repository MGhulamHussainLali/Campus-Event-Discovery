export enum RegistrationStatus {
    GOING = 'going',
    INTERESTED = 'interested',
    WAITLISTED = 'waitlisted',
    CANCELLED = 'cancelled'
}

class Registration
{
    constructor(
        private id: number,
        private studentId: number,
        private eventId: number,
        private status: RegistrationStatus,
        private readonly createdAt: Date,
        private updatedAt: Date
    )
    {

    }

    getId()
    {
        return this.id
    }
    getStudentId()
    {
        return this.studentId
    }
    getEventId()
    {
        return this.eventId
    }
    getStatus()
    {
        return this.status
    }
    setStatus(status: RegistrationStatus)
    {
        this.status = status
    }
    getCreatedAt()
    {
        return this.createdAt
    }
    getUpdatedAt()
    {
        return this.updatedAt
    }
    setUpdatedAt(updatedAt: Date)
    {
        this.updatedAt = updatedAt
    }
}
export default Registration