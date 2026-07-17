class User {
    constructor(
        private id: number,
        private name: string,
        private email: string,
        private hashedPassword: string,
        private pictureURL: string | null,
        private role: 'student' | 'organizer' | 'admin',
        private accountStatus: 'pending' | 'approved' | 'rejected' | 'suspended',
        private emailVerified: boolean,
        // Pending: This needs to be readonly.
        private readonly createdAt: Date

    ) {

    }
    getId(): number {
        return this.id;
    }
    //Design Choice: we don't need setId, Id is set by the DB itself (Serial PK)
    // setId(id:number):void{
    //     this.id=id;
    // }
    getName(): string {
        return this.name;
    }
    setName(name: string): void {
        this.name = name;
    }
    getEmail(): string {
        return this.email;
    }
    setEmail(email: string) {
        this.email = email;
    }
    getHashedPassword(): string {
        return this.hashedPassword;
    }
    setHashedPassword(hashedPassword: string) {
        this.hashedPassword = hashedPassword;
    }
    getPictureURL(): string | null {
        return this.pictureURL;
    }
    setPictureURL(pictureURL: string | null): void {
        this.pictureURL = pictureURL;
    }
    getRole(): string {
        return this.role;
    }
    getAccountStatus(): string {
        return this.accountStatus;
    }
    setAccountStatus(accountStatus: 'pending' | 'approved' | 'rejected' | 'suspended') {
        this.accountStatus = accountStatus;
    }

    getEmailVerified(): boolean {
        return this.emailVerified;
    }
    setEmailVerified(emailVerified: boolean) {
        this.emailVerified = emailVerified;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }
    // user.ts — add to User class
    toSafeObject() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            pictureUrl: this.pictureURL,
            role: this.role,
            accountStatus: this.accountStatus,
            emailVerified: this.emailVerified,
            createdAt: this.createdAt
        };
    }

}
export default User

