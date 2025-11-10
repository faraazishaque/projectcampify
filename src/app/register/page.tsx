import Link from 'next/link';
import { RegisterForm } from '@/components/auth/register-form';
import { CampifyLogo } from '@/components/icons';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
    const user = await getUser();
    if (user) {
        redirect('/dashboard');
    }

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-background">
            <div className="mx-auto grid w-[400px] gap-6">
                <div className="grid gap-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <CampifyLogo className="h-8 w-8 text-primary" />
                        <h1 className="font-headline text-3xl font-bold">Create an Account</h1>
                    </div>
                    <p className="text-balance text-muted-foreground">
                       Enter your information to create a new Student or Parent account.
                    </p>
                </div>
                <RegisterForm />
                <div className="mt-4 text-center text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="underline">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
}
