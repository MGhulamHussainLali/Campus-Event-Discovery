import User from './user.ts'

class Organizer extends User{
    constructor(
        id: number,
        name:string, 
        email:string, 
        hashedPassword:string,
        pictureURL:string|null, 
        accountStatus: 'pending' | 'approved' | 'rejected' | 'suspended', 
        emailVerified:boolean,
        createdAt:Date,
        private organizationId:number
        ){
            super(id,name,email,hashedPassword,pictureURL,"organizer",accountStatus,emailVerified,createdAt)
        }
        setOrganizationId(organizationId:number):void{
            this.organizationId=organizationId;
        }
        getOrganizationId():number{
            return this.organizationId;
        }
        getOrganizerId():number{
            return this.getId();
        }

}

export default Organizer;