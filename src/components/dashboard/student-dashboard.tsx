'use client';

import { useRef, useState, useEffect } from 'react';
import type { Student, Course, Grade, Assignment } from '@/lib/definitions';
import {
  courses as allCourses,
  grades as allGrades,
  assignments as allAssignments,
} from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { OverviewChart } from './overview-chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { FileUp, BookOpen, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';

interface MockData {
  studentCourses: Course[];
  studentGrades: Grade[];
  recentAssignments: Assignment[];
  gradeData: { name: string; value: number }[];
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>
       <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Enrolled Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-4 w-48 mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assignments Due
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <Skeleton className="h-8 w-12" />
            <Skeleton className="h-4 w-32 mt-1" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Performance Snapshot</CardTitle>
            <CardDescription className="text-xs">
              <Skeleton className="h-4 w-40" />
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-0">
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
      </div>
       <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-4">
           <CardHeader>
            <CardTitle>My Grades</CardTitle>
            <CardDescription><Skeleton className="h-4 w-64" /></CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
             </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
           <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription><Skeleton className="h-4 w-48" /></CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export function StudentDashboard({ user }: { user: Student }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mockData, setMockData] = useState<MockData | null>(null);

  useEffect(() => {
    // Generate data on the client side to avoid hydration mismatch
    const studentCourses = allCourses.filter((c) =>
      c.studentIds.includes(user.id)
    );
    const studentGrades = allGrades.filter((g) => g.studentId === user.id);
    const recentAssignments = allAssignments
      .filter((a) => a.studentId === user.id)
      .slice(0, 5);

    const gradeData = studentCourses.map((course) => {
      const courseGrades = studentGrades.filter(
        (g) => g.courseId === course.id
      );
      const average =
        courseGrades.length > 0
          ? (courseGrades.reduce((acc, g) => acc + g.score / g.total, 0) /
              courseGrades.length) *
            100
          : 0;
      return { name: course.name, value: Math.round(average) };
    });

    setMockData({
      studentCourses,
      studentGrades,
      recentAssignments,
      gradeData,
    });
  }, [user.id]);

  const getGradeColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-blue-100 text-blue-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Selected file:', file.name);
      // In a real app, you would handle the file upload here.
    }
  };

  if (!mockData) {
    return <DashboardSkeleton />;
  }

  const { studentCourses, studentGrades, recentAssignments, gradeData } =
    mockData;

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold">
          Hi, {user.name.split(' ')[0]}!
        </h1>
        <Button onClick={handleUploadClick}>
          <FileUp className="mr-2 h-4 w-4" /> Upload Assignment
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Enrolled Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              Your active courses this semester
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assignments Due
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">In the next 7 days</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Performance Snapshot</CardTitle>
            <CardDescription className="text-xs">
              Your average score across all courses.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-0">
            <OverviewChart data={gradeData} usePercent={true} />
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>My Grades</CardTitle>
            <CardDescription>
              A quick look at your recent performance.{' '}
              <Link href="/dashboard/grades" className="text-primary underline">
                View all
              </Link>
              .
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentGrades.slice(0, 8).map((grade, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {allCourses.find((c) => c.id === grade.courseId)?.name}
                    </TableCell>
                    <TableCell>{grade.assignment}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>
              Your recently uploaded assignments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">File</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      {
                        allCourses.find((c) => c.id === assignment.courseId)
                          ?.name
                      }
                    </TableCell>
                    <TableCell>
                      {new Date(assignment.submittedAt!).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <a
                        href={assignment.fileUrl}
                        className="text-primary underline"
                      >
                        Download
                      </a>
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
