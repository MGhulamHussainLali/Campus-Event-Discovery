import InterestRepository from '../repositories/InterestRepository';
import StudentInterestRepository from '../repositories/StudentInterestRepository';
import Interest from '../models/interest';

class InterestService {
    constructor(
        private interestRepository: InterestRepository,
        private studentInterestRepository: StudentInterestRepository
    ) {}

    async createInterest(name: string, createdByUserId: number | null): Promise<number> {
    const existing = await this.interestRepository.findByName(name);
    if (existing) {
        throw new Error("Interest already exists");
    }
    const interest = new Interest(0, name, createdByUserId, null, new Date());
    return await this.interestRepository.create(interest, createdByUserId);
}

async getTrendingInterests() {
    return await this.interestRepository.getTrendingInterests();
}

    async getInterestById(id: number): Promise<Interest | null> {
        return await this.interestRepository.findById(id);
    }

    async getAllInterests(): Promise<Interest[] | null> {
        return await this.interestRepository.findAll();
    }

    async updateInterest(id: number, name: string): Promise<boolean> {
        return await this.interestRepository.update(id, name);
    }

    async deleteInterest(id: number): Promise<boolean> {
        return await this.interestRepository.delete(id);
    }

    async addStudentInterest(studentId: number, interestId: number): Promise<boolean> {
        const interest = await this.interestRepository.findById(interestId);
        if (!interest) {
            throw new Error("Interest not found");
        }
        return await this.studentInterestRepository.addInterest(studentId, interestId);
    }

    async removeStudentInterest(studentId: number, interestId: number): Promise<boolean> {
        return await this.studentInterestRepository.removeInterest(studentId, interestId);
    }

    async getStudentInterests(studentId: number): Promise<Interest[]> {
        return await this.studentInterestRepository.findInterestsByStudentId(studentId);
    }
}
export default InterestService
