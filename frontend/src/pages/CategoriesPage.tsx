import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Tags, Trash2, Pencil } from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/common/EmptyState';
import { CategoryIcon, categoryColors } from '@/components/common/CategoryIcon';
import { useQuery } from '@/hooks/useQuery';
import { categoryApi } from '@/api';
import { toast } from '@/components/ui/toast';
import type { Category } from '@/types';

const schema = z.object({
  name: z.string().min(1),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string(),
  icon: z.string(),
});

type FormData = z.infer<typeof schema>;

export default function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [tab, setTab] = useState('EXPENSE');

  const { data: categories, loading, refetch } = useQuery(() => categoryApi.getAll(), []);

  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { color: '#6366f1', icon: 'circle', type: 'EXPENSE' },
  });

  const filtered = categories?.filter((c) => c.type === tab) || [];

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', type: tab as 'INCOME' | 'EXPENSE', color: '#6366f1', icon: 'circle' });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    reset({ name: cat.name, type: cat.type, color: cat.color, icon: cat.icon });
    setDialogOpen(true);
  };

  const onSubmit = async (formData: FormData) => {
    try {
      if (editing) {
        await categoryApi.update(editing.id, formData);
        toast.success('Category updated');
      } else {
        await categoryApi.create(formData);
        toast.success('Category created');
      }
      setDialogOpen(false);
      refetch();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast.error('Error', message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await categoryApi.delete(id);
      toast.success('Category deleted');
      refetch();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast.error('Error', message);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-muted-foreground text-sm">Organize your transactions</p>
          </div>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Category</Button>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="EXPENSE">Expenses</TabsTrigger>
            <TabsTrigger value="INCOME">Income</TabsTrigger>
          </TabsList>

          <TabsContent value={tab}>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
            ) : !filtered.length ? (
              <EmptyState icon={Tags} title="No categories" description="Create categories to organize your transactions." actionLabel="Add Category" onAction={openCreate} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {filtered.map((cat) => (
                  <Card key={cat.id} className="group hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                        <CategoryIcon icon={cat.icon} className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{cat.name}</p>
                        <Badge variant="outline" className="text-[10px] mt-1">{cat.type}</Badge>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Create'} Category</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...register('name')} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={watch('type')} onValueChange={(v) => setValue('type', v as 'INCOME' | 'EXPENSE')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {categoryColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ backgroundColor: color, borderColor: watch('color') === color ? '#000' : 'transparent' }}
                    onClick={() => setValue('color', color)}
                  />
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>{editing ? 'Update' : 'Create'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
