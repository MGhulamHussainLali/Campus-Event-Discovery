class Interest
{
    constructor(
        private id:number, 
        private name:string, 
        private createdAt:Date
    )
    {

    }
    getid()
    {
        return this.id;
    }
    getname()
    {
        return this.name;
    }
    setName(name:string)
    {
        this.name=name;    
    }
    getCreatedAt()
    {
        return this.createdAt;
    }
    


}
export default Interest
