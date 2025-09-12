// src/ai/flows/motivational-message-generator.ts
'use server';

/**
 * @fileOverview Generates a motivational message for the morning briefing.
 *
 * - generateMotivationalMessage - A function that generates a motivational message.
 * - MotivationalMessageInput - The input type for the generateMotivationalMessage function.
 * - MotivationalMessageOutput - The return type for the generateMotivationalMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MotivationalMessageInputSchema = z.object({
  topic: z
    .string()
    .optional()
    .describe('The general topic to inspire the motivational quote.'),
});
export type MotivationalMessageInput = z.infer<typeof MotivationalMessageInputSchema>;

const MotivationalMessageOutputSchema = z.object({
  quote: z.string().describe('The generated motivational quote.'),
  isPositive: z
    .boolean()
    .describe(
      'Whether the quote is subjectively positive, so as to not start the day negatively.'
    ),
});
export type MotivationalMessageOutput = z.infer<typeof MotivationalMessageOutputSchema>;

export async function generateMotivationalMessage(
  input: MotivationalMessageInput
): Promise<MotivationalMessageOutput> {
  return motivationalMessageFlow(input);
}

const motivationalMessagePrompt = ai.definePrompt({
  name: 'motivationalMessagePrompt',
  input: {schema: MotivationalMessageInputSchema},
  output: {schema: MotivationalMessageOutputSchema},
  prompt: `You are an AI assistant designed to generate motivational quotes.

  Generate a motivational quote, ensuring it is uplifting and positive.

  The quote should be no more than 20 words.

  Output whether the quote is subjectively positive in the isPositive field.

  {{#if topic}}
  The quote should be about {{topic}}.
  {{/if}}`,
});

const motivationalMessageFlow = ai.defineFlow(
  {
    name: 'motivationalMessageFlow',
    inputSchema: MotivationalMessageInputSchema,
    outputSchema: MotivationalMessageOutputSchema,
  },
  async input => {
    const {output} = await motivationalMessagePrompt(input);
    return output!;
  }
);
