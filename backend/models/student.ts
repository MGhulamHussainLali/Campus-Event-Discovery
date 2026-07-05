import User from "./user"
export enum School {
    SBASSE = 'SBASSE - Syed Babar Ali School of Science and Engineering',
    SDSB = 'SDSB - Suleiman Dawood School of Business',
    MGHSS = 'MGHSS - Mushtaq Gurmani School of Humanities and Social Sciences',
    SAHSOL = 'SAHSOL - Sheikh Ahmad Hassan School of Law'
}
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
        private school:School
    )
    {
        super(id,name,email,hashedPassword,pictureURL,"student",accountStatus,emailVerified,createdAt)
    }
    getStudentId():number{
        return this.getId()
    }
    getRollNumber():number{
        return this.rollNumber;
    }
    setRollNumber(rollNumber:number)
    {
        this.rollNumber=rollNumber;
    }
    getSchool():string{
        return this.school;
    }
    setSchool(school:School){
        this.school=school;
    }
    
}
export default Student;