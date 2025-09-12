'use server';

/**
 * @fileOverview A flow to fetch weather information.
 * - getWeatherData - A function that returns weather information.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fetch from 'node-fetch';

const WeatherInputSchema = z.object({
  location: z.string().describe('The location for which to fetch the weather.'),
});

const WeatherOutputSchema = z.object({
  temperature: z.number().describe('The current temperature in Celsius.'),
  condition: z.string().describe('A brief description of the weather conditions (e.g., "Partly Cloudy").'),
  location: z.string().describe('The name of the location.'),
});

// This tool simulates a call to a real-time weather API like OpenWeatherMap.
const getWeatherDetailsTool = ai.defineTool(
  {
    name: 'getWeatherDetails',
    description: 'Get the current weather conditions from a weather data provider.',
    inputSchema: WeatherInputSchema,
    outputSchema: z.object({
        temperature: z.number(),
        condition: z.string(),
    }),
  },
  async ({ location }) => {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('WEATHER_API_KEY is not defined in the environment.');
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`API call failed with status: ${response.status}`);
        // Fallback to simulation on API error
        return { temperature: 18, condition: 'Clear Skies (Simulated)' };
      }
      
      const data: any = await response.json();

      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0]?.main || 'Clear',
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
       // Fallback to simulation on network error
      return { temperature: 18, condition: 'Clear Skies (Simulated)' };
    }
  }
);

const weatherAnalysisPrompt = ai.definePrompt({
  name: 'weatherAnalysisPrompt',
  input: { schema: WeatherInputSchema },
  output: { schema: WeatherOutputSchema },
  tools: [getWeatherDetailsTool],
  prompt: `You are a helpful weather assistant.
  
  Your goal is to provide the user with the current weather conditions.
  
  1. Use the getWeatherDetails tool to fetch the latest weather information for the user's location.
  2. Your final output must conform to the provided JSON schema.
  
  Location: {{{location}}}`,
});

const weatherFlow = ai.defineFlow(
  {
    name: 'weatherFlow',
    inputSchema: WeatherInputSchema,
    outputSchema: WeatherOutputSchema,
  },
  async (input) => {
    const { output } = await weatherAnalysisPrompt(input);
    if (!output) {
      throw new Error("Unable to get weather data.");
    }

    // Pass the location name through for display purposes
    return {
        ...output,
        location: input.location.split(',')[0]?.trim() || 'Unknown',
    };
  }
);

export async function getWeatherData(
    input: z.infer<typeof WeatherInputSchema>
): Promise<z.infer<typeof WeatherOutputSchema>> {
  return await weatherFlow(input);
}
