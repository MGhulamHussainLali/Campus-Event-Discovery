import User from "./user"
export enum School {
    SBASSE = 'SBASSE',
    SDSB = 'SDSB',
    MGHSS = 'MGHSS',
    SAHSOL = 'SAHSOL'
}
class Student extends User {
    constructor(
        id: number,
        name: string,
        email: string,
        hashedPassword: string,
        pictureURL: string | null,
        accountStatus: 'pending' | 'approved' | 'rejected' | 'suspended',
        emailVerified: boolean,
        createdAt: Date,
        private rollNumber: number,
        private school: School
    ) {
        super(id, name, email, hashedPassword, pictureURL, "student", accountStatus, emailVerified, createdAt)
    }
    getStudentId(): number {
        return this.getId()
    }
    getRollNumber(): number {
        return this.rollNumber;
    }
    setRollNumber(rollNumber: number) {
        this.rollNumber = rollNumber;
    }
    getSchool(): string {
        return this.school;
    }
    setSchool(school: School) {
        this.school = school;
    }
    // student.ts — add to Student class, overriding the base
    toSafeObject() {
        return {
            ...super.toSafeObject(),
            studentId: this.getStudentId(),
            rollNumber: this.rollNumber,
            school: this.school
        };
    }
    

}
export default Student;