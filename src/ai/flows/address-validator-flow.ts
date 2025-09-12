'use server';

/**
 * @fileOverview A flow to validate a given address using Google Maps Geocoding API.
 * - validateAddress - A function that returns whether an address is valid.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';

const AddressValidationInputSchema = z.object({
  address: z.string().describe('The address to validate.'),
});

const AddressValidationOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the address is a valid, real place.'),
  formattedAddress: z.string().optional().describe('The full, formatted address returned by the API.'),
});

const validateAddressTool = ai.defineTool(
  {
    name: 'validateAddressTool',
    description: 'Validate an address using Google Maps Geocoding API.',
    inputSchema: AddressValidationInputSchema,
    outputSchema: AddressValidationOutputSchema,
  },
  async ({ address }) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY is not defined in the environment.');
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data: any = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        // We can add checks for partial matches if needed, but for now, "OK" is good enough.
        return {
          isValid: true,
          formattedAddress: data.results[0].formatted_address,
        };
      }
      
      return { isValid: false };

    } catch (error) {
      console.error('Error calling Google Maps Geocoding API:', error);
      // In case of an API error, we can't validate.
      // For a better user experience, we might assume it's valid but log the error.
      // For now, let's be strict.
      return { isValid: false };
    }
  }
);

const addressValidatorFlow = ai.defineFlow(
  {
    name: 'addressValidatorFlow',
    inputSchema: AddressValidationInputSchema,
    outputSchema: AddressValidationOutputSchema,
  },
  async (input) => {
    return await validateAddressTool(input);
  }
);


export async function validateAddress(
    input: z.infer<typeof AddressValidationInputSchema>
): Promise<z.infer<typeof AddressValidationOutputSchema>> {
  return await addressValidatorFlow(input);
}
