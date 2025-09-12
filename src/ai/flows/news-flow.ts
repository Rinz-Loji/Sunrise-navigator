'use server';

/**
 * @fileOverview A flow to fetch top news headlines.
 * - getNewsHeadlines - A function that returns top news headlines.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fetch from 'node-fetch';
import type { NewsHeadline } from '@/lib/types';

const NewsOutputSchema = z.array(z.object({
  id: z.string().describe('A unique identifier for the news article.'),
  title: z.string().describe('The headline of the news article.'),
  source: z.string().describe('The source of the news article.'),
}));

const getNewsTool = ai.defineTool(
  {
    name: 'getNewsTool',
    description: 'Get top news headlines from the US.',
    inputSchema: z.object({}),
    outputSchema: NewsOutputSchema,
  },
  async () => {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      console.error('NEWS_API_KEY is not defined in the environment. Returning empty array.');
      return [];
    }

    const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`News API call failed with status: ${response.status}. Body: ${errorBody}`);
        return [];
      }
      
      const data: any = await response.json();
      if (data.status !== 'ok' || !data.articles) {
        console.log('News API did not return a successful status or articles.');
        return [];
      }

      return data.articles.map((article: any) => ({
        id: article.url,
        title: article.title,
        source: article.source.name,
      }));

    } catch (error) {
      console.error('Error fetching news data:', error);
      return [];
    }
  }
);

const newsFlow = ai.defineFlow(
  {
    name: 'newsFlow',
    inputSchema: z.object({}),
    outputSchema: NewsOutputSchema,
  },
  async () => {
    return await getNewsTool({});
  }
);

export async function getNewsHeadlines(): Promise<NewsHeadline[]> {
  return await newsFlow({});
}
