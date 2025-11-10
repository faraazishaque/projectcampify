'use server';

/**
 * @fileOverview AI agent that provides helpdesk support for the Campify application.
 *
 * - generateHelpdeskResponse - A function that responds to user queries about the application.
 * - GenerateHelpdeskResponseInput - The input type for the function.
 * - GenerateHelpdeskResponseOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { syllabuses } from '@/lib/data';

const GenerateHelpdeskResponseInputSchema = z.object({
  query: z.string().describe("The user's question about the Campify application."),
  userRole: z.string().describe('The role of the user asking the question (e.g., "Admin", "Teacher", "Student", "Parent").'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The conversation history.'),
});
export type GenerateHelpdeskResponseInput = z.infer<typeof GenerateHelpdeskResponseInputSchema>;

const GenerateHelpdeskResponseOutputSchema = z.object({
  response: z.string().describe("The AI-generated answer to the user's query."),
});
export type GenerateHelpdeskResponseOutput = z.infer<typeof GenerateHelpdeskResponseOutputSchema>;


export async function generateHelpdeskResponse(input: GenerateHelpdeskResponseInput): Promise<GenerateHelpdeskResponseOutput> {
    return generateHelpdeskResponseFlow(input);
}

const getCourseSyllabus = ai.defineTool(
    {
        name: 'getCourseSyllabus',
        description: 'Returns the syllabus for a given course.',
        inputSchema: z.object({
            courseName: z.string().describe('The name of the course to get the syllabus for.'),
        }),
        outputSchema: z.string(),
    },
    async (input) => {
        return syllabuses[input.courseName] || `Sorry, I could not find a syllabus for the course "${input.courseName}".`;
    }
)


const prompt = ai.definePrompt({
    name: 'generateHelpdeskResponsePrompt',
    input: { schema: GenerateHelpdeskResponseInputSchema },
    output: { schema: GenerateHelpdeskResponseOutputSchema },
    tools: [getCourseSyllabus],
    prompt: `You are a helpful and friendly AI assistant for Campify, a student management application. Your role is to answer user questions about how to use the application.

    You are speaking to a user with the role: **{{{userRole}}}**. Tailor your response to their likely permissions and features.

    **Campify Feature Overview:**
    - **Dashboard:** A summary view for each user role.
    - **Students:** (Admin/Teacher) A roster of all students. Admins can click on a student to view a detailed profile and generate an AI summary.
    - **Teachers:** (Admin) A list of all teachers.
    - **Courses:** (Admin/Teacher/Student) A list of courses. Teachers see courses they teach, Students see courses they are enrolled in.
    - **Timetable:** (Student/Parent) A weekly class schedule.
    - **Grades:** (Student/Parent) A detailed view of grades for assignments and courses.
    - **Payments:** (Admin/Parent) Admins track all student fee payments. Parents can view their child's fee status and make payments.
    - **Reports:** (Admin/Teacher/Parent) Admins and Teachers can generate AI reports on grades and attendance. They can then share these reports with parents. Parents can view shared reports and comment on them.
    - **Profile:** All users can view and update their personal information.
    - **Settings:** All users can manage application settings, like theme and notifications.

    **Instructions:**
    - If the user asks about the syllabus, curriculum, or topics for a specific course, you MUST use the \`getCourseSyllabus\` tool to retrieve the information.
    - For all other questions, answer based on the feature overview provided.
    - Do not invent features. Stick to the functionality described.
    - Be friendly and conversational.

    **Conversation History:**
    {{#each history}}
    - {{role}}: {{content}}
    {{/each}}

    **User's Current Question:**
    "{{{query}}}"

    **Your Task:**
    Based on the user's role and their question, provide a clear, concise, and helpful answer.
    `,
});

const generateHelpdeskResponseFlow = ai.defineFlow(
    {
        name: 'generateHelpdeskResponseFlow',
        inputSchema: GenerateHelpdeskResponseInputSchema,
        outputSchema: GenerateHelpdeskResponseOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
