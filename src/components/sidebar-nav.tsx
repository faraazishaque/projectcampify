'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Book,
  FileText,
  Settings,
  User,
  GraduationCap,
  ClipboardList,
  LifeBuoy,
  School,
  CreditCard,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/definitions';

type NavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
  roles: UserRole[];
};

const navItems: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['Admin', 'Teacher', 'Student', 'Parent'] },
  { href: '/dashboard/students', icon: GraduationCap, label: 'Students', roles: ['Admin', 'Teacher'] },
  { href: '/dashboard/teachers', icon: School, label: 'Teachers', roles: ['Admin'] },
  { href: '/dashboard/courses', icon: Book, label: 'Courses', roles: ['Admin', 'Teacher', 'Student'] },
  { href: '/dashboard/timetable', icon: Calendar, label: 'Timetable', roles: ['Student', 'Parent']},
  { href: '/dashboard/grades', icon: ClipboardList, label: 'Grades', roles: ['Student', 'Parent'] },
  { href: '/dashboard/payments', icon: CreditCard, label: 'Payments', roles: ['Admin', 'Parent'] },
  { href: '/dashboard/reports', icon: FileText, label: 'Reports', roles: ['Admin', 'Teacher', 'Parent'] },
  { href: '/dashboard/profile', icon: User, label: 'Profile', roles: ['Admin', 'Teacher', 'Student', 'Parent'] },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings', roles: ['Admin', 'Teacher', 'Student', 'Parent'] },
  { href: '/dashboard/help', icon: LifeBuoy, label: 'Help', roles: ['Admin', 'Teacher', 'Student', 'Parent'] },
];

export function SidebarNav({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname();

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {filteredNavItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-sidebar-primary-foreground hover:bg-sidebar-accent',
              isActive ? 'bg-sidebar-accent text-sidebar-primary-foreground' : 'text-sidebar-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
