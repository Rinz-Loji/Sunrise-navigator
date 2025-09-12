'use server';

/**
 * @fileOverview A flow to fetch top news headlines for specific categories.
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
    description: 'Get top news headlines from India for different categories.',
    inputSchema: z.object({}),
    outputSchema: NewsOutputSchema,
  },
  async () => {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      console.error('NEWS_API_KEY is not defined in the environment. Returning empty array.');
      return [];
    }

    const fetchHeadline = async (params: Record<string, string>) => {
      const query = new URLSearchParams({ country: 'in', pageSize: '1', apiKey, ...params });
      const url = `https://newsapi.org/v2/top-headlines?${query}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`News API call failed for ${params.q || params.category} with status: ${response.status}`);
          return null;
        }
        const data: any = await response.json();
        if (data.status !== 'ok' || data.articles.length === 0) {
          console.error('News API returned an error or no articles for:', params.q || params.category, data.message);
          return null;
        }
        const article = data.articles[0];
        return {
          id: article.url,
          title: article.title,
          source: article.source.name,
        };
      } catch (error) {
        console.error(`Error fetching news data for ${params.q || params.category}:`, error);
        return null;
      }
    };

    const categories = [
      { category: 'technology' },
      { category: 'entertainment', q: 'movies' },
      { q: 'Kerala' },
    ];

    const headlinesPromises = categories.map(params => fetchHeadline(params));
    const results = await Promise.all(headlinesPromises);
    const headlines = results.filter((headline): headline is NewsHeadline => headline !== null);
    
    // Fetch 2 more general headlines to have a total of 5 if all succeed
    const generalHeadlines = await fetchHeadline({pageSize: (5 - headlines.length).toString()});
    if (generalHeadlines) {
        // This is a bit of a hack as fetchHeadline returns one, but we can call it again or change it
        // For now, we will just add the one
         const generalUrl = `https://newsapi.org/v2/top-headlines?country=in&pageSize=${5-headlines.length}&apiKey=${apiKey}`;
         const response = await fetch(generalUrl);
         if (response.ok) {
            const data: any = await response.json();
            if(data.status === 'ok' && data.articles) {
                const newHeadlines = data.articles.map((article: any) => ({
                    id: article.url,
                    title: article.title,
                    source: article.source.name,
                })).filter((h: NewsHeadline) => !headlines.some(existing => existing.id === h.id));
                headlines.push(...newHeadlines);
            }
         }
    }


    return headlines.slice(0, 5);
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
