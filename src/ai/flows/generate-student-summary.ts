'use server';

/**
 * @fileOverview AI agent that generates a summary of a student's performance.
 *
 * - generateStudentSummary - A function that generates a summary.
 * - GenerateStudentSummaryInput - The input type for the function.
 * - GenerateStudentSummaryOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateStudentSummaryInputSchema = z.object({
  studentName: z.string().describe("The name of the student."),
  courses: z.array(z.object({
    name: z.string(),
    averageGrade: z.number().describe("The student's average grade in this course as a percentage."),
  })).describe("A list of courses the student is enrolled in, with their average grades."),
  attendance: z.object({
    absences: z.number(),
    lates: z.number(),
    totalDays: z.number(),
  }).describe("A summary of the student's attendance."),
});
export type GenerateStudentSummaryInput = z.infer<typeof GenerateStudentSummaryInputSchema>;

const GenerateStudentSummaryOutputSchema = z.object({
  summary: z.string().describe("A one-paragraph summary of the student's overall performance, attitude, and any areas of concern or excellence."),
});
export type GenerateStudentSummaryOutput = z.infer<typeof GenerateStudentSummaryOutputSchema>;

export async function generateStudentSummary(input: GenerateStudentSummaryInput): Promise<GenerateStudentSummaryOutput> {
    return generateStudentSummaryFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateStudentSummaryPrompt',
    input: { schema: GenerateStudentSummaryInputSchema },
    output: { schema: GenerateStudentSummaryOutputSchema },
    prompt: `You are an expert AI assistant for school administrators, specializing in creating student performance summaries.

    **Instructions:**
    Analyze the provided data for the student and generate a concise, one-paragraph summary. The summary should be objective and professional, highlighting both strengths and areas that may need attention. Mention academic performance and attendance.

    **Student Data:**
    - Name: {{{studentName}}}
    
    - **Course Performance:**
    {{#each courses}}
    - {{{name}}}: {{averageGrade}}%
    {{/each}}

    - **Attendance Record (last {{attendance.totalDays}} days):**
    - Absences: {{attendance.absences}}
    - Lates: {{attendance.lates}}

    Generate the summary paragraph now.
    `,
});

const generateStudentSummaryFlow = ai.defineFlow(
    {
        name: 'generateStudentSummaryFlow',
        inputSchema: GenerateStudentSummaryInputSchema,
        outputSchema: GenerateStudentSummaryOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
