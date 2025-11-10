'use client';

import type { Parent, Student, Course } from '@/lib/definitions';
import {
  users as allUsers,
  courses as allCourses,
  grades as allGrades,
  attendance as allAttendance,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { User } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AttendanceRecord {
  courseName: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
}

interface DashboardData {
  child: Student;
  gradeData: { name: string; value: number }[];
  recentAttendance: AttendanceRecord[];
}

export function ParentDashboard({ user }: { user: Parent }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedChildId, setSelectedChildId] = useState(user.childIds[0]);

  useEffect(() => {
    const child = allUsers.find((s) => s.id === selectedChildId) as
      | Student
      | undefined;

    if (!child) return;

    const childCourses = allCourses.filter((c) =>
      c.studentIds.includes(child.id)
    );
    const childGrades = allGrades.filter((g) => g.studentId === child.id);
    const childAttendance = allAttendance
      .filter((a) => a.studentId === child.id)
      .slice(0, 5);

    const gradeData = childCourses.map((course) => {
      const courseGrades = childGrades.filter((g) => g.courseId === course.id);
      const average =
        courseGrades.length > 0
          ? (courseGrades.reduce((acc, g) => acc + g.score / g.total, 0) /
              courseGrades.length) *
            100
          : 0;
      return { name: course.name, value: Math.round(average) };
    });

    const recentAttendance = childAttendance.map((att) => ({
      courseName:
        allCourses.find((c) => c.id === att.courseId)?.name || 'Unknown',
      date: new Date(att.date).toLocaleDateString(),
      status: att.status,
    }));

    setData({
      child,
      gradeData,
      recentAttendance,
    });
  }, [selectedChildId]);
  
  if (!user.childIds.length) {
     return (
        <Card>
            <CardHeader>
                <CardTitle>No Child Linked</CardTitle>
            </CardHeader>
            <CardContent>
                <p>There is no student linked to your parent account. Please contact administration.</p>
            </CardContent>
        </Card>
    );
  }

  if (!data) {
    return <div>Loading dashboard...</div>;
  }

  const { child, gradeData, recentAttendance } = data;

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold">
          Welcome, {user.name}
        </h1>
        {user.childIds.length > 1 && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedChildId}
              onValueChange={setSelectedChildId}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select child" />
              </SelectTrigger>
              <SelectContent>
                {user.childIds.map((id) => {
                  const student = allUsers.find((s) => s.id === id);
                  return student ? (
                    <SelectItem key={id} value={id}>
                      {student.name}
                    </SelectItem>
                  ) : null;
                })}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Viewing records for {child.name}
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Attendance Record</CardTitle>
            <CardDescription>
              A summary of {child.name.split(' ')[0]}&apos;s recent attendance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAttendance.map((att, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {att.courseName}
                    </TableCell>
                    <TableCell>{att.date}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          att.status === 'Absent'
                            ? 'destructive'
                            : att.status === 'Late'
                            ? 'secondary'
                            : 'default'
                        }
                      >
                        {att.status}
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
            <CardTitle>Performance Snapshot</CardTitle>
            <CardDescription>
              {child.name.split(' ')[0]}&apos;s average score across all
              courses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OverviewChart data={gradeData} usePercent={true} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
