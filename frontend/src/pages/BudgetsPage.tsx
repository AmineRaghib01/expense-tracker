import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, PiggyBank, Trash2, AlertTriangle } from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { useQuery } from '@/hooks/useQuery';
import { budgetApi, categoryApi } from '@/api';
import { useAuthStore } from '@/store/auth.store';
import { formatCurrency } from '@/utils/cn';
import { toast } from '@/components/ui/toast';
import { cn } from '@/utils/cn';

const schema = z.object({
  amount: z.number().positive(),
  categoryId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function BudgetsPage() {
  const { user } = useAuthStore();
  const currency = user?.currency || 'USD';
  const now = new Date();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: budgets, loading, error, refetch } = useQuery(
    () => budgetApi.getAll(now.getMonth() + 1, now.getFullYear()),
    [],
  );
  const { data: categories } = useQuery(() => categoryApi.getAll('EXPENSE'), []);

  const { register, handleSubmit, setValue, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (formData: FormData) => {
    try {
      await budgetApi.create({
        amount: formData.amount,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        categoryId: formData.categoryId || null,
      });
      toast.success('Budget created');
      setDialogOpen(false);
      reset();
      refetch();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast.error('Error', message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this budget?')) return;
    await budgetApi.delete(id);
    toast.success('Budget deleted');
    refetch();
  };

  const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Budgets</h1>
            <p className="text-muted-foreground text-sm">{monthName}</p>
          </div>
          <Button onClick={() => { reset(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Budget
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : !budgets?.length ? (
          <EmptyState icon={PiggyBank} title="No budgets set" description="Create budgets to track your spending limits." actionLabel="Add Budget" onAction={() => setDialogOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((budget) => (
              <Card key={budget.id} className={cn(budget.isOverBudget && 'border-destructive/50')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">
                    {budget.category?.name || 'Overall Budget'}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {budget.status === 'over' && <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Over</Badge>}
                    {budget.status === 'warning' && <Badge variant="warning">Warning</Badge>}
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(budget.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>{formatCurrency(budget.spent, currency)} spent</span>
                    <span className="text-muted-foreground">of {formatCurrency(budget.amount, currency)}</span>
                  </div>
                  <Progress
                    value={budget.percentage}
                    indicatorClassName={budget.isOverBudget ? 'bg-destructive' : budget.percentage > 80 ? 'bg-warning' : 'bg-success'}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(budget.remaining, currency)} remaining · {budget.percentage.toFixed(0)}% used
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Budget</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Category (optional)</Label>
              <Select onValueChange={(v) => setValue('categoryId', v === 'overall' ? undefined : v)}>
                <SelectTrigger><SelectValue placeholder="Overall budget" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">Overall budget</SelectItem>
                  {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>Create Budget</Button>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
