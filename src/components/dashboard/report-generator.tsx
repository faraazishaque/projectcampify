'use client';

import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Share2 } from 'lucide-react';
import { generateGradeReport } from '@/ai/flows/generate-grade-report';
import { generateAttendanceReport } from '@/ai/flows/generate-attendance-report';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { users, courses, grades, attendance, sharedReports } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import type { Student, Course, AppUser, SharedReport, ReportComment } from '@/lib/definitions';
import { faker } from '@faker-js/faker';

// Schemas for the forms
const gradeReportSchema = z.object({
  studentName: z.string().min(1, 'Student name is required.'),
  className: z.string().min(1, 'Class name is required.'),
  teacherName: z.string().min(1, 'Teacher name is required.'),
  grades: z.string().min(1, 'Grades are required.'),
  attendance: z.string().min(1, 'Attendance is required.'),
});

const attendanceReportSchema = z.object({
  studentName: z.string().min(1, 'Student name is required.'),
  className: z.string().min(1, 'Class name is required.'),
  attendanceRecords: z.array(
    z.object({
      date: z.string(),
      status: z.enum(['Present', 'Absent', 'Late']),
    })
  ),
});

const allStudents = users.filter((u) => u.role === 'Student') as Student[];


function GradeReportGenerator({ currentUser }: { currentUser: AppUser }) {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [sharing, startSharingTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof gradeReportSchema>>({
    resolver: zodResolver(gradeReportSchema),
    defaultValues: {
      studentName: '',
      className: '',
      teacherName: '',
      grades: '',
      attendance: '',
    },
  });

  const handleStudentChange = (studentId: string) => {
    const student = allStudents.find((s) => s.id === studentId) || null;
    setSelectedStudent(student);
    setSelectedCourse(null);
    setReport(null);
    form.reset({
      ...form.getValues(),
      studentName: student?.name || '',
      className: '',
      grades: '',
      attendance: '',
    });
  };

  const handleCourseChange = (courseId: string) => {
      const course = courses.find(c => c.id === courseId);
      setSelectedCourse(course || null);
      setReport(null);

      if (selectedStudent && course) {
          const teacher = users.find(u => u.id === course.teacherId);
          const studentGrades = grades.filter(g => g.studentId === selectedStudent.id && g.courseId === course.id);
          const studentAttendance = attendance.filter(a => a.studentId === selectedStudent.id && a.courseId === course.id);

          const gradesSummary = studentGrades.map(g => `${g.assignment}: ${g.score}/${g.total}`).join(', ') || 'No grades recorded.';
          const attendanceSummary = `${studentAttendance.filter(a => a.status === 'Absent').length} absences, ${studentAttendance.filter(a => a.status === 'Late').length} lates`;

          form.reset({
              studentName: selectedStudent.name,
              className: course.name,
              teacherName: teacher?.name || currentUser.name,
              grades: gradesSummary,
              attendance: attendanceSummary,
          });
      }
  }

  async function onSubmit(values: z.infer<typeof gradeReportSchema>) {
    setIsLoading(true);
    setReport(null);
    try {
      const result = await generateGradeReport(values);
      setReport(result.report);
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate the report. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownload = () => {
    if (!report) return;
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${form
      .getValues('studentName')
      .replace(/ /g, '_')}_grade_report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleShare = () => {
    if (!report || !selectedStudent || !selectedCourse) return;
    startSharingTransition(() => {
        // Simulate an API call
        setTimeout(() => {
            const newReport: SharedReport = {
                id: `report-${faker.string.uuid()}`,
                studentId: selectedStudent.id,
                teacherId: currentUser.id,
                courseId: selectedCourse.id,
                sentDate: new Date().toISOString(),
                reportContent: report,
                comments: [],
            };
            
            // Add a comment from the teacher who shared it.
            const initialComment: ReportComment = {
                id: `comment-${faker.string.uuid()}`,
                reportId: newReport.id,
                authorId: currentUser.id,
                content: "Here is the grade report we discussed. Please let me know if you have any questions.",
                timestamp: new Date().toISOString(),
            };
            newReport.comments.push(initialComment);
            
            sharedReports.push(newReport);
            
            toast({
                title: 'Report Shared!',
                description: `The report for ${selectedStudent.name} has been shared with their parent.`,
            });
        }, 500);
    });
  }

  const studentCourses = selectedStudent ? courses.filter(c => c.studentIds.includes(selectedStudent.id)) : [];


  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Select onValueChange={handleStudentChange} value={selectedStudent?.id || ''}>
          <SelectTrigger>
            <SelectValue placeholder="Select a Student" />
          </SelectTrigger>
          <SelectContent>
            {allStudents.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                {student.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
            onValueChange={handleCourseChange}
            value={selectedCourse?.id || ''}
            disabled={!selectedStudent}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Course" />
          </SelectTrigger>
          <SelectContent>
            {studentCourses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            <FormField
              control={form.control}
              name="grades"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grades Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Select a student and course to see grade summary."
                      {...field}
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="attendance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attendance Summary</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Select a student and course to see attendance summary."
                      {...field}
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <Button type="submit" disabled={isLoading || !selectedCourse} className="w-full md:w-auto">
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
            ) : ('Generate Grade Report')}
          </Button>
        </form>
      </Form>
      {(isLoading || report) && <Separator className="my-6" />}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {report && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-headline text-xl font-semibold">
              Generated Report
            </h3>
            <div className='flex items-center gap-2'>
                <Button variant="outline" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" /> Download
                </Button>
                <Button onClick={handleShare} disabled={sharing}>
                    {sharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
                    {sharing ? 'Sharing...' : 'Share with Parent'}
                </Button>
            </div>
          </div>
          <div className="prose prose-sm max-w-none rounded-md border bg-muted p-4 whitespace-pre-wrap">
            {report}
          </div>
        </div>
      )}
    </>
  );
}

function AttendanceReportGenerator({ currentUser }: { currentUser: AppUser }) {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [sharing, startSharingTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof attendanceReportSchema>>({
    resolver: zodResolver(attendanceReportSchema),
    defaultValues: { studentName: '', className: '', attendanceRecords: [] },
  });

 const handleStudentChange = (studentId: string) => {
    const student = allStudents.find((s) => s.id === studentId);
    setSelectedStudent(student || null);
    setSelectedCourse(null);
    setReport(null);
    form.reset({
        studentName: student?.name || '',
        className: '',
        attendanceRecords: [],
    });
  };

  const handleCourseChange = (courseId: string) => {
      const course = courses.find(c => c.id === courseId);
      setSelectedCourse(course || null);
      setReport(null);

      if (selectedStudent && course) {
          const studentAttendance = attendance
            .filter((a) => a.studentId === selectedStudent.id && a.courseId === course.id)
            .map(rec => ({ date: rec.date, status: rec.status as 'Present' | 'Absent' | 'Late' }));

          form.reset({
              studentName: selectedStudent.name,
              className: course.name,
              attendanceRecords: studentAttendance,
          });
      }
  }

  async function onSubmit(values: z.infer<typeof attendanceReportSchema>) {
    setIsLoading(true);
    setReport(null);
    try {
      const result = await generateAttendanceReport(values);
      setReport(result.report);
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate attendance report. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

   const handleDownload = () => {
    if (!report) return;
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${form
      .getValues('studentName')
      .replace(/ /g, '_')}_attendance_report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleShare = () => {
    if (!report || !selectedStudent || !selectedCourse) return;
    startSharingTransition(() => {
        // Simulate an API call
        setTimeout(() => {
             const newReport: SharedReport = {
                id: `report-${faker.string.uuid()}`,
                studentId: selectedStudent.id,
                teacherId: currentUser.id,
                courseId: selectedCourse.id,
                sentDate: new Date().toISOString(),
                reportContent: report,
                comments: [],
            };
            const initialComment: ReportComment = {
                id: `comment-${faker.string.uuid()}`,
                reportId: newReport.id,
                authorId: currentUser.id,
                content: "Here is the attendance report you requested.",
                timestamp: new Date().toISOString(),
            };
            newReport.comments.push(initialComment);
            sharedReports.push(newReport);
            
            toast({
                title: 'Report Shared!',
                description: `The report for ${selectedStudent.name} has been shared with their parent.`,
            });
        }, 500);
    });
  }

  const studentCourses = selectedStudent ? courses.filter(c => c.studentIds.includes(selectedStudent.id)) : [];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Select onValueChange={handleStudentChange} value={selectedStudent?.id || ''}>
          <SelectTrigger>
            <SelectValue placeholder="Select a Student" />
          </SelectTrigger>
          <SelectContent>
            {allStudents.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                {student.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
            onValueChange={handleCourseChange}
            value={selectedCourse?.id || ''}
            disabled={!selectedStudent}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Course" />
          </SelectTrigger>
          <SelectContent>
            {studentCourses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
           <p className="text-sm text-muted-foreground mb-4">
                {form.getValues('attendanceRecords').length > 0
                  ? `${form.getValues('attendanceRecords').length} attendance records loaded for this student in this course.`
                  : 'Select a student and course to load attendance data.'
                }
            </p>
          <Button type="submit" disabled={isLoading || !selectedCourse} className="w-full md:w-auto">
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
            ) : ('Generate Attendance Report')}
          </Button>
        </form>
      </Form>

       {(isLoading || report) && <Separator className="my-6" />}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {report && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-headline text-xl font-semibold">
              Generated Report
            </h3>
             <div className='flex items-center gap-2'>
                <Button variant="outline" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" /> Download
                </Button>
                <Button onClick={handleShare} disabled={sharing}>
                    {sharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
                    {sharing ? 'Sharing...' : 'Share with Parent'}
                </Button>
            </div>
          </div>
          <div className="prose prose-sm max-w-none rounded-md border bg-muted p-4 whitespace-pre-wrap">
            {report}
          </div>
        </div>
      )}
    </>
  );
}


export function ReportGenerator({ user }: { user: AppUser }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Report Generator</CardTitle>
        <CardDescription>
          Generate and share detailed reports for student grades and attendance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="grade-report">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grade-report">Grade Report</TabsTrigger>
            <TabsTrigger value="attendance-report">Attendance Report</TabsTrigger>
          </TabsList>
          <TabsContent value="grade-report" className="pt-4">
            <GradeReportGenerator currentUser={user} />
          </TabsContent>
          <TabsContent value="attendance-report" className="pt-4">
            <AttendanceReportGenerator currentUser={user} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
