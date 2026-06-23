import { Response } from 'express';
import { transactionService } from '../services/transaction.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { asyncHandler, successResponse } from '../utils/response.js';

export class TransactionController {
  getAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await transactionService.getAll(req.user!.userId, req.query);
    successResponse(res, result);
  });

  getById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const transaction = await transactionService.getById(String(req.params.id), req.user!.userId);
    successResponse(res, transaction);
  });

  create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const transaction = await transactionService.create(req.user!.userId, req.body);
    successResponse(res, transaction, 'Transaction created', 201);
  });

  update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const transaction = await transactionService.update(
      String(req.params.id),
      req.user!.userId,
      req.body,
    );
    successResponse(res, transaction, 'Transaction updated');
  });

  delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await transactionService.delete(String(req.params.id), req.user!.userId);
    successResponse(res, null, 'Transaction deleted');
  });
}

export const transactionController = new TransactionController();
