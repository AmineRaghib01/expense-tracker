import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { Response } from 'express';
import { transactionRepository } from '../repositories/transaction.repository.js';
import { categoryRepository } from '../repositories/category.repository.js';
import { formatCurrency, getMonthRange, getQuarterRange, getYearRange, toNumber } from '../utils/helpers.js';
import { APP_NAME } from '../constants/app.js';

interface ReportParams {
  type: string;
  month?: number;
  quarter?: number;
  year?: number;
  categoryId?: string;
}

export class ReportService {
  async generateReport(userId: string, params: ReportParams) {
    const now = new Date();
    const year = params.year ?? now.getFullYear();
    let start: Date;
    let end: Date;
    let title: string;

    switch (params.type) {
      case 'monthly': {
        const month = params.month ?? now.getMonth() + 1;
        ({ start, end } = getMonthRange(month, year));
        title = `Monthly Report - ${new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`;
        break;
      }
      case 'quarterly': {
        const quarter = params.quarter ?? Math.ceil((now.getMonth() + 1) / 3);
        ({ start, end } = getQuarterRange(quarter, year));
        title = `Q${quarter} ${year} Report`;
        break;
      }
      case 'yearly': {
        ({ start, end } = getYearRange(year));
        title = `Annual Report - ${year}`;
        break;
      }
      default: {
        const month = params.month ?? now.getMonth() + 1;
        ({ start, end } = getMonthRange(month, year));
        title = `Report - ${params.type}`;
      }
    }

    const [incomeAgg, expenseAgg, incomeGrouped, expenseGrouped] = await Promise.all([
      transactionRepository.aggregateByType(userId, start, end, 'INCOME'),
      transactionRepository.aggregateByType(userId, start, end, 'EXPENSE'),
      transactionRepository.groupByCategory(userId, start, end, 'INCOME'),
      transactionRepository.groupByCategory(userId, start, end, 'EXPENSE'),
    ]);

    const categories = await categoryRepository.findAll(userId);
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const totalIncome = toNumber(incomeAgg.sum ?? 0);
    const totalExpenses = toNumber(expenseAgg.sum ?? 0);

    const mapBreakdown = (
      grouped: typeof incomeGrouped,
      type: string,
    ) =>
      grouped
        .map((g) => {
          const cat = categoryMap.get(g.categoryId);
          const amount = toNumber(g._sum.amount ?? 0);
          return {
            categoryId: g.categoryId,
            categoryName: cat?.name ?? 'Unknown',
            color: cat?.color ?? '#6366f1',
            amount,
            count: g._count,
            type,
          };
        })
        .sort((a, b) => b.amount - a.amount);

    let incomeBreakdown = mapBreakdown(incomeGrouped, 'INCOME');
    let expenseBreakdown = mapBreakdown(expenseGrouped, 'EXPENSE');

    if (params.categoryId) {
      incomeBreakdown = incomeBreakdown.filter((b) => b.categoryId === params.categoryId);
      expenseBreakdown = expenseBreakdown.filter((b) => b.categoryId === params.categoryId);
    }

    const report = {
      title,
      period: { start, end },
      summary: {
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
        transactionCount: incomeAgg.count + expenseAgg.count,
      },
      incomeBreakdown,
      expenseBreakdown,
      cashFlow: {
        inflow: totalIncome,
        outflow: totalExpenses,
        net: totalIncome - totalExpenses,
      },
    };

    if (params.type === 'expense') {
      return { ...report, breakdown: expenseBreakdown };
    }
    if (params.type === 'income') {
      return { ...report, breakdown: incomeBreakdown };
    }
    if (params.type === 'category' && params.categoryId) {
      const cat = categoryMap.get(params.categoryId);
      return {
        ...report,
        category: cat,
        breakdown: [...incomeBreakdown, ...expenseBreakdown],
      };
    }
    if (params.type === 'cashflow') {
      return { ...report, cashFlow: report.cashFlow };
    }

    return report;
  }

  async exportPDF(userId: string, params: ReportParams, res: Response): Promise<void> {
    const report = await this.generateReport(userId, params);
    const doc = new PDFDocument({ margin: 50 });
    const filename = `finora-report-${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    doc.fontSize(24).text(APP_NAME, { align: 'center' });
    doc.fontSize(16).text(report.title, { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text('Summary', { underline: true });
    doc.fontSize(11);
    doc.text(`Total Income: ${formatCurrency(report.summary.totalIncome)}`);
    doc.text(`Total Expenses: ${formatCurrency(report.summary.totalExpenses)}`);
    doc.text(`Net Profit: ${formatCurrency(report.summary.netProfit)}`);
    doc.text(`Savings Rate: ${report.summary.savingsRate.toFixed(1)}%`);
    doc.moveDown();

    doc.fontSize(14).text('Expense Breakdown', { underline: true });
    doc.fontSize(11);
    for (const item of report.expenseBreakdown) {
      doc.text(`${item.categoryName}: ${formatCurrency(item.amount)} (${item.count} transactions)`);
    }

    doc.end();
  }

  async exportExcel(userId: string, params: ReportParams, res: Response): Promise<void> {
    const report = await this.generateReport(userId, params);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = APP_NAME;
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 20 },
    ];
    summarySheet.addRows([
      { metric: 'Total Income', value: report.summary.totalIncome },
      { metric: 'Total Expenses', value: report.summary.totalExpenses },
      { metric: 'Net Profit', value: report.summary.netProfit },
      { metric: 'Savings Rate', value: `${report.summary.savingsRate.toFixed(1)}%` },
    ]);

    const expenseSheet = workbook.addWorksheet('Expenses');
    expenseSheet.columns = [
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Transactions', key: 'count', width: 15 },
    ];
    expenseSheet.addRows(
      report.expenseBreakdown.map((e) => ({
        category: e.categoryName,
        amount: e.amount,
        count: e.count,
      })),
    );

    const incomeSheet = workbook.addWorksheet('Income');
    incomeSheet.columns = [
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Transactions', key: 'count', width: 15 },
    ];
    incomeSheet.addRows(
      report.incomeBreakdown.map((i) => ({
        category: i.categoryName,
        amount: i.amount,
        count: i.count,
      })),
    );

    const filename = `finora-report-${Date.now()}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    await workbook.xlsx.write(res);
  }
}

export const reportService = new ReportService();
