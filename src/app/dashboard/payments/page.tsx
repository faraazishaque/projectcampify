import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminPaymentsView } from '@/components/payments/admin-payments-view';
import { ParentPaymentsView } from '@/components/payments/parent-payments-view';
import type { Parent } from '@/lib/definitions';
import { CreditCard } from 'lucide-react';

export default async function PaymentsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const isParent = user?.role === 'Parent';
  const isAdmin = user?.role === 'Admin';

  const renderContent = () => {
    if (isAdmin) {
      return <AdminPaymentsView />;
    }
    if (isParent) {
      return <ParentPaymentsView user={user as Parent} />;
    }
    // Redirect other roles away
    redirect('/dashboard');
  };

  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            Payments
        </h1>
        <p className="text-muted-foreground">
            {isAdmin ? 'Track student fee payments and balances.' : 'View your payment status and history.'}
        </p>
      </div>
      {renderContent()}
    </div>
  );
}
