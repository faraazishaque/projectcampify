import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ReportGenerator } from '@/components/dashboard/report-generator';
import { ParentReportViewer } from '@/components/dashboard/parent-report-viewer';
import type { Parent } from '@/lib/definitions';
import { FileText } from 'lucide-react';

export default async function ReportsPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }

  const isParent = user?.role === 'Parent';
  const canGenerate = user?.role === 'Admin' || user?.role === 'Teacher';

  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8" />
            {isParent ? 'Received Reports' : 'Generate & Share Reports'}
        </h1>
        <p className="text-muted-foreground">
            {isParent ? 'View reports and comments from teachers.' : 'AI-powered report generation for student performance and attendance.'}
        </p>
      </div>
      {isParent && <ParentReportViewer user={user as Parent} />}
      {canGenerate && <ReportGenerator user={user} />}
      {!isParent && !canGenerate && (
        <p>You do not have permission to view this page.</p>
      )}
    </div>
  );
}
