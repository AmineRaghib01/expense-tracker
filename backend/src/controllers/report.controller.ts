import { Response } from 'express';
import { reportService } from '../services/report.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { asyncHandler, successResponse } from '../utils/response.js';

export class ReportController {
  generate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query as unknown as {
      type: string;
      month?: number;
      quarter?: number;
      year?: number;
      categoryId?: string;
      format?: string;
    };
    const format = query.format ?? 'json';

    if (format === 'pdf') {
      await reportService.exportPDF(req.user!.userId, query, res);
      return;
    }
    if (format === 'excel') {
      await reportService.exportExcel(req.user!.userId, query, res);
      return;
    }

    const report = await reportService.generateReport(req.user!.userId, query);
    successResponse(res, report);
  });
}

export const reportController = new ReportController();
