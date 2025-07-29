
'use server';

/**
 * @fileOverview Generates a "Cultural DNA" profile by using the Qloo API
 * to analyze and summarize anonymized behavioral data.
 *
 * - generateCulturalDna - The main flow function for generating cultural DNA.
 * - GenerateCulturalDnaInput - Input schema for the flow.
 * - GenerateCulturalDnaOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getCorrelations } from '@/services/qloo';

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
  surpriseConnections: z.array(z.string()).describe("A critical self-learning feature. Identify 2-3 surprising, non-obvious, or counter-intuitive connections between the user's preferences that a human might miss. This multi-dimensional analysis is the foundation for understanding complex emotional and virtual (metaverse) behaviors."),
  confidenceScore: z.number().describe('A score from 0-100 indicating the confidence in these predictions.'),
});
export type GenerateCulturalDnaOutput = z.infer<typeof GenerateCulturalDnaOutputSchema>;

export async function generateCulturalDna(input: GenerateCulturalDnaInput): Promise<GenerateCulturalDnaOutput> {
  return generateCulturalDnaFlow(input);
}


const dnaSummarizationPrompt = ai.definePrompt({
    name: 'dnaSummarizationPrompt',
    output: { schema: GenerateCulturalDnaOutputSchema },
    prompt: `You are a cultural intelligence expert. Your task is to synthesize correlation data from the Qloo API into a rich "Cultural DNA" profile. The Qloo data provides correlations for a user based on their purchase history.

Qloo Correlation Data:
{{{json qlooData}}}

Original User Input (for context):
- Purchase Categories & Timing: {{{json originalInputs.purchaseCategories}}}

Based on ALL this data, perform the following:
1.  **Organize Preferences**: Group the correlated items from the Qloo data into the six cultural categories: Music, Entertainment (includes film, tv, podcasts, books), Dining, Fashion, Travel, and Social Causes.
2.  **Score Affinities**: For each category, calculate an affinity score from 0-100. The score should be based on the number of items and their correlation scores in that category. A category with many high-correlation items should have a high score.
3.  **Infer Social Causes**: The Qloo API does not provide data on social causes. Based on the full list of preferences (music, fashion, dining, etc.), infer 2-3 likely social causes or values this person might support. For example, a love for indie music, vintage fashion, and vegan restaurants might suggest an interest in 'Sustainability' or 'Ethical Production'. Score this category based on the strength of your inference.
4.  **Find Surprising Connections (Self-Learning Task)**: This is a critical task. Analyze the full profile to uncover 2-3 non-obvious connections between the user's tastes that a human might miss. This multi-dimensional analysis is the foundation for understanding complex emotional and virtual (metaverse) behaviors. For example, 'A preference for minimalist fashion and high-tech gadgets often correlates with an interest in documentary films.'
5.  **Provide a Confidence Score**: Rate your confidence in this synthesized profile on a scale of 0-100, based on the richness and quality of the Qloo data.

Generate the output in the specified JSON format.`,
});

export const generateCulturalDnaFlow = ai.defineFlow(
  {
    name: 'generateCulturalDnaFlow',
    inputSchema: GenerateCulturalDnaInputSchema,
    outputSchema: GenerateCulturalDnaOutputSchema,
  },
  async (input) => {
    if (!input.purchaseCategories || input.purchaseCategories.length === 0) {
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

    // 1. Fetch correlations from Qloo API
    const qlooData = await getCorrelations(input.purchaseCategories);

    if (!qlooData || qlooData.length === 0) {
         return {
            music: { score: 0, preferences: [] },
            entertainment: { score: 0, preferences: [] },
            dining: { score: 0, preferences: [] },
            fashion: { score: 0, preferences: [] },
            travel: { score: 0, preferences: [] },
            socialCauses: { score: 0, preferences: [] },
            surpriseConnections: ["Could not retrieve correlations from the Qloo API. The service may be temporarily unavailable or the input categories were too niche."],
            confidenceScore: 20,
        };
    }
    
    // 2. Use Gemini to synthesize the Qloo data into the final Cultural DNA profile
    const { output } = await dnaSummarizationPrompt({ qlooData, originalInputs: input });

    if (!output) {
      throw new Error('The AI model did not return a valid cultural DNA profile from the Qloo data.');
    }
    return output;
  }
);
