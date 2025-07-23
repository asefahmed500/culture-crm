
'use server';

/**
 * @fileOverview Generates a "Cultural DNA" profile based on anonymized customer behavioral data.
 *
 * - generateCulturalDna - The main flow function for generating cultural DNA.
 * - GenerateCulturalDnaInput - Input schema for the flow.
 * - GenerateCulturalDnaOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Input: A subset of the processed, anonymized customer profile
const GenerateCulturalDnaInputSchema = z.object({
    ageRange: z.string().optional(),
    spendingLevel: z.string().optional(),
    purchaseCategories: z.array(z.string()).optional(),
    interactionFrequency: z.string().optional(),
});
export type GenerateCulturalDnaInput = z.infer<typeof GenerateCulturalDnaInputSchema>;

// Output: A structured "Cultural DNA" profile
const GenerateCulturalDnaOutputSchema = z.object({
  music: z.object({
    score: z.number().describe('A score from 0-100 indicating affinity for this category.'),
    preferences: z.array(z.string()).describe('Specific genres, artists, or styles.'),
  }),
  entertainment: z.object({
    score: z.number().describe('A score from 0-100 indicating affinity for this category.'),
    preferences: z.array(z.string()).describe('Specific preferences like movie genres, TV shows, or book types.'),
  }),
  dining: z.object({
    score: z.number().describe('A score from 0-100 indicating affinity for this category.'),
    preferences: z.array(z.string()).describe('Specific preferences like cuisine types or dining styles.'),
  }),
  fashion: z.object({
    score: z.number().describe('A score from 0-100 indicating affinity for this category.'),
    preferences: z.array(z.string()).describe('Specific preferences like clothing styles or brands.'),
  }),
  travel: z.object({
    score: z.number().describe('A score from 0-100 indicating affinity for this category.'),
    preferences: z.array(z.string()).describe('Specific preferences like travel styles or destinations.'),
  }),
  socialCauses: z.object({
    score: z.number().describe('A score from 0-100 indicating affinity for this category.'),
    preferences: z.array(z.string()).describe('Specific causes or values they might support.'),
  }),
  surpriseConnections: z.array(z.string()).describe("Identify 2-3 surprising or non-obvious connections between the user's preferences."),
  confidenceScore: z.number().describe('A score from 0-100 indicating the confidence in these predictions.'),
});
export type GenerateCulturalDnaOutput = z.infer<typeof GenerateCulturalDnaOutputSchema>;

export async function generateCulturalDna(input: GenerateCulturalDnaInput): Promise<GenerateCulturalDnaOutput> {
  return generateCulturalDnaFlow(input);
}

const culturalDnaPrompt = ai.definePrompt({
    name: 'culturalDnaPrompt',
    input: { schema: GenerateCulturalDnaInputSchema },
    output: { schema: GenerateCulturalDnaOutputSchema },
    prompt: `You are a cultural intelligence expert. Your task is to analyze the following anonymized customer behavioral data and generate a "Cultural DNA" profile.

Infer cultural preferences based on the provided data points. For example, if purchase categories include 'organic food' and 'yoga classes', infer an interest in 'health & wellness' and 'sustainable lifestyle'.

Behavioral Data:
- Age Range: {{{ageRange}}}
- Spending Level: {{{spendingLevel}}}
- Purchase Categories: {{{json purchaseCategories}}}
- Interaction Frequency: {{{interactionFrequency}}}

Based on this data, perform the following actions:
1.  **Score Affinities**: For each of the six cultural categories (Music, Entertainment, Dining, Fashion, Travel, Social Causes), provide an affinity score from 0-100.
2.  **List Preferences**: For each category, list 2-4 specific, inferred preferences (e.g., Music: 'Indie Folk', 'Live Concerts').
3.  **Find Surprising Connections**: Identify 2-3 non-obvious connections between the preferences. For example, 'A preference for minimalist fashion often correlates with an interest in documentary films.'
4.  **Provide a Confidence Score**: Rate your overall confidence in this generated profile on a scale of 0-100.

Generate the output in the specified JSON format.`,
});

const generateCulturalDnaFlow = ai.defineFlow(
  {
    name: 'generateCulturalDnaFlow',
    inputSchema: GenerateCulturalDnaInputSchema,
    outputSchema: GenerateCulturalDnaOutputSchema,
  },
  async (input) => {
    const { output } = await culturalDnaPrompt(input);
    if (!output) {
      throw new Error('The AI model did not return a valid cultural DNA profile.');
    }
    return output;
  }
);
