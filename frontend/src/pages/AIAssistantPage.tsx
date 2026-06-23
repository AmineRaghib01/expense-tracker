import { Sparkles, RefreshCw, Brain, TrendingUp, Lightbulb, AlertTriangle, Target } from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { useQuery } from '@/hooks/useQuery';
import { aiApi } from '@/api';
import { toast } from '@/components/ui/toast';
import { useState } from 'react';
import type { AIInsight } from '@/types';

const typeIcons: Record<string, typeof Sparkles> = {
  spending_analysis: TrendingUp,
  health_analysis: Brain,
  cost_saving: Lightbulb,
  anomaly_detection: AlertTriangle,
  monthly_summary: Sparkles,
  recommendation: Target,
  budget_recommendation: Target,
  forecast: TrendingUp,
  general: Sparkles,
};

const typeColors: Record<string, string> = {
  spending_analysis: 'border-blue-500/30 bg-blue-500/5',
  health_analysis: 'border-emerald-500/30 bg-emerald-500/5',
  cost_saving: 'border-amber-500/30 bg-amber-500/5',
  anomaly_detection: 'border-red-500/30 bg-red-500/5',
  monthly_summary: 'border-purple-500/30 bg-purple-500/5',
  recommendation: 'border-indigo-500/30 bg-indigo-500/5',
  budget_recommendation: 'border-orange-500/30 bg-orange-500/5',
  forecast: 'border-cyan-500/30 bg-cyan-500/5',
};

function InsightCard({ insight }: { insight: AIInsight }) {
  const Icon = typeIcons[insight.type] || Sparkles;
  const colorClass = typeColors[insight.type] || 'border-border bg-muted/30';

  return (
    <Card className={`${colorClass} transition-all hover:shadow-md`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">{insight.title}</h3>
              <Badge variant="outline" className="text-[10px]">{insight.type.replace(/_/g, ' ')}</Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{insight.content}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-2">
              {new Date(insight.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AIAssistantPage() {
  const [generating, setGenerating] = useState(false);
  const { data: insights, loading, error, refetch } = useQuery(() => aiApi.getInsights(), []);
  const { data: health } = useQuery(() => aiApi.getFinancialHealth(), []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await aiApi.generateInsights();
      toast.success('New insights generated!');
      refetch();
    } catch {
      toast.error('Failed to generate insights');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">AI Financial Assistant</h1>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Intelligent insights powered by AI analysis
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={generating}>
            <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
            Generate Insights
          </Button>
        </div>

        {health && (
          <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-emerald-500" />
                Financial Health Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">{health.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{health.content}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <div className="space-y-4">
            {insights?.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
            {!insights?.length && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No insights yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click "Generate Insights" to analyze your financial data
                  </p>
                  <Button onClick={handleGenerate} disabled={generating}>Generate Insights</Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
