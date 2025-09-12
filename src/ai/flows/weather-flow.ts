'use server';

/**
 * @fileOverview A flow to fetch weather information.
 * - getWeatherData - A function that returns weather information.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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
    // In a real application, you would make an API call to a service like OpenWeatherMap.
    // For this demo, we'll simulate the response.
    console.log(`Simulating weather check for ${location}`);
    
    // Simulate different weather based on location string
    let temp, cond;
    if (location.toLowerCase().includes('york')) {
        temp = 12;
        cond = 'Cloudy';
    } else if (location.toLowerCase().includes('london')) {
        temp = 15;
        cond = 'Light Rain';
    } else {
        temp = 22;
        cond = 'Sunny';
    }
    const randomFactor = (Math.random() - 0.5) * 4; // +/- 2 degrees
    
    return {
        temperature: Math.round(temp + randomFactor),
        condition: cond,
    };
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
