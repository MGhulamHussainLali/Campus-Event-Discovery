import CategoryRepository from '../repositories/CategoryRepository';
import Category from '../models/category';

class CategoryService {
    constructor(private categoryRepository: CategoryRepository) {}

    async createCategory(name: string): Promise<number> {
        const existing = await this.categoryRepository.findByName(name);
        if (existing) {
            throw new Error("Category already exists");
        }
        const category = new Category(0, name, new Date());
        return await this.categoryRepository.create(category);
    }

    async getCategoryById(id: number): Promise<Category | null> {
        return await this.categoryRepository.findById(id);
    }

    async getAllCategories(): Promise<Category[] | null> {
        return await this.categoryRepository.findAll();
    }

    async updateCategory(id: number, name: string): Promise<boolean> {
        return await this.categoryRepository.update(id, name);
    }

    async deleteCategory(id: number): Promise<boolean> {
        return await this.categoryRepository.delete(id);
    }
}
export default CategoryService