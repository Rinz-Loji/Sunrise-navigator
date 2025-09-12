'use server';

/**
 * @fileOverview A flow to find a YouTube video ID for a given music query.
 *
 * - findMusicVideo - A function that returns a YouTube video ID.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MusicVideoInputSchema = z.object({
  query: z.string().describe('The name of the song or artist to search for.'),
});
type MusicVideoInput = z.infer<typeof MusicVideoInputSchema>;

const MusicVideoOutputSchema = z.object({
  videoId: z.string().describe('The YouTube video ID.'),
});
export type MusicVideoOutput = z.infer<typeof MusicVideoOutputSchema>;

export async function findMusicVideo(
  input: MusicVideoInput
): Promise<MusicVideoOutput> {
  return musicVideoFlow(input);
}

const musicVideoPrompt = ai.definePrompt({
  name: 'musicVideoPrompt',
  input: { schema: MusicVideoInputSchema },
  output: { schema: MusicVideoOutputSchema },
  prompt: `You are a music search assistant. Your task is to find a relevant YouTube video ID for a given song query.
  
  Do not search for playlists, only individual videos. Find the most popular or official music video if possible.
  
  User query: {{{query}}}
  
  Respond ONLY with the YouTube video ID.`,
});

const musicVideoFlow = ai.defineFlow(
  {
    name: 'musicVideoFlow',
    inputSchema: MusicVideoInputSchema,
    outputSchema: MusicVideoOutputSchema,
  },
  async input => {
    const { output } = await musicVideoPrompt(input);
    return output!;
  }
);
