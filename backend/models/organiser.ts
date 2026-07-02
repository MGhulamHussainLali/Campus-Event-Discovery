import User from './user.ts'
class Organizer extends User{
    constructor(
        id: number,
        name:string, 
        email:string, 
        hashedPassword:string,
        pictureURL:string|null,
        role: 'student' | 'organizer' | 'admin', 
        accountStatus: 'pending' | 'approved' | 'rejected' | 'suspended', 
        emailVerified:boolean, 
        // Pending: This needs to be readonly.
        createdAt:Date,
        private organisationId:number
        ){
            super(id,name,email,hashedPassword,pictureURL,role,accountStatus,emailVerified,createdAt)
        }
        setOrganisationId(organisationId:number):void{
            this.organisationId=organisationId;
        }
        getOrganisationId():number{
            return this.organisationId;
        }

}

export default Organizer;