'use server';

/**
 * @fileOverview AI agent that generates grade reports for teachers.
 *
 * - generateGradeReport - A function that generates grade reports based on student data.
 * - GenerateGradeReportInput - The input type for the generateGradeReport function.
 * - GenerateGradeReportOutput - The return type for the generateGradeReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGradeReportInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  className: z.string().describe('The name of the class.'),
  teacherName: z.string().describe('The name of the teacher.'),
  grades: z.string().describe('A summary of the student\'s grades in the class (e.g., "Homework 1: 85/100, Midterm: 72/100").'),
  attendance: z.string().describe('A summary of the student\'s attendance record (e.g., "1 absence, 2 lates").'),
});
export type GenerateGradeReportInput = z.infer<typeof GenerateGradeReportInputSchema>;

const GenerateGradeReportOutputSchema = z.object({
  report: z.string().describe('The generated grade report in plain text format.'),
});
export type GenerateGradeReportOutput = z.infer<typeof GenerateGradeReportOutputSchema>;

export async function generateGradeReport(input: GenerateGradeReportInput): Promise<GenerateGradeReportOutput> {
  return generateGradeReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGradeReportPrompt',
  input: {schema: GenerateGradeReportInputSchema},
  output: {schema: GenerateGradeReportOutputSchema},
  prompt: `You are an expert AI assistant for teachers, tasked with generating a comprehensive and supportive grade report.

  **Instructions:**
  1.  **Analyze the Data:** Review the student's name, class, grades, and attendance.
  2.  **Structure the Report:** Format the output as a professional report with the following sections:
      - **Header:** Student Name, Class Name, Teacher Name, Date.
      - **Overall Summary:** A brief, one-paragraph summary of the student's overall performance.
      - **Areas of Strength:** Identify where the student is excelling based on the provided grades.
      - **Areas for Improvement:** Gently point out where the student could improve. If attendance is an issue, mention how it can impact performance.
      - **Suggested Next Steps:** Provide 2-3 actionable recommendations for the student (e.g., "Review midterm concepts," "Attend office hours for homework help," "Focus on consistent attendance.").
  3.  **Tone:** Maintain a formal, encouraging, and constructive tone. The goal is to motivate the student, not discourage them.
  4.  **Format:** Use clear headings and bullet points for readability.

  **Student Information:**
  - Student Name: {{{studentName}}}
  - Class Name: {{{className}}}
  - Teacher Name: {{{teacherName}}}
  - Grades Summary: {{{grades}}}
  - Attendance Summary: {{{attendance}}}

  Please generate the report now.
`,
});

const generateGradeReportFlow = ai.defineFlow(
  {
    name: 'generateGradeReportFlow',
    inputSchema: GenerateGradeReportInputSchema,
    outputSchema: GenerateGradeReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
