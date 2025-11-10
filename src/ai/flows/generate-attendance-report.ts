'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating attendance reports for students.
 *
 * The flow takes in student details and attendance records, and generates a report summarizing their attendance.
 *
 * @fileOverview
 * - generateAttendanceReport - A function that generates the attendance report.
 * - GenerateAttendanceReportInput - The input type for the generateAttendanceReport function.
 * - GenerateAttendanceReportOutput - The return type for the generateAttendanceReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAttendanceReportInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  className: z.string().describe('The name of the class.'),
  attendanceRecords: z
    .array(
      z.object({
        date: z.string().describe('The date of the attendance record.'),
        status: z.enum(['Present', 'Absent', 'Late']).describe('The attendance status for the date.'),
      })
    )
    .describe('An array of attendance records for the student.'),
});

export type GenerateAttendanceReportInput = z.infer<typeof GenerateAttendanceReportInputSchema>;

const GenerateAttendanceReportOutputSchema = z.object({
  report: z.string().describe('A detailed attendance report for the student.'),
});

export type GenerateAttendanceReportOutput = z.infer<typeof GenerateAttendanceReportOutputSchema>;

export async function generateAttendanceReport(input: GenerateAttendanceReportInput): Promise<GenerateAttendanceReportOutput> {
  return generateAttendanceReportFlow(input);
}

const generateAttendanceReportPrompt = ai.definePrompt({
  name: 'generateAttendanceReportPrompt',
  input: {schema: GenerateAttendanceReportInputSchema},
  output: {schema: GenerateAttendanceReportOutputSchema},
  prompt: `You are an AI assistant specialized in generating student attendance reports.

  Based on the provided student name, class name, and attendance records, generate a comprehensive and easy-to-understand attendance report.

  Student Name: {{{studentName}}}
  Class Name: {{{className}}}
  Attendance Records:
  {{#each attendanceRecords}}
  - Date: {{date}}, Status: {{status}}
  {{/each}}

  Please provide a summary of the student's attendance, including the number of days present, absent, and late. Highlight any potential attendance issues or patterns.
  The report should be well-formatted and suitable for sharing with teachers and parents.
  Make sure to include the student's name and class name in the generated report.
  `,
});

const generateAttendanceReportFlow = ai.defineFlow(
  {
    name: 'generateAttendanceReportFlow',
    inputSchema: GenerateAttendanceReportInputSchema,
    outputSchema: GenerateAttendanceReportOutputSchema,
  },
  async input => {
    const {output} = await generateAttendanceReportPrompt(input);
    return output!;
  }
);
