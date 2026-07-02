import User from "./user"
class Student extends User
{
    constructor(
        id:number, 
        name:string, 
        email:string, 
        hashedPassword:string, 
        pictureURL:string|null, 
        accountStatus:'pending' | 'approved' | 'rejected' | 'suspended', 
        emailVerified: boolean,
        createdAt: Date,
        private rollNumber: number,
        private school: string
    )
    {
        super(id,name,email,hashedPassword,pictureURL,"student",accountStatus,emailVerified,createdAt)
    }
    getrollNumber():number{
        return this.rollNumber;
    }
    getSchool():string{
        return this.school;
    }
}
export default Student;