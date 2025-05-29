// 'use server'
'use server';

/**
 * @fileOverview AI tool that suggests due dates for tasks based on the task description and existing workload.
 *
 * - suggestDueDate - A function that suggests a due date for a given task.
 * - SuggestDueDateInput - The input type for the suggestDueDate function.
 * - SuggestDueDateOutput - The return type for the suggestDueDate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDueDateInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The description of the task for which to suggest a due date.'),
  existingWorkload: z
    .string()
    .optional()
    .describe(
      'A description of the user\'s existing workload, including other tasks and commitments.'
    ),
});
export type SuggestDueDateInput = z.infer<typeof SuggestDueDateInputSchema>;

const SuggestDueDateOutputSchema = z.object({
  suggestedDueDate: z
    .string()
    .describe(
      'The suggested due date for the task, formatted as YYYY-MM-DD. Consider the existing workload.'
    ),
  reasoning: z
    .string()
    .describe(
      'The AI\'s reasoning for suggesting this particular due date, considering the task description and existing workload.'
    ),
});
export type SuggestDueDateOutput = z.infer<typeof SuggestDueDateOutputSchema>;

export async function suggestDueDate(input: SuggestDueDateInput): Promise<SuggestDueDateOutput> {
  return suggestDueDateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDueDatePrompt',
  input: {schema: SuggestDueDateInputSchema},
  output: {schema: SuggestDueDateOutputSchema},
  prompt: `You are a helpful AI assistant that suggests due dates for tasks.

  Given the following task description and the user\'s existing workload, suggest a due date for the task.
  The due date should be formatted as YYYY-MM-DD.

  Task Description: {{{taskDescription}}}
  Existing Workload: {{{existingWorkload}}}

  Consider the task description and existing workload when suggesting a due date.
  Provide a brief explanation for your suggestion.
  `,
});

const suggestDueDateFlow = ai.defineFlow(
  {
    name: 'suggestDueDateFlow',
    inputSchema: SuggestDueDateInputSchema,
    outputSchema: SuggestDueDateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
