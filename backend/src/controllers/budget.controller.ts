import { Response } from 'express';
import { budgetService } from '../services/budget.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { asyncHandler, successResponse } from '../utils/response.js';

export class BudgetController {
  getAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const month = req.query.month ? Number(req.query.month) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const budgets = await budgetService.getAll(req.user!.userId, month, year);
    successResponse(res, budgets);
  });

  getById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const budget = await budgetService.getById(String(req.params.id), req.user!.userId);
    successResponse(res, budget);
  });

  create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const budget = await budgetService.create(req.user!.userId, req.body);
    successResponse(res, budget, 'Budget created', 201);
  });

  update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const budget = await budgetService.update(String(req.params.id), req.user!.userId, req.body);
    successResponse(res, budget, 'Budget updated');
  });

  delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await budgetService.delete(String(req.params.id), req.user!.userId);
    successResponse(res, null, 'Budget deleted');
  });
}

export const budgetController = new BudgetController();
