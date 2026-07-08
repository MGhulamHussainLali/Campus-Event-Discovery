class Organization
{
    constructor(
        private organizationId:number, 
        private name:string, 
        private description:string,
        private logoUrl:string|null, 
        private createdAt:Date

    )
    {

    }
    getId()
    {
        return this.organizationId
    }
    getName()
    {
        return this.name
    }
    setName(name:string)
    {
        this.name=name;
    }
    getDescription()
    {
        return this.description;
    }
    setDescription(description:string)
    {
        this.description=description;
    }
    getLogoUrl()
    {
        return this.logoUrl;
    }
    setLogoUrl(logoUrl:string|null)
    {
        this.logoUrl=logoUrl
    }
    getCreatedAt()
    {
        return this.createdAt;
    }
    



}
export default Organization