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
    description: 'Get the top 5 news headlines from a news data provider.',
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
        console.error(`News API call failed with status: ${response.status}`);
        return [];
      }
      
      const data: any = await response.json();

      if (data.status !== 'ok') {
        console.error('News API returned an error:', data.message);
        return [];
      }

      return data.articles.map((article: any) => ({
        id: article.url, // Using URL as a unique ID
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
