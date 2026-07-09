export enum NotificationType {
    EVENT_APPROVED = 'event_approved',
    EVENT_REJECTED = 'event_rejected',
    ACCOUNT_APPROVED = 'account_approved',
    ACCOUNT_REJECTED = 'account_rejected',
    ACCOUNT_SUSPENDED = 'account_suspended',
    WAITLIST_PROMOTED = 'waitlist_promoted',
    EVENT_UPDATED = 'event_updated',
    EVENT_CANCELLED = 'event_cancelled',
    EVENT_REMINDER = 'event_reminder'
}

class Notification {
    constructor(
        private id: number,
        private userId: number,
        private title: string,
        private message: string,
        private type: NotificationType,
        private relatedEventId: number | null,
        private isRead: boolean,
        private readonly createdAt: Date
    )
    {

    }

    getId() { return this.id }
    getUserId() { return this.userId }
    getTitle() { return this.title }
    getMessage() { return this.message }
    getType() { return this.type }
    getRelatedEventId() { return this.relatedEventId }
    getIsRead() { return this.isRead }
    setIsRead(isRead: boolean) { this.isRead = isRead }
    getCreatedAt() { return this.createdAt }
}
export default Notification