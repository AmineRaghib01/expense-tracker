import { useState } from 'react';
import { FileBarChart, Download, FileSpreadsheet } from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { useQuery } from '@/hooks/useQuery';
import { reportApi } from '@/api';
import { useAuthStore } from '@/store/auth.store';
import { formatCurrency } from '@/utils/cn';
import { toast } from '@/components/ui/toast';

export default function ReportsPage() {
  const { user } = useAuthStore();
  const currency = user?.currency || 'USD';
  const now = new Date();
  const [reportType, setReportType] = useState('monthly');
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));

  const { data: report, loading, error, refetch } = useQuery(
    () => reportApi.generate({ type: reportType, month: Number(month), year: Number(year) }),
    [reportType, month, year],
  );

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const api = format === 'pdf' ? reportApi.exportPdf : reportApi.exportExcel;
      const response = await api({ type: reportType, month: Number(month), year: Number(year) });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finora-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} exported`);
    } catch {
      toast.error('Export failed');
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: new Date(2024, i).toLocaleString('en-US', { month: 'long' }),
  }));

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-muted-foreground text-sm">Generate and export financial reports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download className="h-4 w-4 mr-2" /> PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('excel')}>
              <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="expense">Expense Report</SelectItem>
                    <SelectItem value="income">Income Report</SelectItem>
                    <SelectItem value="cashflow">Cash Flow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {reportType === 'monthly' && (
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {months.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Skeleton className="h-96 rounded-xl" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : report ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <FileBarChart className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">{report.title}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Income', value: report.summary.totalIncome, color: 'text-success' },
                { label: 'Total Expenses', value: report.summary.totalExpenses, color: 'text-destructive' },
                { label: 'Net Profit', value: report.summary.netProfit, color: 'text-primary' },
                { label: 'Savings Rate', value: report.summary.savingsRate, color: 'text-foreground', suffix: '%' },
              ].map((item) => (
                <Card key={item.label}>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${item.color}`}>
                      {item.suffix ? `${item.value.toFixed(1)}%` : formatCurrency(item.value, currency)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {report.expenseBreakdown.map((item) => (
                    <div key={item.categoryId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.categoryName}</span>
                        <Badge variant="outline" className="text-[10px]">{item.count} txns</Badge>
                      </div>
                      <span className="font-medium">{formatCurrency(item.amount, currency)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Income Breakdown</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {report.incomeBreakdown.map((item) => (
                    <div key={item.categoryId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.categoryName}</span>
                        <Badge variant="outline" className="text-[10px]">{item.count} txns</Badge>
                      </div>
                      <span className="font-medium">{formatCurrency(item.amount, currency)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
