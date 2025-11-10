'use client';

import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  users,
  courses as allCourses,
  grades as allGrades,
  attendance as allAttendance,
} from '@/lib/data';
import type { Student, Course, Grade, Attendance } from '@/lib/definitions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { generateStudentSummary } from '@/ai/flows/generate-student-summary';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const getInitials = (name: string) => {
  const names = name.split(' ');
  return names.length > 1
    ? `${names[0][0]}${names[names.length - 1][0]}`
    : name.substring(0, 2);
};

const getGradeColor = (score: number, total: number) => {
  const percentage = (score / total) * 100;
  if (percentage >= 90) return 'bg-green-100 text-green-800';
  if (percentage >= 80) return 'bg-blue-100 text-blue-800';
  if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
  if (percentage >= 60) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

interface ProfileData {
  student: Student;
  parentName: string;
  courses: (Course & { averageGrade: number })[];
  recentGrades: (Grade & { courseName: string })[];
  attendanceSummary: {
    absences: number;
    lates: number;
    totalDays: number;
  };
}

function StudentProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-24" />
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="grid gap-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </CardHeader>
      </Card>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

export default function StudentProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();

  const [data, setData] = useState<ProfileData | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof id !== 'string') return;

    const student = users.find(
      (u) => u.id === id && u.role === 'Student'
    ) as Student | undefined;
    if (!student) {
      router.push('/dashboard/students');
      return;
    }

    const parent = users.find((u) => u.id === student.parentId);
    const studentCourses = allCourses.filter((c) =>
      c.studentIds.includes(student.id)
    );
    const studentGrades = allGrades.filter((g) => g.studentId === student.id);
    const studentAttendance = allAttendance.filter(
      (a) => a.studentId === student.id
    );

    const coursesWithAvgGrade = studentCourses.map((course) => {
      const courseGrades = studentGrades.filter(
        (g) => g.courseId === course.id
      );
      const average =
        courseGrades.length > 0
          ? (courseGrades.reduce((acc, g) => acc + g.score / g.total, 0) /
              courseGrades.length) *
            100
          : 0;
      return { ...course, averageGrade: average };
    });

    const recentGrades = studentGrades.slice(0, 5).map((g) => ({
      ...g,
      courseName:
        studentCourses.find((c) => c.id === g.courseId)?.name || 'N/A',
    }));

    const attendanceSummary = {
      absences: studentAttendance.filter((a) => a.status === 'Absent').length,
      lates: studentAttendance.filter((a) => a.status === 'Late').length,
      totalDays: studentAttendance.length / studentCourses.length, // Approx.
    };

    setData({
      student,
      parentName: parent?.name || 'N/A',
      courses: coursesWithAvgGrade,
      recentGrades,
      attendanceSummary,
    });
  }, [id, router]);

  const handleGenerateSummary = () => {
    if (!data) return;

    startTransition(async () => {
      setAiSummary(null);
      try {
        const result = await generateStudentSummary({
          studentName: data.student.name,
          courses: data.courses.map((c) => ({
            name: c.name,
            averageGrade: Math.round(c.averageGrade),
          })),
          attendance: data.attendanceSummary,
        });
        setAiSummary(result.summary);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to generate AI summary. Please try again.',
        });
      }
    });
  };

  if (!data) {
    return <StudentProfileSkeleton />;
  }

  const { student, parentName, courses, recentGrades, attendanceSummary } =
    data;

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Roster
      </Button>
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <Avatar className="h-24 w-24 border">
              <AvatarImage src={student.avatarUrl} alt={student.name} />
              <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1 text-center sm:text-left">
              <h1 className="font-headline text-3xl font-bold">
                {student.name}
              </h1>
              <p className="text-muted-foreground">{student.email}</p>
              <p className="text-sm">Parent/Guardian: {parentName}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>AI Performance Summary</CardTitle>
            <CardDescription>
              An AI-generated overview of this student.
            </CardDescription>
          </div>
          <Button onClick={handleGenerateSummary} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bot className="mr-2 h-4 w-4" />
            )}
            {isPending ? 'Generating...' : 'Generate Summary'}
          </Button>
        </CardHeader>
        {(isPending || aiSummary) && (
          <CardContent>
            {isPending && <Skeleton className="h-20 w-full" />}
            {aiSummary && (
              <div className="rounded-md border bg-muted p-4 text-sm">
                <p>{aiSummary}</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Overall Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {(
                courses.reduce((acc, c) => acc + c.averageGrade, 0) /
                courses.length
              ).toFixed(1)}
              %
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Absences</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{attendanceSummary.absences}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Lates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{attendanceSummary.lates}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Course Performance</CardTitle>
                <CardDescription>Average grade for each enrolled course.</CardDescription>
            </CardHeader>
            <CardContent>
                <OverviewChart usePercent data={courses.map(c => ({name: c.name, value: Math.round(c.averageGrade)}))} />
            </CardContent>
        </Card>
         <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Recent Grades</CardTitle>
                <CardDescription>The last few graded assignments.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentGrades.map((g, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <div className="font-medium">{g.courseName}</div>
                                    <div className="text-xs text-muted-foreground">{g.assignment}</div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="outline" className={getGradeColor(g.score, g.total)}>{g.score}/{g.total}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
