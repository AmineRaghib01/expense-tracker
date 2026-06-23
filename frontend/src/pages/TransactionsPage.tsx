import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowUpRight,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { useQuery } from '@/hooks/useQuery';
import { transactionApi, categoryApi } from '@/api';
import { useAuthStore } from '@/store/auth.store';
import { cn, formatCurrency, formatDate } from '@/utils/cn';
import { toast } from '@/components/ui/toast';
import type { Transaction, Category } from '@/types';

const schema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().min(1, 'Category is required'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function TransactionsPage() {
  const { user } = useAuthStore();
  const currency = user?.currency || 'USD';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const { data, loading, error, refetch } = useQuery(
    () =>
      transactionApi.getAll({
        page,
        limit: 10,
        search: search || undefined,
        type: typeFilter || undefined,
        sortBy: 'date',
        sortOrder: 'desc',
      }),
    [page, search, typeFilter],
  );

  const { data: categories } = useQuery(() => categoryApi.getAll(), []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'EXPENSE', date: new Date().toISOString().split('T')[0] },
  });

  const txType = watch('type');
  const filteredCategories = categories?.filter((c) => c.type === txType) || [];

  const openCreate = () => {
    setEditingTx(null);
    reset({ type: 'EXPENSE', date: new Date().toISOString().split('T')[0], amount: 0, description: '', categoryId: '', notes: '' });
    setDialogOpen(true);
  };

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    reset({
      amount: tx.amount,
      description: tx.description,
      date: tx.date.split('T')[0],
      type: tx.type,
      categoryId: tx.categoryId,
      notes: tx.notes || '',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (formData: FormData) => {
    try {
      const payload = { ...formData, date: new Date(formData.date).toISOString() };
      if (editingTx) {
        await transactionApi.update(editingTx.id, payload);
        toast.success('Transaction updated');
      } else {
        await transactionApi.create(payload);
        toast.success('Transaction created');
      }
      setDialogOpen(false);
      refetch();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save';
      toast.error('Error', message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await transactionApi.delete(id);
      toast.success('Transaction deleted');
      refetch();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Transactions</h1>
            <p className="text-muted-foreground text-sm">Manage your income and expenses</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Add Transaction
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v === 'ALL' ? '' : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : !data?.transactions.length ? (
          <EmptyState
            icon={ArrowUpRight}
            title="No transactions yet"
            description="Start tracking your finances by adding your first transaction."
            actionLabel="Add Transaction"
            onAction={openCreate}
          />
        ) : (
          <>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {data.transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                        style={{ backgroundColor: `${tx.category.color}20`, color: tx.category.color }}
                      >
                        <CategoryIcon icon={tx.category.icon} className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{tx.description}</p>
                          <Badge variant={tx.type === 'INCOME' ? 'success' : 'secondary'} className="text-[10px]">
                            {tx.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {tx.category.name} · {formatDate(tx.date)}
                        </p>
                      </div>
                      <p className={cn('font-semibold', tx.type === 'INCOME' ? 'text-success' : 'text-foreground')}>
                        {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                      </p>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(tx)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tx.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={!data.pagination.hasPrev} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" disabled={!data.pagination.hasNext} onClick={() => setPage(page + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTx ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={txType} onValueChange={(v) => { setValue('type', v as 'INCOME' | 'EXPENSE'); setValue('categoryId', ''); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input {...register('description')} />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={watch('categoryId')} onValueChange={(v) => setValue('categoryId', v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((c: Category) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...register('date')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input {...register('notes')} />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {editingTx ? 'Update' : 'Create'} Transaction
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
