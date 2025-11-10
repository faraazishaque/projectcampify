export type UserRole = 'Admin' | 'Teacher' | 'Student' | 'Parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export interface Admin extends User {
  role: 'Admin';
}

export interface Teacher extends User {
  role: 'Teacher';
  courseIds: string[];
}

export interface Student extends User {
  role: 'Student';
  parentId: string;
  courseIds: string[];
}

export interface Parent extends User {
  role: 'Parent';
  childIds: string[];
}

export type AppUser = Admin | Teacher | Student | Parent;

export interface Course {
  id: string;
  name: string;
  teacherId: string;
  studentIds: string[];
}

export interface Grade {
  studentId: string;
  courseId: string;
  assignment: string;
  score: number;
  total: number;
  date: string;
}

export interface Attendance {
  studentId: string;
  courseId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
}

export interface Assignment {
  id: string;
  studentId: string;
  courseId: string;
  name: string;
  submittedAt: string | null;
  dueDate: string;
  fileUrl: string;
  grade?: Grade;
}

export interface ReportComment {
    id: string;
    reportId: string;
    authorId: string;
    content: string;
    timestamp: string;
}

export interface SharedReport {
    id: string;
    studentId: string;
    teacherId: string;
    courseId: string;
    sentDate: string;
    reportContent: string;
    comments: ReportComment[];
}

export interface Payment {
  id: string;
  studentId: string;
  semester: string;
  amountDue: number;
  amountPaid: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  dueDate: string;
}

export interface TimetableSlot {
    courseId: string;
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
    time: '09:00 - 10:30' | '10:45 - 12:15' | '13:30 - 15:00' | '15:15 - 16:45';
}

export interface Timetable {
    studentId: string;
    slots: TimetableSlot[];
}
