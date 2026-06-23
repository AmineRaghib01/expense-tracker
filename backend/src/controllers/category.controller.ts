import { Response } from 'express';
import { categoryService } from '../services/category.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { asyncHandler, successResponse } from '../utils/response.js';
import { CategoryType } from '@prisma/client';

export class CategoryController {
  getAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const type = req.query.type as CategoryType | undefined;
    const categories = await categoryService.getAll(req.user!.userId, type);
    successResponse(res, categories);
  });

  getById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const category = await categoryService.getById(String(req.params.id), req.user!.userId);
    successResponse(res, category);
  });

  create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const category = await categoryService.create(req.user!.userId, req.body);
    successResponse(res, category, 'Category created', 201);
  });

  update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const category = await categoryService.update(String(req.params.id), req.user!.userId, req.body);
    successResponse(res, category, 'Category updated');
  });

  delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await categoryService.delete(String(req.params.id), req.user!.userId);
    successResponse(res, null, 'Category deleted');
  });
}

export const categoryController = new CategoryController();
