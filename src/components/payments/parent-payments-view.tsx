'use client';

import { useState, useMemo, useTransition } from 'react';
import type { Parent, Payment, Student } from '@/lib/definitions';
import { users, payments } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, QrCode, Wallet } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Separator } from '../ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import Image from 'next/image';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export function ParentPaymentsView({ user }: { user: Parent }) {
  const [isProcessing, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // For demo purposes, we'll just use the first child. A real app might have a selector.
  const childId = user.childIds[0];

  const paymentDetails = useMemo(() => {
    if (!childId) return null;
    const student = users.find(u => u.id === childId) as Student | undefined;
    const payment = payments.find(p => p.studentId === childId);
    if (!student || !payment) return null;
    return { student, payment };
  }, [childId]);

  const handlePayNow = () => {
    startTransition(() => {
        // Simulate a payment processing delay
        setTimeout(() => {
            toast({
                title: 'Payment Successful!',
                description: `Thank you. Your payment of ${formatCurrency(paymentDetails!.payment.amountDue - paymentDetails!.payment.amountPaid)} has been processed.`,
            });
            // In a real app, you would update the payment status here.
            // For the demo, we won't mutate the mock data.
            setIsDialogOpen(false);
        }, 2000);
    });
  }

  if (!paymentDetails) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>
            No student or payment information could be found for your account.
            Please contact administration.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { student, payment } = paymentDetails;
  const balance = payment.amountDue - payment.amountPaid;
  const isPaid = payment.status === 'Paid';

  const getStatusBadge = (status: Payment['status']) => {
    switch (status) {
      case 'Paid':
        return <Badge variant="default" className="bg-green-500">Paid</Badge>;
      case 'Pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'Overdue':
        return <Badge variant="destructive">Overdue</Badge>;
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Fee Statement</CardTitle>
                <CardDescription>
                For {student.name} - {payment.semester}
                </CardDescription>
            </div>
            {getStatusBadge(payment.status)}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Semester Fee</span>
            <span className="font-medium">{formatCurrency(payment.amountDue)}</span>
        </div>
         <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="font-medium">{formatCurrency(payment.amountPaid)}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between font-semibold text-base">
            <span>Balance Due</span>
            <span>{formatCurrency(balance)}</span>
        </div>
        <div className="text-xs text-muted-foreground text-center">
            Payment is due by {new Date(payment.dueDate).toLocaleDateString()}.
        </div>
      </CardContent>
      <CardFooter>
        {!isPaid && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
               <Button className="w-full">
                  Pay Balance ({formatCurrency(balance)})
               </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Complete Your Payment
                </DialogTitle>
                <DialogDescription>
                  Choose your preferred UPI payment method.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-6 py-4">
                <div className="rounded-lg border p-4">
                   <Image 
                     src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=campify@okhdfcbank&pn=Campify&am=${balance}&cu=INR`}
                     alt="UPI QR Code"
                     width={150}
                     height={150}
                     data-ai-hint="qr code"
                   />
                </div>
                 <div className="relative w-full">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-2 text-sm text-muted-foreground">OR</span>
                 </div>
                 <div className="grid w-full gap-2">
                    <Label htmlFor="upi-id">Enter UPI ID</Label>
                    <Input id="upi-id" placeholder="your-name@upi" />
                 </div>
              </div>
              <DialogFooter>
                 <DialogClose asChild>
                    <Button type="button" variant="secondary" disabled={isProcessing}>
                      Cancel
                    </Button>
                  </DialogClose>
                 <Button onClick={handlePayNow} disabled={isProcessing}>
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        `Pay Securely (${formatCurrency(balance)})`
                    )}
                 </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
         {isPaid && (
             <p className="text-sm text-green-600 font-medium text-center w-full">✨ Your account is fully paid up. Thank you! ✨</p>
        )}
      </CardFooter>
    </Card>

    <Card>
        <CardHeader>
            <CardTitle>Fee Reports</CardTitle>
            <CardDescription>Official notices regarding your account balance.</CardDescription>
        </CardHeader>
        <CardContent>
            {payment.status === 'Overdue' ? (
                <Alert variant="destructive">
                    <AlertTitle>Urgent: Account Overdue</AlertTitle>
                    <AlertDescription>
                        Your account balance for student {student.name} (ID: {student.id}) of {formatCurrency(balance)} is past the due date. Please make a payment as soon as possible to avoid any disruption to services.
                    </AlertDescription>
                </Alert>
            ) : (
                <div className="text-center text-muted-foreground p-8">
                    No urgent reports at this time.
                </div>
            )}
        </CardContent>
    </Card>
    </div>
  );
}
