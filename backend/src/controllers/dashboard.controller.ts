import { Response } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { asyncHandler, successResponse } from '../utils/response.js';

export class DashboardController {
  getDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const month = req.query.month ? Number(req.query.month) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const dashboard = await dashboardService.getDashboard(req.user!.userId, month, year);
    successResponse(res, dashboard);
  });
}

export const dashboardController = new DashboardController();
