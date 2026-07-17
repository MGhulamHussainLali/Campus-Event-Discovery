import { IDatabase, IDatabaseClient } from "../interfaces/DBConnection"
import Interest from "../models/interest";
class StudentInterestRepository {
    constructor(
        private db: IDatabase
    ) {

    }
    async addInterest(studentId: number, interestId: number, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query("INSERT INTO Student_Interest(student_id,interest_id) VALUES ($1,$2) RETURNING *", [studentId, interestId]);
            return (result.rowCount ?? 0) > 0;
        }
        catch (error: any) {
            throw new Error(error.message);
        }

    }
    async removeInterest(studentId: number, interestId: number, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query("DELETE FROM Student_Interest WHERE student_id=$1 and interest_id=$2 RETURNING *", [studentId, interestId])
            return (result.rowCount ?? 0) > 0
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    }
    async findInterestsByStudentId(studentId: number, client?: IDatabaseClient): Promise<Interest[]> {
        const db = client ?? this.db;
        try {
            const result = await db.query("SELECT i.* FROM Student_Interest s JOIN Interest i ON s.interest_id = i.id WHERE s.student_id = $1", [studentId])
            return result.rows.map((row: any) => new Interest(row.id, row.name, row.created_by_user_id, row.source_category_id, row.created_at))
        }
        catch (err: any) {
            throw new Error(err.message)
        }
    }

}
export default StudentInterestRepository