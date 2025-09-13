'use server';

import { generateMotivationalMessage } from '@/ai/flows/motivational-message-generator';
import { getTrafficInfo as getTrafficInfoFlow } from '@/ai/flows/traffic-analyzer-flow';
import { getWeatherData as getWeatherDataFlow } from '@/ai/flows/weather-flow';
import { getNewsHeadlines as getNewsHeadlinesFlow } from '@/ai/flows/news-flow';
import { validateAddress as validateAddressFlow } from '@/ai/flows/address-validator-flow';
import { searchMusic as searchMusicFlow } from '@/ai/flows/deezer-search-flow';
import type { BriefingData, MotivationalQuote, MusicTrack, NewsHeadline, TrafficData, WeatherData } from './types';

// Mock function to simulate API calls
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getTrafficInfo(input: {
  origin: string;
  destination: string;
}): Promise<TrafficData> {
  return getTrafficInfoFlow(input);
}

export async function getWeatherData(input: {
  location: string;
}): Promise<WeatherData> {
    return getWeatherDataFlow({
        location: input.location,
    });
}

export async function getNewsHeadlines(): Promise<NewsHeadline[]> {
  return getNewsHeadlinesFlow();
}

export async function validateAddress(input: {
    address: string;
}): Promise<{isValid: boolean, formattedAddress?: string}> {
    return validateAddressFlow(input);
}

export async function searchMusic(input: { query: string }): Promise<MusicTrack[]> {
    return searchMusicFlow(input);
}

export async function getBriefingData(
  home: string,
  destination: string,
  weatherLocation: string,
  trafficInfo?: TrafficData
): Promise<BriefingData> {
  // We don't need to simulate a long delay if we're just fetching supplementary data
  await sleep(500); 

  // If traffic info isn't passed, fetch it.
  const trafficData =
    trafficInfo ??
    (await getTrafficInfo({
      origin: home,
      destination: destination,
    }));
  
  const [weatherData, newsData] = await Promise.all([
    getWeatherData({
      location: weatherLocation,
    }),
    getNewsHeadlines(),
  ]);

  const mockData: BriefingData = {
    weather: weatherData,
    traffic: trafficData,
    news: newsData,
  };

  return mockData;
}

export async function getMotivationalQuote(
  topic?: string
): Promise<MotivationalQuote> {
  await sleep(500);
  try {
    const result = await generateMotivationalMessage({ topic });
    if (result && result.isPositive) {
      return { quote: result.quote, author: 'AI Assistant' };
    }
    // Fallback if AI quote is not positive or fails
    return {
      quote:
        'Every morning is a new beginning. Take a deep breath, smile, and start again.',
      author: 'Sunrise Navigator',
    };
  } catch (error) {
    console.error('Error generating motivational message:', error);
    // Return a default quote on error
    return {
      quote:
        'The secret of getting ahead is getting started.',
      author: 'Mark Twain',
    };
  }
}
