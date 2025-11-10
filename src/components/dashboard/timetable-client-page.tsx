'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { courses as allCourses, timetables as allTimetables, users as allUsers } from '@/lib/data';
import type { Timetable, Course, TimetableSlot, UserRole, Parent, Student } from '@/lib/definitions';
import { Skeleton } from '../ui/skeleton';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { User, Coffee, Utensils } from 'lucide-react';

const timeSlots = ['09:00 - 10:30', '10:45 - 12:15', '12:15 - 13:30', '13:30 - 15:00', '15:00 - 15:15', '15:15 - 16:45'] as const;
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

function TimetableSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Day</TableHead>
                            {timeSlots.map(time => <TableHead key={time}>{time}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {days.map(day => (
                            <TableRow key={day}>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                {timeSlots.map(time => (
                                    <TableCell key={time}><Skeleton className="h-16 w-full" /></TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}


export function TimetableClientPage({ studentId, userRole }: { studentId: string, userRole: UserRole }) {
  const [currentStudentId, setCurrentStudentId] = useState(studentId);
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const parent = useMemo(() => {
    if (userRole === 'Parent') {
      return allUsers.find(u => u.role === 'Parent' && (u as Parent).childIds.includes(studentId)) as Parent | undefined;
    }
    return undefined;
  }, [userRole, studentId]);

  useEffect(() => {
    setIsLoading(true);
    const foundTimetable = allTimetables.find(t => t.studentId === currentStudentId) || null;
    setTimetable(foundTimetable);
    setIsLoading(false);
  }, [currentStudentId]);

  const schedule: Record<string, Record<string, TimetableSlot & { courseName: string }>> = useMemo(() => {
    const grid: Record<string, Record<string, TimetableSlot & { courseName: string }>> = {};
    if (timetable) {
      for (const slot of timetable.slots) {
        if (!grid[slot.day]) {
          grid[slot.day] = {};
        }
        const course = allCourses.find(c => c.id === slot.courseId);
        grid[slot.day][slot.time] = { ...slot, courseName: course?.name || 'Unknown Course' };
      }
    }
    return grid;
  }, [timetable]);

  const studentName = allUsers.find(u => u.id === currentStudentId)?.name || 'the student';
  
  const renderSlot = (day: typeof days[number], time: typeof timeSlots[number]) => {
    if (time === '12:15 - 13:30') {
      return (
        <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-md h-full flex flex-col justify-center items-center text-green-700 dark:text-green-300">
          <Utensils className="h-5 w-5 mb-1" />
          <p className="font-bold text-sm">Lunch Break</p>
        </div>
      );
    }
    if (time === '15:00 - 15:15') {
       return (
        <div className="bg-amber-50 dark:bg-amber-900/30 p-2 rounded-md h-full flex flex-col justify-center items-center text-amber-700 dark:text-amber-300">
          <Coffee className="h-5 w-5 mb-1" />
          <p className="font-bold text-sm">Tea Break</p>
        </div>
      );
    }
    
    const slotData = schedule[day]?.[time];
    if (slotData) {
        return (
            <div className="bg-muted p-2 rounded-md h-full flex flex-col justify-start">
              <p className="font-bold text-sm text-primary">{slotData.courseName}</p>
              <p className="text-xs text-muted-foreground">
                {allCourses.find(c => c.id === slotData.courseId)?.teacherId ? 
                allUsers.find(u => u.id === allCourses.find(c => c.id === slotData.courseId)?.teacherId)?.name : 'N/A'}
              </p>
            </div>
        );
    }
    return <div className="h-full"></div>;
  };

  return (
    <div className="space-y-6">
      {parent && parent.childIds.length > 1 && (
        <div className="flex items-center gap-2 max-w-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <Select value={currentStudentId} onValueChange={setCurrentStudentId}>
                <SelectTrigger>
                    <SelectValue placeholder="Select child" />
                </SelectTrigger>
                <SelectContent>
                    {parent.childIds.map(id => {
                        const student = allUsers.find(u => u.id === id) as Student;
                        return <SelectItem key={id} value={id}>{student.name}</SelectItem>
                    })}
                </SelectContent>
            </Select>
        </div>
      )}

      {isLoading ? <TimetableSkeleton /> : (
        <Card>
          <CardHeader>
            <CardTitle>Schedule for {studentName}</CardTitle>
            <CardDescription>
              This is the weekly class schedule. Click on a course for more details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px] font-semibold">Day</TableHead>
                  {timeSlots.map(time => <TableHead key={time} className="font-semibold">{time}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {days.map(day => (
                  <TableRow key={day}>
                    <TableCell className="font-medium text-muted-foreground">{day}</TableCell>
                    {timeSlots.map(time => (
                      <TableCell key={time} className="p-1 align-top h-24 w-[180px]">
                        {renderSlot(day, time)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
