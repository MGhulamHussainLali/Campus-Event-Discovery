// CategoryService.ts
import { IDatabase } from '../interfaces/DBConnection';
import CategoryRepository from '../repositories/CategoryRepository';
import InterestRepository from '../repositories/InterestRepository';
import Category from '../models/category';
import Interest from '../models/interest';

class CategoryService {
    constructor(
        private db: IDatabase,
        private categoryRepository: CategoryRepository,
        private interestRepository: InterestRepository
    ) {}

    async createCategory(name: string): Promise<number> {
        const existing = await this.categoryRepository.findByName(name);
        if (existing) {
            throw new Error("Category already exists");
        }

        const client = await this.db.getClient();
        try {
            await client.query("BEGIN");
            const category = new Category(0, name, new Date());
            const categoryId = await this.categoryRepository.create(category, client);

            const interest = new Interest(0, name, null, categoryId, new Date());
            await this.interestRepository.create(interest, null, client);

            await client.query("COMMIT");
            return categoryId;
        }
        catch (error: any) {
            await client.query("ROLLBACK");
            throw error;
        }
        finally {
            client.release();
        }
    }

    async updateCategory(id: number, name: string): Promise<boolean> {
        const client = await this.db.getClient();
        try {
            await client.query("BEGIN");
            const result = await this.categoryRepository.update(id, name, client);
            if (result) {
                await this.interestRepository.updateNameBySourceCategoryId(id, name, client);
            }
            await client.query("COMMIT");
            return result;
        }
        catch (error: any) {
            await client.query("ROLLBACK");
            throw error;
        }
        finally {
            client.release();
        }
    }

    async getCategoryById(id: number): Promise<Category | null> {
        return await this.categoryRepository.findById(id);
    }

    async getAllCategories(): Promise<Category[] | null> {
        return await this.categoryRepository.findAll();
    }

    async deleteCategory(id: number): Promise<boolean> {
        return await this.categoryRepository.delete(id);
    }
}
export default CategoryService