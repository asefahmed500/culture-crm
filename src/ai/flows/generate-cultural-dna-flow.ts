
'use server';

/**
 * @fileOverview Generates a "Cultural DNA" profile by querying the Qloo API 
 * and using an LLM to analyze and summarize the results.
 *
 * - generateCulturalDna - The main flow function for generating cultural DNA.
 * - GenerateCulturalDnaInput - Input schema for the flow.
 * - GenerateCulturalDnaOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getCorrelationsForKeywords } from '@/lib/qloo';

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
    input: { schema: z.object({ qlooData: z.any(), behavioralData: GenerateCulturalDnaInputSchema }) },
    output: { schema: GenerateCulturalDnaOutputSchema },
    prompt: `You are a multi-modal cultural intelligence expert. Your task is to analyze cultural correlation data from the Qloo API and synthesize it with behavioral data to create a rich "Cultural DNA" profile.

Act as if you are analyzing multiple data sources simultaneously to get a holistic view of the customer.
- **Qloo Correlation Data**: The primary source of truth for cultural tastes.
- **Original Behavioral Data**: Provides context on the customer's general behavior.
- **Simulated Multi-Modal Data**: Infer additional context by acting as if you have access to:
    - Sentiment from product reviews (e.g., positive mentions of "sustainability" or "craftsmanship").
    - Seasonal purchase patterns (e.g., buying hiking gear in spring).
    - Brand engagement metrics (e.g., high interaction with independent or luxury brands).

Qloo Correlation Data:
{{{json qlooData}}}

Original Behavioral Data:
- Age Range: {{{behavioralData.ageRange}}}
- Spending Level: {{{behavioralData.spendingLevel}}}
- Purchase Categories: {{{json behavioralData.purchaseCategories}}}
- Interaction Frequency: {{{behavioralData.interactionFrequency}}}

Based on this multi-modal analysis, perform the following actions:
1.  **Organize Preferences**: Categorize the correlated items from the Qloo data into the six cultural categories (Music, Entertainment, Dining, Fashion, Travel, Social Causes). Use the simulated data to add nuance (e.g., if purchases include 'vintage clothes' and reviews mention 'unique finds', the fashion preference is not just 'clothing' but 'vintage fashion').
2.  **Score Affinities**: For each category, calculate an affinity score from 0-100 based on the number and strength of correlations found in the Qloo data, tempered by the behavioral and simulated data.
3.  **Find Surprising Connections**: Based on all available data, identify 2-3 non-obvious connections. For example, 'A preference for minimalist fashion and high-tech gadgets often correlates with an interest in documentary films.'
4.  **Provide a Confidence Score**: Rate your overall confidence in this generated profile on a scale of 0-100, based on the richness and consistency of the provided data.

Generate the output in the specified JSON format.`,
});

const generateCulturalDnaFlow = ai.defineFlow(
  {
    name: 'generateCulturalDnaFlow',
    inputSchema: GenerateCulturalDnaInputSchema,
    outputSchema: GenerateCulturalDnaOutputSchema,
  },
  async (input) => {
    // 1. Get cultural correlations from Qloo API
    const qlooData = await getCorrelationsForKeywords(input.purchaseCategories || []);
    
    // 2. If Qloo returns no data, generate a fallback response.
    if (!qlooData || qlooData.length === 0) {
        return {
            music: { score: 0, preferences: [] },
            entertainment: { score: 0, preferences: [] },
            dining: { score: 0, preferences: [] },
            fashion: { score: 0, preferences: [] },
            travel: { score: 0, preferences: [] },
            socialCauses: { score: 0, preferences: [] },
            surpriseConnections: ["Not enough data to find surprising connections."],
            confidenceScore: 10,
        };
    }

    // 3. Use LLM to analyze and structure the Qloo data
    const { output } = await culturalDnaPrompt({ qlooData, behavioralData: input });

    if (!output) {
      throw new Error('The AI model did not return a valid cultural DNA profile.');
    }
    return output;
  }
);
