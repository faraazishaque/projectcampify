'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { users, payments } from '@/lib/data';
import type { Payment, Student } from '@/lib/definitions';
import { FileText } from 'lucide-react';

type PaymentWithStudent = Payment & { studentName: string };

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const generateReport = (student: PaymentWithStudent) => {
  const status = student.status;
  let report = `Fee ${status} Report - ${new Date().toLocaleDateString()}\n`;
  report += '===================================================\n\n';
  report += `Student: ${student.studentName}\n`;
  report += `Student ID: ${student.studentId}\n`;
  report += `Amount Due: ${formatCurrency(student.amountDue)}\n`;
  report += `Amount Paid: ${formatCurrency(student.amountPaid)}\n`;
  report += `Balance: ${formatCurrency(
    student.amountDue - student.amountPaid
  )}\n`;
  report += `Status: ${student.status}\n`;
  report += `Due Date: ${new Date(student.dueDate).toLocaleDateString()}\n`;
  report += '---------------------------------------------------\n\n';
  report += `Dear Parent/Guardian of ${student.studentName},\n\n`;
  if (status === 'Overdue') {
    report += `This is a formal notice regarding an overdue fee balance for the current semester. Our records indicate that there is a remaining balance of ${formatCurrency(
      student.amountDue - student.amountPaid
    )} which is past the due date.\n\n`;
  } else {
    report += `This is a friendly reminder regarding the outstanding fee balance for the current semester. Our records indicate that there is a remaining balance of ${formatCurrency(
      student.amountDue - student.amountPaid
    )}.\n\n`;
  }
  report += `Please log in to the parent portal to settle the outstanding amount at your earliest convenience. If you believe this is an error or wish to discuss a payment plan, please contact the administration office.\n\n`;
  report += `Thank you for your prompt attention to this matter.\n\n`;
  report += `Sincerely,\nCampify Administration\n\n`;
  report += '===================================================\n\n';

  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `fee_${student.studentName.replace(
    / /g,
    '_'
  )}_${status.toLowerCase()}_report.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export function AdminPaymentsView() {
  const paymentData = useMemo(() => {
    const studentMap = new Map(
      (users.filter((u) => u.role === 'Student') as Student[]).map((s) => [
        s.id,
        s.name,
      ])
    );
    return payments.map((p) => ({
      ...p,
      studentName: studentMap.get(p.studentId) || 'Unknown Student',
    }));
  }, []);
  
  const pendingData = paymentData.filter(d => d.status === 'Pending');
  const overdueData = paymentData.filter(d => d.status === 'Overdue');
  const paidData = paymentData.filter(d => d.status === 'Paid');


  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Fee Status</CardTitle>
        <CardDescription>
          Overview of fee payments for the current semester.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="pending" className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingData.length > 0 ? (
                  pendingData.map((payment) => {
                    const balance = payment.amountDue - payment.amountPaid;
                    const progress = (payment.amountPaid / payment.amountDue) * 100;
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.studentName}
                        </TableCell>
                        <TableCell>{formatCurrency(payment.amountDue)}</TableCell>
                        <TableCell>{formatCurrency(payment.amountPaid)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="w-24" />
                            <span className="text-xs text-muted-foreground">
                              {Math.round(progress)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(balance)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateReport(payment)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Report
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center"
                    >
                      No students found with this payment status.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="overdue" className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueData.length > 0 ? (
                  overdueData.map((payment) => {
                    const balance = payment.amountDue - payment.amountPaid;
                    const progress = (payment.amountPaid / payment.amountDue) * 100;
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.studentName}
                        </TableCell>
                        <TableCell>{formatCurrency(payment.amountDue)}</TableCell>
                        <TableCell>{formatCurrency(payment.amountPaid)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="w-24" />
                            <span className="text-xs text-muted-foreground">
                              {Math.round(progress)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(balance)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateReport(payment)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Report
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center"
                    >
                      No students found with this payment status.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="paid" className="pt-4">
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paidData.length > 0 ? (
                  paidData.map((payment) => {
                    const balance = payment.amountDue - payment.amountPaid;
                    const progress = (payment.amountPaid / payment.amountDue) * 100;
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.studentName}
                        </TableCell>
                        <TableCell>{formatCurrency(payment.amountDue)}</TableCell>
                        <TableCell>{formatCurrency(payment.amountPaid)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="w-24" />
                            <span className="text-xs text-muted-foreground">
                              {Math.round(progress)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(balance)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center"
                    >
                      No students found with this payment status.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
