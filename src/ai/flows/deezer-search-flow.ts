'use server';

/**
 * @fileOverview A flow to search for music tracks using the Deezer API.
 * - searchMusic - A function that returns a list of tracks matching a query, including a playable preview URL.
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
  url: z.string().describe("A playable preview URL for the track."),
}));

const searchMusicTool = ai.defineTool(
  {
    name: 'searchMusicTool',
    description: 'Search for a music track on Deezer and get a playable preview URL.',
    inputSchema: MusicSearchInputSchema,
    outputSchema: MusicSearchOutputSchema,
  },
  async ({ query }) => {
    // The Deezer API search endpoint is publicly accessible without a key.
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      const data: any = await response.json();
      
      if (!data.data || data.data.length === 0) {
        return [];
      }

      const tracks = data.data;
      
      // Filter out tracks that do not have a preview URL and map the results.
      return tracks
        .filter((track: any) => track.preview && track.preview.length > 0)
        .slice(0, 5) // Limit to 5 results
        .map((track: any) => ({
            name: track.title,
            artist: track.artist.name,
            url: track.preview, // This is a direct, playable MP3 link.
      }));

    } catch (error) {
      console.error('Error calling Deezer API:', error);
      return [];
    }
  }
);

const musicSearchFlow = ai.defineFlow(
  {
    name: 'deezerMusicSearchFlow',
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
