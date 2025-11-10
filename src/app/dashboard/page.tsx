import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { ParentDashboard } from '@/components/dashboard/parent-dashboard';
import { StudentDashboard } from '@/components/dashboard/student-dashboard';
import { TeacherDashboard } from '@/components/dashboard/teacher-dashboard';
import { getUser } from '@/lib/auth';
import { AppUser } from '@/lib/definitions';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const renderDashboard = (user: AppUser) => {
    switch (user.role) {
      case 'Admin':
        return <AdminDashboard user={user} />;
      case 'Teacher':
        return <TeacherDashboard user={user} />;
      case 'Student':
        return <StudentDashboard user={user} />;
      case 'Parent':
        return <ParentDashboard user={user} />;
      default:
        return <div>Invalid user role.</div>;
    }
  };

  return <>{renderDashboard(user)}</>;
}
