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

    const fetchHeadline = async (params: Record<string, string>): Promise<NewsHeadline | null> => {
      const query = new URLSearchParams({ country: 'in', pageSize: '1', apiKey, ...params });
      const url = `https://newsapi.org/v2/top-headlines?${query}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`News API call failed for ${params.q || params.category} with status: ${response.status}. Body: ${errorBody}`);
          return null;
        }
        const data: any = await response.json();
        if (data.status !== 'ok' || data.articles.length === 0) {
          // This is not necessarily an error, could be no results.
          console.log('News API returned 0 articles for:', params.q || params.category);
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

    const headlines: NewsHeadline[] = [];
    
    // The user requested: one from Kerala, one from Technology, and one from movies.
    const specificSearches = [
      { q: 'Kerala' },
      { category: 'technology' },
      { q: 'movies' },
    ];
    
    // Fetch specific headlines first.
    for (const params of specificSearches) {
      if (headlines.length >= 5) break;
      const headline = await fetchHeadline(params);
      // Ensure the headline is not null and not already in the list
      if (headline && !headlines.some(h => h.id === headline.id)) {
        headlines.push(headline);
      }
    }

    // Now, fetch more general headlines if we don't have enough.
    const needed = 5 - headlines.length;
    if (needed > 0) {
      // Fetch more than we need to account for potential duplicates
      const generalUrl = `https://newsapi.org/v2/top-headlines?country=in&pageSize=${needed * 2}&apiKey=${apiKey}`;
      try {
        const response = await fetch(generalUrl);
        if (response.ok) {
          const data: any = await response.json();
          if (data.status === 'ok' && data.articles) {
            const newHeadlines = data.articles
              .map((article: any) => ({
                id: article.url,
                title: article.title,
                source: article.source.name,
              }))
              // Filter out any articles we already have
              .filter((h: NewsHeadline) => !headlines.some(existing => existing.id === h.id));
              
            // Add the new unique headlines to our list until we have 5
            headlines.push(...newHeadlines);
          }
        } else {
             const errorBody = await response.text();
             console.error(`General News API call failed with status: ${response.status}. Body: ${errorBody}`);
        }
      } catch (error) {
          console.error('Error fetching general news headlines:', error);
      }
    }
    
    // Return the first 5 headlines.
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
