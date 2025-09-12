'use server';

import { generateMotivationalMessage } from '@/ai/flows/motivational-message-generator';
import type { BriefingData, MotivationalQuote } from './types';

// Mock function to simulate API calls
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getBriefingData(
  home: string,
  destination: string
): Promise<BriefingData> {
  await sleep(1500); // Simulate network delay

  // In a real app, you would fetch from OpenWeatherMap, Google Maps, Google Calendar, and News API
  const mockData: BriefingData = {
    weather: {
      temperature: 18,
      condition: 'Partly Cloudy',
      location: home.split(',')[1]?.trim() || 'Anytown',
    },
    traffic: {
      commuteTime: 25,
      delay: 5,
      destination: destination.split(',')[1]?.trim() || 'Workville',
    },
    calendar: {
      title: 'Q2 Planning Session',
      time: '9:00 AM',
    },
    news: [
      { id: '1', title: 'Tech Giant Announces New AI Breakthrough', source: 'Tech News' },
      { id: '2', title: 'Global Markets React to Economic Data', source: 'Finance Times' },
      { id: '3', title: 'New Study on Coffee and Productivity Released', source: 'Science Daily' },
    ],
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
