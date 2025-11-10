import { config } from 'dotenv';
config();

import '@/ai/flows/generate-grade-report.ts';
import '@/ai/flows/generate-attendance-report.ts';
import '@/ai/flows/generate-helpdesk-response';
import '@/ai/flows/generate-student-summary';
