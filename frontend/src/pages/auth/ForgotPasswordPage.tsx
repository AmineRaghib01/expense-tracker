import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { authApi } from '@/api';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await authApi.forgotPassword(data.email);
      setSent(true);
      if (response.data.data.resetToken) {
        setResetToken(response.data.data.resetToken);
      }
      toast.success('Reset link sent', 'Check your email for instructions');
    } catch {
      toast.error('Failed to send reset link');
    }
  };

  return (
    <AuthLayout>
      <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to login
      </Link>

      <h1 className="text-2xl font-bold mb-1">Forgot password?</h1>
      <p className="text-muted-foreground mb-8">
        Enter your email and we'll send you a reset link
      </p>

      {sent ? (
        <div className="rounded-lg bg-success/10 border border-success/30 p-4 text-sm">
          <p className="font-medium text-success">Reset link sent!</p>
          <p className="text-muted-foreground mt-1">Check your email for instructions.</p>
          {resetToken && (
            <Link
              to={`/reset-password?token=${resetToken}`}
              className="text-primary text-xs mt-2 inline-block hover:underline"
            >
              Dev: Click here to reset password
            </Link>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@company.com" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
