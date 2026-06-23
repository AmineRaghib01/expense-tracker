import { Wallet, TrendingUp, PieChart, Sparkles } from 'lucide-react';
import { APP_NAME, APP_DESCRIPTION, APP_TAGLINE } from '@/constants/app';

const features = [
  {
    icon: TrendingUp,
    title: 'Expense Tracking',
    description: 'Record and categorize every income and expense in one place.',
  },
  {
    icon: PieChart,
    title: 'Budget Management',
    description: 'Set monthly budgets and monitor spending against your goals.',
  },
  {
    icon: Sparkles,
    title: 'AI Insights',
    description: 'Receive personalized analysis and recommendations for your finances.',
  },
  {
    icon: Wallet,
    title: 'Reports & Exports',
    description: 'Generate monthly, quarterly, and annual reports in PDF or Excel.',
  },
];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-sidebar">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-500/20" />
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-sidebar-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary">
              <Wallet className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight">{APP_NAME}</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">{APP_TAGLINE}</h2>
          <p className="text-lg text-sidebar-foreground/70 max-w-md leading-relaxed">
            {APP_DESCRIPTION}
          </p>
          <div className="mt-12 grid grid-cols-1 gap-4 max-w-md">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 rounded-xl bg-sidebar-muted/50 p-4 backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-xs text-sidebar-foreground/60 mt-0.5 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md animate-slide-up">{children}</div>
      </div>
    </div>
  );
}
