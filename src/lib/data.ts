import {
  Admin,
  Teacher,
  Student,
  Parent,
  Course,
  Grade,
  Attendance,
  AppUser,
  Assignment,
  SharedReport,
  Payment,
  Timetable,
  TimetableSlot,
} from './definitions';
import { addDays, formatISO, subDays } from 'date-fns';

// --- DYNAMIC DATASET GENERATION ---

const today = new Date();
const TOTAL_STUDENTS = 70;
const TOTAL_TEACHERS = 5;

// --- USERS ---
const generatedUsers: AppUser[] = [];

// 1. Create Admin
generatedUsers.push({
  id: 'user-admin-1',
  name: 'Jennifer Anderson',
  email: 'j.anderson@campify.edu',
  role: 'Admin',
  avatarUrl: `https://picsum.photos/seed/user-admin-1/100/100`,
});

// 2. Create Teachers
const teacherData = [
  { id: 'user-teacher-1', name: 'Dr. Evelyn Reed', courses: ['Calculus'] },
  { id: 'user-teacher-2', name: 'Emvy Stone', courses: ['Database Management', 'Artificial Intelligence'] },
  { id: 'user-teacher-3', name: 'Mary Bloom', courses: ['Data Structures'] },
  { id: 'user-teacher-4', name: 'Max Sterling', courses: ['Modern Physics'] },
  { id: 'user-teacher-5', name: 'Dr. Alan Grant', courses: ['Computer Networks'] },
];

teacherData.forEach(t => {
  generatedUsers.push({
    id: t.id,
    name: t.name,
    email: `${t.name.split(' ').slice(-1)[0].toLowerCase()}@campify.edu`,
    role: 'Teacher',
    courseIds: [], // will be populated later
    avatarUrl: `https://picsum.photos/seed/${t.id}/100/100`,
  });
});

// 3. Create Students and Parents
const studentNames = [
    { first: 'Emily', last: 'Davis' }, { first: 'Michael', last: 'Brown' }, { first: 'Jessica', last: 'Miller' }, { first: 'David', last: 'Wilson' }, { first: 'Sarah', last: 'Moore' },
    { first: 'James', last: 'Taylor' }, { first: 'Laura', last: 'Anderson' }, { first: 'Robert', last: 'Thomas' }, { first: 'Linda', last: 'Jackson' }, { first: 'John', last: 'White' },
    { first: 'Patricia', last: 'Harris' }, { first: 'William', last: 'Martin' }, { first: 'Elizabeth', last: 'Thompson' }, { first: 'Richard', last: 'Garcia' }, { first: 'Susan', last: 'Martinez' },
    { first: 'Joseph', last: 'Robinson' }, { first: 'Karen', last: 'Clark' }, { first: 'Charles', last: 'Rodriguez' }, { first: 'Nancy', last: 'Lewis' }, { first: 'Thomas', last: 'Lee' },
    { first: 'Lisa', last: 'Walker' }, { first: 'Daniel', last: 'Hall' }, { first: 'Betty', last: 'Allen' }, { first: 'Paul', last: 'Young' }, { first: 'Sandra', last: 'Hernandez' },
    { first: 'Mark', last: 'King' }, { first: 'Ashley', last: 'Wright' }, { first: 'Donald', last: 'Lopez' }, { first: 'Kimberly', last: 'Hill' }, { first: 'George', last: 'Scott' },
    { first: 'Donna', last: 'Green' }, { first: 'Kenneth', last: 'Adams' }, { first: 'Carol', last: 'Baker' }, { first: 'Steven', last: 'Gonzalez' }, { first: 'Michelle', last: 'Nelson' },
    { first: 'Edward', last: 'Carter' }, { first: 'Emily', last: 'Mitchell' }, { first: 'Brian', last: 'Perez' }, { first: 'Sharon', last: 'Roberts' }, { first: 'Ronald', last: 'Turner' },
    { first: 'Deborah', last: 'Phillips' }, { first: 'Anthony', last: 'Campbell' }, { first: 'Jessica', last: 'Parker' }, { first: 'Kevin', last: 'Evans' }, { first: 'Cynthia', last: 'Edwards' },
    { first: 'Jason', last: 'Collins' }, { first: 'Kathleen', last: 'Stewart' }, { first: 'Matthew', last: 'Sanchez' }, { first: 'Amy', last: 'Morris' }, { first: 'Gary', last: 'Rogers' },
    { first: 'Shirley', last: 'Reed' }, { first: 'Jeffrey', last: 'Cook' }, { first: 'Angela', last: 'Morgan' }, { first: 'Ryan', last: 'Bell' }, { first: 'Helen', last: 'Murphy' },
    { first: 'Jacob', last: 'Bailey' }, { first: 'Anna', last: 'Rivera' }, { first: 'Larry', last: 'Cooper' }, { first: 'Brenda', last: 'Richardson' }, { first: 'Frank', last: 'Cox' },
    { first: 'Pamela', last: 'Howard' }, { first: 'Justin', last: 'Ward' }, { first: 'Nicole', last: 'Torres' }, { first: 'Brandon', last: 'Peterson' }, { first: 'Samantha', last: 'Gray' },
    { first: 'Benjamin', last: 'Ramirez' }, { first: 'Christine', last: 'James' }, { first: 'Gregory', last: 'Watson' }, { first: 'Rebecca', last: 'Brooks' }, { first: 'Samuel', last: 'Kelly' }
];


for (let i = 1; i <= TOTAL_STUDENTS; i++) {
  const studentId = `user-student-${i}`;
  const parentId = `user-parent-${i}`;
  
  const nameData = studentNames[i - 1];
  const firstName = nameData.first;
  const lastName = nameData.last;

  const studentName = `${firstName} ${lastName}`;
  const studentEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@campify.edu`;
  
  // Make parent names predictable
  const parentFirstName = i % 2 === 0 ? 'Mary' : 'John';
  const parentName = `${parentFirstName} ${lastName}`;
  const parentEmail = `${parentFirstName.toLowerCase()}.${lastName.toLowerCase()}@campify.edu`;

  // Create Student
  generatedUsers.push({
    id: studentId,
    name: studentName,
    email: studentEmail,
    role: 'Student',
    parentId: parentId,
    courseIds: [], // will be populated later
    avatarUrl: `https://picsum.photos/seed/${studentId}/100/100`,
  });

  // Create Parent
  generatedUsers.push({
    id: parentId,
    name: parentName,
    email: parentEmail,
    role: 'Parent',
    childIds: [studentId],
    avatarUrl: `https://picsum.photos/seed/${parentId}/100/100`,
  });
}

export const users: AppUser[] = generatedUsers;


// --- COURSES ---
const generatedCourses: Course[] = [
  { id: 'course-1', name: 'Calculus', teacherId: 'user-teacher-1', studentIds: [] },
  { id: 'course-2', name: 'Database Management', teacherId: 'user-teacher-2', studentIds: [] },
  { id: 'course-3', name: 'Artificial Intelligence', teacherId: 'user-teacher-2', studentIds: [] },
  { id: 'course-4', name: 'Data Structures', teacherId: 'user-teacher-3', studentIds: [] },
  { id: 'course-5', name: 'Modern Physics', teacherId: 'user-teacher-4', studentIds: [] },
  { id: 'course-6', name: 'Computer Networks', teacherId: 'user-teacher-5', studentIds: [] },
];

const studentUsers = users.filter(u => u.role === 'Student') as Student[];
studentUsers.forEach(student => {
    // Enroll every student in every course
    generatedCourses.forEach(course => {
        student.courseIds.push(course.id);
        course.studentIds.push(student.id);
    });
});

// Update teacher courseIds based on students
generatedCourses.forEach(course => {
    const teacher = users.find(u => u.id === course.teacherId) as Teacher | undefined;
    if (teacher && !teacher.courseIds.includes(course.id)) {
        teacher.courseIds.push(course.id);
    }
});


export const courses: Course[] = generatedCourses;

// --- SYLLABUSES ---
export const syllabuses: Record<string, string> = {
    'Calculus': `
        **Course:** Calculus
        **Instructor:** Dr. Evelyn Reed
        **Syllabus:**
        - Week 1-2: Limits and Continuity
        - Week 3-5: Derivatives
        - Week 6-8: Applications of Differentiation
        - Week 9-11: Integrals
        - Week 12-14: Applications of Integration
        - Week 15: Final Exam
    `,
    'Database Management': `
        **Course:** Database Management
        **Instructor:** Emvy Stone
        **Syllabus:**
        - Week 1-3: Relational Model and SQL
        - Week 4-6: Database Design and Normalization
        - Week 7-9: Transaction Management
        - Week 10-12: NoSQL Databases
        - Week 13-14: Data Warehousing
        - Week 15: Final Project Presentations
    `,
    'Artificial Intelligence': `
        **Course:** Artificial Intelligence
        **Instructor:** Emvy Stone
        **Syllabus:**
        - Week 1-3: Search Algorithms
        - Week 4-6: Logic and Knowledge Representation
        - Week 7-9: Machine Learning Fundamentals
        - Week 10-12: Neural Networks
        - Week 13-14: Natural Language Processing
        - Week 15: Course Project Due
    `,
    'Data Structures': `
        **Course:** Data Structures
        **Instructor:** Mary Bloom
        **Syllabus:**
        - Week 1-3: Arrays, Linked Lists, Stacks, Queues
        - Week 4-6: Trees, Heaps
        - Week 7-9: Hash Tables
        - Week 10-12: Graphs and Graph Algorithms
        - Week 13-14: Sorting and Searching Algorithms
        - Week 15: Final Exam
    `,
    'Modern Physics': `
        **Course:** Modern Physics
        **Instructor:** Max Sterling
        **Syllabus:**
        - Week 1-3: Special Relativity
        - Week 4-6: Quantum Mechanics Basics
        - Week 7-9: Atomic Structure
        - Week 10-12: Nuclear Physics
        - Week 13-14: Particle Physics
        - Week 15: Final Exam
    `,
    'Computer Networks': `
        **Course:** Computer Networks
        **Instructor:** Dr. Alan Grant
        **Syllabus:**
        - Week 1-3: The Physical and Data Link Layers
        - Week 4-6: The Network Layer (IP, Routing)
        - Week 7-9: The Transport Layer (TCP, UDP)
        - Week 10-12: The Application Layer (HTTP, DNS)
        - Week 13-14: Network Security
        - Week 15: Final Exam
    `,
};


const getRandomScore = (base: number) => {
    return Math.max(50, Math.min(100, base + Math.floor(Math.random() * 21) - 10));
}

// --- GRADES ---
export const grades: Grade[] = studentUsers.flatMap((student) =>
  student.courseIds.flatMap((courseId) => {
    const courseIndex = parseInt(courseId.split('-')[1]);
    const baseScores = [85, 78, 92];
    const scoreOffset = (student.id.charCodeAt(student.id.length - 1) % 5) * (courseIndex + 1);

    return [
      {
        studentId: student.id,
        courseId: courseId,
        assignment: 'Continuous Assessment Test 1',
        score: getRandomScore(baseScores[0] - scoreOffset),
        total: 100,
        date: formatISO(subDays(today, 20), { representation: 'date' }),
      },
      {
        studentId: student.id,
        courseId: courseId,
        assignment: 'Continuous Assessment Test 2',
        score: getRandomScore(baseScores[1] - scoreOffset),
        total: 100,
        date: formatISO(subDays(today, 12), { representation: 'date' }),
      },
      {
        studentId: student.id,
        courseId: courseId,
        assignment: 'Mid Term Test',
        score: getRandomScore(baseScores[2] + scoreOffset),
        total: 100,
        date: formatISO(subDays(today, 5), { representation: 'date' }),
      },
    ];
  })
);


// --- ASSIGNMENTS ---
export const assignments: Assignment[] = studentUsers.slice(0, 20).flatMap((student, index) => 
  student.courseIds.slice(0, 2).flatMap(courseId => {
    const assignmentBase = { id: `assign-${student.id}-${courseId}-${index}`, studentId: student.id, courseId: courseId, name: `Project Proposal` };
    // Make some overdue, some submitted, some upcoming
    if (index % 3 === 0) { // Overdue
      return { ...assignmentBase, submittedAt: null, dueDate: formatISO(subDays(today, 3), { representation: 'date' }), fileUrl: '#' };
    } else if (index % 3 === 1) { // Submitted
      return { ...assignmentBase, submittedAt: formatISO(subDays(today, 5), { representation: 'date' }), dueDate: formatISO(subDays(today, 2), { representation: 'date' }), fileUrl: '#' };
    } else { // Upcoming
      return { ...assignmentBase, submittedAt: null, dueDate: formatISO(addDays(today, 10), { representation: 'date' }), fileUrl: '#' };
    }
  })
);

// --- ATTENDANCE ---
export const attendance: Attendance[] = studentUsers.flatMap(student =>
  student.courseIds.flatMap(courseId => 
    Array.from({ length: 10 }, (_, i) => ({
      studentId: student.id,
      courseId: courseId,
      date: formatISO(subDays(today, i * 3), { representation: 'date' }),
      status: Math.random() > 0.92 ? 'Absent' : Math.random() > 0.85 ? 'Late' : 'Present' as 'Present' | 'Absent' | 'Late',
    }))
  )
);

// --- PAYMENTS ---
export const payments: Payment[] = studentUsers.map((student, i) => {
  let status: 'Paid' | 'Pending' | 'Overdue' = 'Paid';
  let amountPaid: number;
  const amountDue = 5500;

  if (student.email === 'michael.brown@campify.edu') {
    status = 'Pending';
    amountPaid = 3000;
  } else if (student.email === 'john.white@campify.edu') {
    status = 'Overdue';
    amountPaid = 500;
  } else if (i > 0 && i % 10 === 0) {
    status = 'Overdue';
    amountPaid = 1000 + (i * 10);
  } else if (i > 0 && i % 5 === 0) {
    status = 'Pending';
    amountPaid = 2500 + (i * 20);
  } else {
    status = 'Paid';
    amountPaid = amountDue;
  }

  return {
    id: `payment-${student.id}`,
    studentId: student.id,
    semester: 'Fall 2024',
    amountDue: amountDue,
    amountPaid: amountPaid,
    status: status,
    dueDate: formatISO(addDays(today, 30), { representation: 'date' }),
  };
});


// --- SHARED REPORTS ---
export const sharedReports: SharedReport[] = [
  {
    id: 'report-1',
    studentId: 'user-student-1',
    teacherId: 'user-teacher-1',
    courseId: 'course-1',
    sentDate: formatISO(subDays(today, 2), { representation: 'date' }),
    reportContent: `**Calculus Mid-Term Report for ${users.find(u => u.id === 'user-student-1')?.name}**

**Overall Summary:**
A solid understanding of the core concepts in Calculus is being demonstrated. Performance on the Midterm Exam was satisfactory, and homework submissions have been consistent. There is a slight area for improvement regarding quiz performance, which we can address.

**Areas of Strength:**
- Consistent completion of homework assignments.
- Strong problem-solving skills demonstrated on the midterm.

**Areas for Improvement:**
- Quiz scores are slightly below average. Reviewing lecture notes more frequently before quizzes could be beneficial.
- I noticed a bit of hesitance to ask questions in class. I encourage more participation!

**Suggested Next Steps:**
1.  Review the concepts from the last two quizzes.
2.  Attempt the optional challenge problems at the end of each chapter.
3.  Please visit my office hours if any concepts remain unclear.

Best,
Dr. Evelyn Reed`,
    comments: [
      {
        id: 'comment-1-1',
        reportId: 'report-1',
        authorId: 'user-teacher-1',
        content: `Hi ${users.find(u => u.id === 'user-parent-1')?.name}, here is the mid-term report. Please let me know if you have any questions.`,
        timestamp: subDays(today, 2).toISOString(),
      }
    ],
  },
    {
    id: 'report-2',
    studentId: 'user-student-1',
    teacherId: 'user-teacher-2',
    courseId: 'course-2',
    sentDate: formatISO(subDays(today, 5), { representation: 'date' }),
    reportContent: `**Database Management - Project 1 Feedback**

**Hi ${users.find(u => u.id === 'user-student-1')?.name},**

Great work on the initial schema design for Project 1. The normalization to 3NF is correct, and the entity-relationship diagram is very clear.

One suggestion: Consider adding indexes to the foreign key columns to improve query performance for the anticipated join operations. We will be covering this in next week's lecture, but it's great to think ahead.

Keep up the excellent work!

- Emvy Stone`,
    comments: [
       {
        id: 'comment-2-1',
        reportId: 'report-2',
        authorId: 'user-teacher-2',
        content: "Just wanted to share this positive feedback on recent project work. It's going great in Database Management.",
        timestamp: subDays(today, 5).toISOString(),
      },
       {
        id: 'comment-2-2',
        reportId: 'report-2',
        authorId: 'user-parent-1',
        content: "That's wonderful to hear! Thank you for sharing.",
        timestamp: subDays(today, 4).toISOString(),
      }
    ],
  },
  {
    id: 'report-3',
    studentId: 'user-student-7', // This is Laura Anderson
    teacherId: 'user-teacher-4', // Max Sterling
    courseId: 'course-5', // Modern Physics
    sentDate: formatISO(subDays(today, 3), { representation: 'date' }),
    reportContent: `**Modern Physics - Progress Report for ${users.find(u => u.id === 'user-student-7')?.name}**

**Overall Summary:**
${users.find(u => u.id === 'user-student-7')?.name?.split(' ')[0]} is showing great promise in Modern Physics. The lab reports are detailed and insightful, showing a strong grasp of the experimental concepts.

**Areas of Strength:**
- Excellent work on recent lab reports.
- Actively participates in class discussions.

**Areas for Improvement:**
- Some of the homework problems were incomplete. I recommend starting them earlier to allow time for questions.

**Suggested Next Steps:**
1.  Let's chat after class about the last homework set.
2.  Keep up the fantastic work in the lab.

Best,
Max Sterling`,
    comments: [
       {
        id: 'comment-3-1',
        reportId: 'report-3',
        authorId: 'user-teacher-4',
        content: `Sharing a quick progress report. Overall, doing very well!`,
        timestamp: subDays(today, 3).toISOString(),
      }
    ],
  },
   {
    id: 'report-4',
    studentId: 'user-student-2', // Michael Brown, has pending fees
    teacherId: 'user-teacher-1',
    courseId: 'course-1',
    sentDate: formatISO(subDays(today, 1), { representation: 'date' }),
    reportContent: `**Calculus - Attendance Concern for Michael Brown**

Hi, I'm reaching out because Michael has been late for the past three classes. While his test scores are still good, consistent tardiness can impact his ability to keep up with the material. Please let me know if there's anything we can do to help.

- Dr. Evelyn Reed`,
    comments: []
  },
    {
    id: 'report-5',
    studentId: 'user-student-7', // Laura Anderson
    teacherId: 'user-teacher-1',
    courseId: 'course-1',
    sentDate: formatISO(subDays(today, 1), { representation: 'date' }),
    reportContent: `Hi, I am reaching out to inform you that there is a pending fee for ${users.find(u=> u.id === 'user-student-7')?.name}. Please check the payments page for more details.`,
    comments: []
  }
];

// --- TIMETABLE ---
const timeSlots = ['09:00 - 10:30', '10:45 - 12:15', '13:30 - 15:00', '15:15 - 16:45'] as const;
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

// Fisher-Yates shuffle algorithm
const shuffle = <T>(array: T[]): T[] => {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array];
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};


export const timetables: Timetable[] = studentUsers.map((student) => {
  const dailySlots: TimetableSlot[] = [];
  const classTimeSlots = ['09:00 - 10:30', '10:45 - 12:15', '13:30 - 15:00', '15:15 - 16:45'];

  days.forEach(day => {
    const shuffledCourses = shuffle(student.courseIds);
    
    classTimeSlots.forEach((time, index) => {
      // Cycle through the courses to fill all slots
      const courseIdx = index % shuffledCourses.length;
      dailySlots.push({
        courseId: shuffledCourses[courseIdx],
        day: day,
        time: time as TimetableSlot['time'],
      });
    });
  });

  return {
    studentId: student.id,
    slots: dailySlots,
  };
});
