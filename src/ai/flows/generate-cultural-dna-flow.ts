
'use server';

/**
 * @fileOverview Generates a "Cultural DNA" profile by using an LLM to 
 * analyze and summarize anonymized behavioral data.
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
  surpriseConnections: z.array(z.string()).describe("A critical self-learning feature. Identify 2-3 surprising, non-obvious, or counter-intuitive connections between the user's preferences that a human might miss. This multi-dimensional analysis is the foundation for understanding complex emotional and virtual (metaverse) behaviors."),
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
    prompt: `You are a self-learning, multi-modal cultural intelligence expert powered by Gemini. Your task is to analyze anonymized behavioral data and synthesize it to create a rich "Cultural DNA" profile.

You must fully simulate a multi-modal analysis by inferring cultural tastes from the provided behavioral data as if you were analyzing multiple data sources simultaneously.

Behavioral Data:
- Age Range: {{{ageRange}}}
- Spending Level: {{{spendingLevel}}}
- Purchase Categories & Timing: {{{json purchaseCategories}}} (Analyze these for seasonal patterns or event-driven buying. For example, 'ski gear' in November suggests winter sports interest.)
- Interaction Frequency: {{{interactionFrequency}}} (High interaction could imply stronger brand loyalty.)

Based on this, perform a simulated multi-modal analysis:
1.  **Simulate Social Media Sentiment:** Based on the purchase categories, infer the likely sentiment and topics this person might post about. E.g., 'vintage clothing' purchases might correlate with positive posts about sustainability and unique fashion finds.
2.  **Simulate Product Review Analysis:** Infer the language and cultural cues this person might use in a product review. E.g., 'handmade leather goods' purchase could lead to reviews praising 'craftsmanship' and 'quality'.
3.  **Simulate Behavioral Analysis (Heatmaps/Engagement):** Infer web and email engagement patterns. A customer buying high-end 'audiophile headphones' might be inferred to spend more time on detailed product pages (simulated heatmap) and open emails with technical specs (simulated engagement).

Now, synthesize all real and simulated data to generate the Cultural DNA profile:
1.  **Organize Preferences**: Categorize the inferred interests into the six cultural categories (Music, Entertainment, Dining, Fashion, Travel, Social Causes). Use the simulated data to add deep nuance.
2.  **Score Affinities**: For each category, calculate an affinity score from 0-100 based on the strength and convergence of all inferred signals.
3.  **Find Surprising Connections (Self-Learning, Emotional & Metaverse Foundation)**: This is your most critical self-learning task. Uncover 2-3 non-obvious, counter-intuitive connections. For example, 'A preference for minimalist fashion and high-tech gadgets often correlates with an interest in documentary films.' This multi-dimensional analysis is the conceptual foundation for understanding more complex user behaviors, like those related to emotional intelligence (how culture affects feelings) and virtual (metaverse) identity expression. This is a key differentiator.
4.  **Provide a Confidence Score**: Rate your confidence in this profile on a scale of 0-100.

Generate the output in the specified JSON format.`,
});

const generateCulturalDnaFlow = ai.defineFlow(
  {
    name: 'generateCulturalDnaFlow',
    inputSchema: GenerateCulturalDnaInputSchema,
    outputSchema: GenerateCulturalDnaOutputSchema,
  },
  async (input) => {
    // If there's not enough data, generate a fallback response.
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

    // Use Gemini LLM to analyze and structure the data
    const { output } = await culturalDnaPrompt(input);

    if (!output) {
      throw new Error('The AI model did not return a valid cultural DNA profile.');
    }
    return output;
  }
);
