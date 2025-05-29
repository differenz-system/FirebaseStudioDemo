
'use server';
/**
 * @fileOverview A task categorization AI agent.
 *
 * - categorizeTask - A function that handles the task categorization process.
 * - CategorizeTaskInput - The input type for the categorizeTask function.
 * - CategorizeTaskOutput - The return type for the categorizeTask function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeTaskInputSchema = z.object({
  taskDescription: z.string().describe('The description of the task to categorize.'),
});
export type CategorizeTaskInput = z.infer<typeof CategorizeTaskInputSchema>;

const CategorizeTaskOutputSchema = z.object({
  category: z
    .string()
    .describe(
      'The category the task belongs to (e.g., Work, Personal, Errands). Should be one of these three.'
    ),
});
export type CategorizeTaskOutput = z.infer<typeof CategorizeTaskOutputSchema>;

export async function categorizeTask(input: CategorizeTaskInput): Promise<CategorizeTaskOutput> {
  return categorizeTaskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeTaskPrompt',
  input: {schema: CategorizeTaskInputSchema},
  output: {schema: CategorizeTaskOutputSchema},
  prompt: `You are a task categorization expert.  Given the task description, you will categorize it into one of the following categories: Work, Personal, or Errands.

Task Description: {{{taskDescription}}}

Category: `,
});

const categorizeTaskFlow = ai.defineFlow(
  {
    name: 'categorizeTaskFlow',
    inputSchema: CategorizeTaskInputSchema,
    outputSchema: CategorizeTaskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
