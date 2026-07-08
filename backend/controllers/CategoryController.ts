import { Request, Response } from 'express';
import CategoryService from '../services/CategoryService';

class CategoryController {
    constructor(private categoryService: CategoryService) {}

    create = async (req: Request, res: Response) => {
        try {
            const { name } = req.body;
            const id = await this.categoryService.createCategory(name);
            res.status(201).json({ id });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    getById = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const category = await this.categoryService.getCategoryById(id);
            if (!category) {
                res.status(404).json({ error: "Category not found" });
                return;
            }
            res.status(200).json(category);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    getAll = async (req: Request, res: Response) => {
        try {
            const categories = await this.categoryService.getAllCategories();
            res.status(200).json(categories ?? []);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    update = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const { name } = req.body;
            const result = await this.categoryService.updateCategory(id, name);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    delete = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const result = await this.categoryService.deleteCategory(id);
            res.status(200).json({ success: result });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
}
export default CategoryController