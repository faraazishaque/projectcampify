'use client';

import type { Teacher, AppUser, Course } from '@/lib/definitions';
import {
  courses as allCourses,
  users as allUsers,
  grades as allGrades,
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
import { useState, useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';


interface DashboardData {
  teacherCourses: Course[];
  chartData: { name: string; value: number }[];
}

function TeacherDashboardSkeleton() {
  return (
     <div className="flex flex-col gap-4 md:gap-8">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Your Courses</CardTitle>
            <CardDescription>
              A list of courses you are teaching this semester.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
             </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Student Performance Overview</CardTitle>
            <CardDescription>
              Grade distribution across all your courses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function TeacherDashboard({ user }: { user: Teacher }) {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const teacherCourses = allCourses.filter((c) => c.teacherId === user.id);
    const courseGrades = allGrades.filter((g) =>
      teacherCourses.some((c) => c.id === g.courseId)
    );

    const gradeDistribution = courseGrades.reduce(
      (acc, grade) => {
        const percentage = (grade.score / grade.total) * 100;
        if (percentage >= 90) acc.A++;
        else if (percentage >= 80) acc.B++;
        else if (percentage >= 70) acc.C++;
        else if (percentage >= 60) acc.D++;
        else acc.F++;
        return acc;
      },
      { A: 0, B: 0, C: 0, D: 0, F: 0 }
    );

    const chartData = [
      { name: 'A', value: gradeDistribution.A },
      { name: 'B', value: gradeDistribution.B },
      { name: 'C', value: gradeDistribution.C },
      { name: 'D', value: gradeDistribution.D },
      { name: 'F', value: gradeDistribution.F },
    ];

    setData({ teacherCourses, chartData });
  }, [user.id]);
  
  if (!data) {
    return <TeacherDashboardSkeleton />;
  }

  const { teacherCourses, chartData } = data;

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <h1 className="font-headline text-2xl font-bold">Welcome, {user.name}</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Your Courses</CardTitle>
            <CardDescription>
              A list of courses you are teaching this semester.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Students Enrolled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacherCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell>{course.studentIds.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Student Performance Overview</CardTitle>
            <CardDescription>
              Grade distribution across all your courses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OverviewChart data={chartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
