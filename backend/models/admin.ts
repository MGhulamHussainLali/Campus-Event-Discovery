import User from './user.ts'

class Admin extends User {
constructor(
        id: number,
        name:string, 
        email:string, 
        hashedPassword:string,
        pictureURL:string|null, 
        accountStatus: 'pending' | 'approved' | 'rejected' | 'suspended', 
        emailVerified:boolean, 
        createdAt:Date,
        private isSuperAdmin:boolean,
        private createdByAdminId:number|null
)

{
    super(id,name,email,hashedPassword,pictureURL,"admin",accountStatus,emailVerified,createdAt);
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
getAdminId():number
{
return this.getId();
}

}
export default Admin;