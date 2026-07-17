class Interest {
    constructor(
        private id: number,
        private name: string,
        private createdByUserId: number | null,
        private sourceCategoryId: number | null,
        private readonly createdAt: Date
    )
    {

    }

    getId() { return this.id }
    getName() { return this.name }
    setName(name: string) { this.name = name }
    getCreatedByUserId() { return this.createdByUserId }
    getSourceCategoryId() { return this.sourceCategoryId }
    getCreatedAt() { return this.createdAt }
}
export default Interest