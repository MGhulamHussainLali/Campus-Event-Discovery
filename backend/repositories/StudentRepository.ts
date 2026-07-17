import Student, { School } from "../models/student";
import { IDatabase, IDatabaseClient } from "../interfaces/DBConnection";

export type StudentUpdateFields = {
    rollNumber?: number;
    school?: School;
};

const fieldMap: Record<string, string> = {
    rollNumber: 'roll_number',
    school: 'school'
};

class StudentRepository {
    constructor(
        private db: IDatabase
    ) {

    }

    private mapRowToStudent(row: any): Student {
        return new Student(
            row.student_id,
            row.name,
            row.email,
            row.hashed_password,
            row.picture_url,
            row.account_status,
            row.email_verified,
            row.created_at,
            row.roll_number,
            row.school
        );
    }

    async create(student: Student, id: number, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query(
                "INSERT INTO student (student_id, roll_number, school) VALUES ($1,$2,$3) RETURNING *",
                [id, student.getRollNumber(), student.getSchool()]
            );
            return (result.rowCount ?? 0) > 0;
        }
        catch (err: any) {
            if (err.code === '23505') {
                throw new Error('Roll number already exists');
            }
            throw err;
        }
    }

    // StudentRepository.ts
    async update(studentId: number, fields: StudentUpdateFields, client?: IDatabaseClient): Promise<Student | null> {
        const db = client ?? this.db;
        const entries = Object.entries(fields);
        const setClause = entries.map(([key], i) => `${fieldMap[key]}=$${i + 1}`).join(',');
        const setValues = entries.map(([, value]) => value);
        try {
            const result = await db.query(`UPDATE student SET ${setClause} WHERE student_id=$${entries.length + 1} RETURNING *`, [...setValues, studentId]);
            if ((result.rowCount ?? 0) === 0) return null;
            // Need to re-fetch joined with Users, since UPDATE...RETURNING only gives student columns
            return await this.findById(studentId, client);
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async findAll(client?: IDatabaseClient): Promise<Student[] | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query(
                "SELECT u.*, s.roll_number, s.school FROM student s JOIN users u ON u.id = s.student_id",
                []
            );
            if (result.rows.length === 0) return null;
            return result.rows.map((row: any) => this.mapRowToStudent(row));
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async findById(studentId: number, client?: IDatabaseClient): Promise<Student | null> {
        const db = client ?? this.db;
        try {
            const result = await db.query(
                "SELECT u.*, s.roll_number, s.school FROM student s JOIN users u ON u.id = s.student_id WHERE s.student_id=$1",
                [studentId]
            );
            if (result.rows.length === 0) return null;
            return this.mapRowToStudent(result.rows[0]);
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }

    async delete(studentId: number, client?: IDatabaseClient): Promise<boolean> {
        const db = client ?? this.db;
        try {
            const result = await db.query("DELETE FROM student WHERE student_id=$1 RETURNING *", [studentId]);
            return (result.rowCount ?? 0) > 0;
        }
        catch (err: any) {
            throw new Error(err.message);
        }
    }
}

export default StudentRepository