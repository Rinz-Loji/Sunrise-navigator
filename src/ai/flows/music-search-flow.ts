'use server';

/**
 * @fileOverview A flow to search for music tracks using the Last.fm API.
 * - searchMusic - A function that returns a list of tracks matching a query.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fetch from 'node-fetch';

const MusicSearchInputSchema = z.object({
  query: z.string().describe('The track name to search for.'),
});

const MusicSearchResultSchema = z.object({
  name: z.string(),
  artist: z.string(),
  url: z.string(),
});

const MusicSearchOutputSchema = z.array(MusicSearchResultSchema);

const searchMusicTool = ai.defineTool(
  {
    name: 'searchMusicTool',
    description: 'Search for a music track on Last.fm.',
    inputSchema: MusicSearchInputSchema,
    outputSchema: MusicSearchOutputSchema,
  },
  async ({ query }) => {
    const apiKey = process.env.LASTFM_API_KEY;
    if (!apiKey) {
      throw new Error('LASTFM_API_KEY is not defined in the environment.');
    }

    const url = `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(
      query
    )}&api_key=${apiKey}&format=json&limit=5`;

    try {
      const response = await fetch(url);
      const data: any = await response.json();

      if (data.error || !data.results?.trackmatches?.track) {
        console.error('Last.fm API Error:', data.message || 'No tracks found');
        return [];
      }

      const tracks = data.results.trackmatches.track;
      
      return tracks.map((track: any) => ({
        name: track.name,
        artist: track.artist,
        url: track.url,
      }));

    } catch (error) {
      console.error('Error calling Last.fm API:', error);
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
): Promise<z.infer<typeof MusicSearchOutputSchema>> {
  return await musicSearchFlow(input);
}
