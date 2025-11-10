'use client';

import { getAuthenticatedUser } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { courses, grades as allGrades, users } from '@/lib/data';
import type { Student, Parent, AppUser } from '@/lib/definitions';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function getGradeColor(score: number, total: number) {
  const percentage = (score / total) * 100;
  if (percentage >= 90) return 'bg-green-100 text-green-800';
  if (percentage >= 80) return 'bg-blue-100 text-blue-800';
  if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
  if (percentage >= 60) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}

function Gradebook({ student }: { student: Student }) {
  const [studentGrades, setStudentGrades] = useState<typeof allGrades>([]);
  const [studentCourses, setStudentCourses] = useState<typeof courses>([]);

  useEffect(() => {
    setStudentGrades(allGrades.filter((g) => g.studentId === student.id));
    setStudentCourses(courses.filter((c) => c.studentIds.includes(student.id)));
  }, [student.id]);

  return (
    <div className="grid gap-6">
      {studentCourses.map((course) => {
        const courseGrades = studentGrades.filter(
          (g) => g.courseId === course.id
        );
        const courseTeacher = users.find((u) => u.id === course.teacherId);

        let finalGrade = 0;
        if (courseGrades.length > 0) {
          const totalScore = courseGrades.reduce((acc, g) => acc + g.score, 0);
          const totalPossible = courseGrades.reduce(
            (acc, g) => acc + g.total,
            0
          );
          if (totalPossible > 0) {
            finalGrade = (totalScore / totalPossible) * 100;
          }
        }

        return (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>{course.name}</CardTitle>
                  <CardDescription>
                    Taught by {courseTeacher?.name || 'N/A'}
                  </CardDescription>
                </div>
                <div className="mt-2 sm:mt-0">
                  <span className="text-sm text-muted-foreground">
                    Final Grade:{' '}
                  </span>
                  <Badge
                    className={cn(
                      'text-base font-bold',
                      getGradeColor(finalGrade, 100)
                    )}
                  >
                    {finalGrade.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseGrades.length > 0 ? (
                    courseGrades.map((grade, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {grade.assignment}
                        </TableCell>
                        <TableCell>{grade.date}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={cn(
                              'font-semibold',
                              getGradeColor(grade.score, grade.total)
                            )}
                          >
                            {grade.score}/{grade.total}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No grades recorded for this course yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ParentGradeView({ user }: { user: Parent }) {
  // For demo, we'll just show the first child's grades. A real app would have a selector.
  const childId = user.childIds[0];
  const [child, setChild] = useState<Student | undefined>(undefined);

  useEffect(() => {
    setChild(users.find((u) => u.id === childId) as Student | undefined);
  }, [childId]);


  if (!child) {
    return <p>No student linked to this account.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Viewing Grades for {child.name}
      </h2>
      <Gradebook student={child} />
    </div>
  );
}

function GradesPageSkeleton() {
  return (
    <div className="grid gap-6">
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32 mt-2" />
              </div>
              <div className="mt-2 sm:mt-0">
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function GradesPage() {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getAuthenticatedUser();
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [router]);
  
  const child = user?.role === 'Parent' ? users.find(u => u.id === (user as Parent).childIds[0]) as Student | undefined : null;


  const renderGrades = (user: AppUser) => {
    switch (user.role) {
      case 'Student':
        return <Gradebook student={user as Student} />;
      case 'Parent':
        return <ParentGradeView user={user as Parent} />;
      default:
        // Admins and Teachers shouldn't access this page directly via nav, but handle the case
        return <p>You do not have permission to view this page.</p>;
    }
  };
  
  const pageTitle = () => {
    if (user?.role === 'Parent' && child) {
        return `${child.name}'s Grade`;
    }
    if (user?.role === 'Student') {
        return 'My Grades';
    }
    return 'Grades';
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {isLoading ? <Skeleton className="h-9 w-48" /> : pageTitle()}
        </h1>
        <p className="text-muted-foreground">
          A detailed overview of academic performance.
        </p>
      </div>
      {isLoading ? <GradesPageSkeleton /> : user ? renderGrades(user) : null}
    </div>
  );
}
