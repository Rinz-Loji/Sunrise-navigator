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

const sampleNews: NewsHeadline[] = [
    { id: 'sample-1', title: 'To get live news, add your NEWS_API_KEY to the .env file.', source: 'Sunrise Navigator' },
    { id: 'sample-2', title: 'Tech Stocks Surge in Pre-Market Trading', source: 'Financial Times' },
    { id: 'sample-3', title: 'Scientists Discover New Planet in Nearby Galaxy', source: 'Science Daily' },
];

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
      console.error('NEWS_API_KEY is not defined in the environment. Returning sample data.');
      return sampleNews;
    }

    const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=3&apiKey=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`News API call failed with status: ${response.status}. Body: ${errorBody}`);
        return sampleNews;
      }
      
      const data: any = await response.json();
      if (data.status !== 'ok' || !data.articles || data.articles.length === 0) {
        console.log('News API did not return a successful status or articles. Returning sample data.');
        return sampleNews;
      }

      return data.articles.map((article: any) => ({
        id: article.url,
        title: article.title,
        source: article.source.name,
      }));

    } catch (error) {
      console.error('Error fetching news data:', error);
      return sampleNews;
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
