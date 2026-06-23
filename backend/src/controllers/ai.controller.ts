import { Response } from 'express';
import { aiService } from '../services/ai.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { asyncHandler, successResponse } from '../utils/response.js';

export class AIController {
  getInsights = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const insights = await aiService.getInsights(req.user!.userId);
    successResponse(res, insights);
  });

  generateInsights = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const insights = await aiService.generateInsights(req.user!.userId);
    successResponse(res, insights, 'Insights generated');
  });

  getSpendingAnalysis = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const analysis = await aiService.getSpendingAnalysis(req.user!.userId);
    successResponse(res, analysis);
  });

  getFinancialHealth = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const health = await aiService.getFinancialHealth(req.user!.userId);
    successResponse(res, health);
  });

  getForecast = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const forecast = await aiService.getForecast(req.user!.userId);
    successResponse(res, forecast);
  });
}

export const aiController = new AIController();
