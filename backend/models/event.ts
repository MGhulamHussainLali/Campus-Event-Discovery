export enum EventStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed'
}

class Event {
    constructor(
        private id: number,
        private title: string,
        private description: string,
        private categoryId: number,
        private organizerId: number,
        private organizationId: number,
        private venueName: string | null,
        private address: string | null,
        private posterUrl: string | null,
        private startTime: Date,
        private endTime: Date,
        private maxCapacity: number | null,
        private status: EventStatus,
        private readonly createdAt: Date,
        private updatedAt: Date,
    )
    {

    }

    getId()
    {
        return this.id
    }
    getTitle()
    {
        return this.title
    }
    getDescription()
    {
        return this.description
    }
    getCategoryId()
    {
        return this.categoryId
    }
    getOrganizerId()
    {
        return this.organizerId
    }
    getOrganizationId()
    {
        return this.organizationId
    }
    getVenueName()
    {
        return this.venueName
    }
    getAddress()
    {
        return this.address
    }
    getPosterUrl()
    {
        return this.posterUrl
    }
    getStartTime()
    {
        return this.startTime
    }
    getEndTime()
    {
        return this.endTime
    }
    getMaxCapacity()
    {
        return this.maxCapacity
    }
    getStatus()
    {
        return this.status
    }
    getCreatedAt()
    {
        return this.createdAt
    }
    getUpdatedAt()
    {
        return this.updatedAt
    }
    setTitle(title: string)
    {
        this.title = title
    }
    setDescription(description: string)
    {
        this.description = description
    }
    setVenueName(venueName: string | null)
    {
        this.venueName = venueName
    }
    setAddress(address: string | null)
    {
        this.address = address
    }
    setPosterUrl(posterUrl: string | null)
    {
        this.posterUrl = posterUrl
    }
    setStartTime(startTime: Date)
    {
        this.startTime = startTime
    }
    setEndTime(endTime: Date)
    {
        this.endTime = endTime
    }
    setMaxCapacity(maxCapacity: number | null)
    {
        this.maxCapacity = maxCapacity
    }
    setStatus(status: EventStatus)
    {
        this.status = status
    }
    setUpdatedAt(updatedAt: Date)
    {
        this.updatedAt = updatedAt
    }
}
export default Event