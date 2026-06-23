import type { LucideIcon } from 'lucide-react';
import { cn, formatCurrency } from '@/utils/cn';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: number;
  currency?: string;
  variant?: 'default' | 'success' | 'danger' | 'primary';
  className?: string;
}

const variantStyles = {
  default: 'from-slate-500/10 to-slate-500/5 border-slate-200 dark:border-slate-800',
  success: 'from-emerald-500/10 to-emerald-500/5 border-emerald-200 dark:border-emerald-900',
  danger: 'from-red-500/10 to-red-500/5 border-red-200 dark:border-red-900',
  primary: 'from-blue-500/10 to-blue-500/5 border-blue-200 dark:border-blue-900',
};

const iconStyles = {
  default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
  danger: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400',
  primary: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  currency = 'USD',
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border bg-gradient-to-br p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-fade-in',
        variantStyles[variant],
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{formatCurrency(value, currency)}</p>
          {trend !== undefined && (
            <p
              className={cn(
                'text-xs font-medium',
                trend >= 0 ? 'text-success' : 'text-destructive',
              )}
            >
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% vs last month
            </p>
          )}
        </div>
        <div className={cn('rounded-xl p-3', iconStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
