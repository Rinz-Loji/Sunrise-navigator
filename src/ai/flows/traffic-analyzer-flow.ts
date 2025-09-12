'use server';

/**
 * @fileOverview A flow to analyze traffic conditions and provide suggestions.
 * - getTrafficInfo - A function that returns traffic information and suggestions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TrafficAnalysisInputSchema = z.object({
  origin: z.string().describe('The starting point of the commute.'),
  destination: z.string().describe('The destination of the commute.'),
});

const TrafficAnalysisOutputSchema = z.object({
  commuteTime: z.number().describe('The estimated commute time in minutes.'),
  delay: z.number().describe('The estimated delay in minutes due to traffic.'),
  destination: z.string().describe('The destination name.'),
  suggestion: z.string().optional().describe('A suggestion for the user if there is a delay.'),
});

// This tool simulates a call to a real-time traffic API like OpenMap.
const getCommuteDetailsTool = ai.defineTool(
  {
    name: 'getCommuteDetails',
    description: 'Get the current commute time and any traffic delays from a traffic data provider.',
    inputSchema: TrafficAnalysisInputSchema,
    outputSchema: z.object({
        commuteTime: z.number(),
        delay: z.number(),
    }),
  },
  async ({ origin, destination }) => {
    // In a real application, you would make an API call to a service like OpenMap.
    // For this demo, we'll simulate the response.
    console.log(`Simulating traffic check from ${origin} to ${destination}`);
    const baseTime = Math.floor(Math.random() * 20) + 20; // 20-40 minutes
    const trafficDelay = Math.random() > 0.6 ? Math.floor(Math.random() * 15) + 5 : 0; // 40% chance of delay
    
    return {
        commuteTime: baseTime + trafficDelay,
        delay: trafficDelay
    };
  }
);


const trafficAnalysisPrompt = ai.definePrompt({
  name: 'trafficAnalysisPrompt',
  input: { schema: TrafficAnalysisInputSchema },
  output: { schema: TrafficAnalysisOutputSchema },
  tools: [getCommuteDetailsTool],
  prompt: `You are a helpful traffic assistant.
  
  Your goal is to provide the user with their commute time and a helpful suggestion if there's a significant delay.
  
  1. Use the getCommuteDetails tool to fetch the latest traffic information for the user's route.
  2. If the delay is greater than 5 minutes, create a friendly and concise suggestion. For example, "Traffic is heavier than usual. You might want to leave a few minutes early."
  3. Do not provide a suggestion if the delay is 5 minutes or less.
  4. Your final output must conform to the provided JSON schema.
  
  Origin: {{{origin}}}
  Destination: {{{destination}}}`,
});


const trafficAnalyzerFlow = ai.defineFlow(
  {
    name: 'trafficAnalyzerFlow',
    inputSchema: TrafficAnalysisInputSchema,
    outputSchema: TrafficAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await trafficAnalysisPrompt(input);
    if (!output) {
      throw new Error("Unable to get traffic analysis.");
    }

    // Pass the destination name through for display purposes
    return {
        ...output,
        destination: input.destination.split(',')[1]?.trim() || 'Workville'
    };
  }
);


export async function getTrafficInfo(
    input: z.infer<typeof TrafficAnalysisInputSchema>
): Promise<z.infer<typeof TrafficAnalysisOutputSchema>> {
  return await trafficAnalyzerFlow(input);
}
