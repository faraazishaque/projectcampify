import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { CampifyLogo } from '@/components/icons';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
            <CampifyLogo className="h-12 w-12 text-primary" />
          <h1 className="font-headline mt-4 text-3xl font-bold tracking-tight">
            Forgot Your Password?
          </h1>
          <p className="mt-2 text-muted-foreground">
            No worries, it happens. Enter your email and we'll send you a reset link.
          </p>
        </div>
        <ForgotPasswordForm />
        <div className="text-center text-sm">
          Remembered your password?{' '}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
