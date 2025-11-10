'use client';

import { getAuthenticatedUser } from '@/app/actions/auth';
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
import { courses, users } from '@/lib/data';
import { Book, Download } from 'lucide-react';
import type { Teacher, AppUser, Course as CourseType } from '@/lib/definitions';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function CoursesPageSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Name</TableHead>
              <TableHead>Materials</TableHead>
              <TableHead className="text-right">Students Enrolled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-48" />
                </TableCell>
                 <TableCell>
                  <Skeleton className="h-8 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-5 w-10 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function CoursesPage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [relevantCourses, setRelevantCourses] = useState<CourseType[]>([]);
  const [teacherMap, setTeacherMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndData = async () => {
      const currentUser = await getAuthenticatedUser();
      setUser(currentUser);

      if (currentUser) {
        let coursesData: CourseType[];

        switch(currentUser.role) {
          case 'Teacher':
            coursesData = courses.filter((c) => c.teacherId === currentUser.id);
            break;
          case 'Student':
            coursesData = courses.filter((c) => c.studentIds.includes(currentUser.id));
            break;
          case 'Admin':
            coursesData = courses;
            break;
          default:
            coursesData = [];
        }
        setRelevantCourses(coursesData);

        if (currentUser.role === 'Admin' || currentUser.role === 'Student') {
          const tMap = users
            .filter((u) => u.role === 'Teacher')
            .reduce((acc, teacher) => {
              acc[teacher.id] = teacher.name;
              return acc;
            }, {} as Record<string, string>);
          setTeacherMap(tMap);
        }
      }
      setIsLoading(false);
    };

    fetchUserAndData();
  }, []);

  const getCourseMaterialLink = (courseName: string) => {
      const formattedName = courseName.toLowerCase().replace(/\s+/g, '-');
      return `https://www.coursera.org/search?query=${formattedName}`;
  }

  const pageAccessTitle = () => {
    if (!user) return 'All Courses';
    switch(user.role) {
        case 'Teacher': return 'Your Courses';
        case 'Student': return 'My Enrolled Courses';
        case 'Admin': return 'All Courses';
        default: return 'Courses';
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight flex items-center gap-2">
          <Book className="h-8 w-8" />
          Courses
        </h1>
        <p className="text-muted-foreground">
          A list of all available courses and their materials.
        </p>
      </div>

      {isLoading ? (
        <CoursesPageSkeleton />
      ) : user ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {pageAccessTitle()}
            </CardTitle>
            <CardDescription>
              {relevantCourses.length} courses found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  {(user.role === 'Admin' || user.role === 'Student') && <TableHead>Teacher</TableHead>}
                  <TableHead>Materials</TableHead>
                  {user.role !== 'Student' && <TableHead className="text-right">
                    Students Enrolled
                  </TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {relevantCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    {(user.role === 'Admin' || user.role === 'Student') && (
                      <TableCell>{teacherMap[course.teacherId] || 'N/A'}</TableCell>
                    )}
                     <TableCell>
                        <Button variant="outline" size="sm" asChild>
                           <Link href={getCourseMaterialLink(course.name)} target="_blank">
                             <Download className="mr-2 h-4 w-4" /> Download
                           </Link>
                        </Button>
                    </TableCell>
                    {user.role !== 'Student' && <TableCell className="text-right">
                      {course.studentIds.length}
                    </TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
         <p>Please log in to view courses.</p>
      )}
    </div>
  );
}
