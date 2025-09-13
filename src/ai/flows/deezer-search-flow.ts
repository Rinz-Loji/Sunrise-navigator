'use server';

/**
 * @fileOverview A flow to search for music tracks using the Deezer API.
 * - searchMusic - A function that returns a list of tracks matching a query, including a 30-second preview URL.
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
  url: z.string().describe("A URL to a 30-second audio preview of the track."),
}));

const searchMusicTool = ai.defineTool(
  {
    name: 'searchMusicTool',
    description: 'Search for a music track on Deezer and get a playable preview.',
    inputSchema: MusicSearchInputSchema,
    outputSchema: MusicSearchOutputSchema,
  },
  async ({ query }) => {
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=5`;

    try {
      const response = await fetch(url);
      const data: any = await response.json();

      if (!data.data || data.data.length === 0) {
        return [];
      }

      const tracks = data.data;
      
      return tracks
        .filter((track: any) => track.preview) // Ensure the track has a preview URL
        .map((track: any) => ({
            name: track.title,
            artist: track.artist.name,
            url: track.preview, // This is a direct link to an MP3 preview
      }));

    } catch (error) {
      console.error('Error calling Deezer API:', error);
      return [];
    }
  }
);

const musicSearchFlow = ai.defineFlow(
  {
    name: 'musicSearchFlow',
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
