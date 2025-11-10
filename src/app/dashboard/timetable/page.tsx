import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TimetableClientPage } from '@/components/dashboard/timetable-client-page';
import { Calendar } from 'lucide-react';
import type { Parent } from '@/lib/definitions';

export default async function TimetablePage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'Admin' || user.role === 'Teacher') {
    // Or show a message that this page is for students/parents
    redirect('/dashboard');
  }
  
  const studentId = user.role === 'Parent' ? (user as Parent).childIds[0] : user.id;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Weekly Timetable
        </h1>
        <p className="text-muted-foreground">
          Your class schedule for the week.
        </p>
      </div>
      <TimetableClientPage studentId={studentId} userRole={user.role} />
    </div>
  );
}
