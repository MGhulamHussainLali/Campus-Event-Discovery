import User from './user.ts'
class Admin extends User {
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
        private isSuperAdmin:boolean,
        private createdByAdminId:number|null
)

{
    super(id,name,email,hashedPassword,pictureURL,role,accountStatus,emailVerified,createdAt);
}

getIsSuperAdmin():boolean
{
    return this.isSuperAdmin;
}

setIsSuperAdmin(isSuperAdmin:boolean):void
{
    this.isSuperAdmin=isSuperAdmin;
}

getCreatedByAdminId(): number | null {
    return this.createdByAdminId;
  }

setCreatedByAdminId(createdByAdminId:number|null)
{
    this.createdByAdminId=createdByAdminId;
}

}
export default Admin;