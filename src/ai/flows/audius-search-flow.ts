'use server';

/**
 * @fileOverview A flow to search for music tracks using the Audius API.
 * - searchMusic - A function that returns a list of tracks matching a query, including a playable stream URL.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fetch from 'node-fetch';
import type { MusicTrack } from '@/lib/types';

const MusicSearchInputSchema = z.object({
  query: z.string().describe('The track name to search for.'),
});

const MusicSearchOutputSchema = z.array(z.object({
  name: z.string(),
  artist: z.string(),
  url: z.string().describe("A playable stream URL for the track."),
}));

const searchMusicTool = ai.defineTool(
  {
    name: 'searchMusicTool',
    description: 'Search for a music track on Audius and get a playable stream URL.',
    inputSchema: MusicSearchInputSchema,
    outputSchema: MusicSearchOutputSchema,
  },
  async ({ query }) => {
    // Audius API does not require an API key for public search.
    // We add a unique app_name as recommended by their docs.
    const url = `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=SunriseNavigator`;

    try {
      const response = await fetch(url);
      const data: any = await response.json();

      if (!data.data || data.data.length === 0) {
        return [];
      }

      const tracks = data.data;
      
      // Map the tracks and construct the streamable URL.
      return tracks
        .slice(0, 5) // Limit to 5 results
        .map((track: any) => ({
            name: track.title,
            artist: track.user.name,
            // The stream URL can be constructed directly from the track ID.
            // The /stream endpoint provides a redirect to the actual audio file.
            url: `https://discoveryprovider.audius.co/v1/tracks/${track.id}/stream?app_name=SunriseNavigator`,
      }));

    } catch (error) {
      console.error('Error calling Audius API:', error);
      return [];
    }
  }
);

const musicSearchFlow = ai.defineFlow(
  {
    name: 'audiusMusicSearchFlow',
    inputSchema: MusicSearchInputSchema,
    outputSchema: MusicSearchOutputSchema,
  },
  async (input) => {
    return await searchMusicTool(input);
  }
);

export async function searchMusic(
  input: z.infer<typeof MusicSearchInputSchema>
): Promise<MusicTrack[]> {
  return await musicSearchFlow(input);
}
