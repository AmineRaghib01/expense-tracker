import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { useQuery } from '@/hooks/useQuery';
import { notificationApi } from '@/api';
import { toast } from '@/components/ui/toast';
import { cn } from '@/utils/cn';

export default function NotificationsPage() {
  const { data: notifications, loading, refetch } = useQuery(() => notificationApi.getAll(), []);

  const markAsRead = async (id: string) => {
    await notificationApi.markAsRead(id);
    refetch();
  };

  const markAllRead = async () => {
    await notificationApi.markAllAsRead();
    toast.success('All notifications marked as read');
    refetch();
  };

  const handleDelete = async (id: string) => {
    await notificationApi.delete(id);
    refetch();
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground text-sm">Stay updated on your finances</p>
          </div>
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4 mr-2" /> Mark all read
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : !notifications?.length ? (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <Card key={n.id} className={cn(!n.isRead && 'border-primary/30 bg-primary/5')}>
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{n.title}</p>
                      {!n.isRead && <Badge variant="default" className="text-[10px]">New</Badge>}
                      <Badge variant="outline" className="text-[10px]">{n.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {!n.isRead && (
                      <Button variant="ghost" size="icon" onClick={() => markAsRead(n.id)}>
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(n.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
