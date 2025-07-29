
'use server';

/**
 * @fileOverview Generates a detailed communication strategy based on a customer's Cultural DNA profile.
 *
 * - generateCommunicationStrategy - The main flow function.
 * - GenerateCommunicationStrategyInput - Input schema for the flow (the Cultural DNA).
 * - GenerateCommunicationStrategyOutput - Output schema for the flow (the detailed strategy).
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// The input is the Cultural DNA profile from the CustomerProfile model.
const CulturalDnaInputSchema = z.object({
  music: z.object({
    score: z.number(),
    preferences: z.array(z.string()),
  }),
  entertainment: z.object({
    score: z.number(),
    preferences: z.array(z.string()),
  }),
  dining: z.object({
    score: z.number(),
    preferences: z.array(z.string()),
  }),
  fashion: z.object({
    score: z.number(),
    preferences: z.array(z.string()),
  }),
  travel: z.object({
    score: z.number(),
    preferences: z.array(z.string()),
  }),
  socialCauses: z.object({
    score: z.number(),
    preferences: z.array(z.string()),
  }),
});

export type GenerateCommunicationStrategyInput = z.infer<typeof CulturalDnaInputSchema>;

const GenerateCommunicationStrategyOutputSchema = z.object({
  emailMarketing: z.object({
    tone: z.string().describe('Recommended tone of voice for emails (e.g., "Witty and energetic", "Calm and reassuring").'),
    language: z.string().describe('The style of language to use (e.g., "Casual with slang", "Formal and professional", "Story-driven and evocative").'),
    subjectLineExamples: z.array(z.string()).describe('Three examples of effective email subject lines that will maximize open rates for this cultural profile.'),
  }),
  socialMediaApproach: z.object({
    platforms: z.array(z.string()).describe('The most effective social media platforms for this segment.'),
    contentTypes: z.array(z.string()).describe('Types of content that will resonate (e.g., "Short-form video", "In-depth tutorials", "User-generated content showcases").'),
    postingStyle: z.string().describe('The recommended style for social media posts, including caption tone and visual aesthetic.'),
  }),
  productRecommendationStrategy: z.string().describe('The best method for recommending products. Should it be direct, story-driven, or subtle? Provide a brief strategy.'),
  customerServiceApproach: z.string().describe('The ideal communication style and problem-solving method for customer service interactions.'),
  visualBrandingElements: z.array(z.string()).describe('Visual branding elements, aesthetics, and imagery that will resonate (e.g., "Muted, earthy tones", "Bold, vibrant colors", "Minimalist photography").'),
  culturalGuardrails: z.object({
    dos: z.array(z.string()).describe("A list of cultural references, values, or trends to emphasize in communications to build rapport."),
    donts: z.array(z.string()).describe("A list of communication approaches, topics, or tones to avoid to prevent brand-damaging cultural missteps. This is the taboo detection system."),
  }),
  predictedROI: z.string().describe('A brief, high-level prediction of the potential ROI improvement from using this tailored strategy, expressed as a sentence (e.g., "Adopting this strategy could lead to a 15-20% increase in engagement and conversion.").'),
});

export type GenerateCommunicationStrategyOutput = z.infer<typeof GenerateCommunicationStrategyOutputSchema>;

export async function generateCommunicationStrategy(input: GenerateCommunicationStrategyInput): Promise<GenerateCommunicationStrategyOutput> {
  return generateCommunicationStrategyFlow(input);
}


const strategyPrompt = ai.definePrompt({
    name: 'communicationStrategyPrompt',
    input: { schema: CulturalDnaInputSchema },
    output: { schema: GenerateCommunicationStrategyOutputSchema },
    prompt: `You are an expert marketing strategist and cultural analyst for a modern e-commerce brand. Your task is to analyze a customer's "Cultural DNA" profile—which has been generated using taste correlation data from the Qloo Taste AI API—and generate a complete, actionable communication playbook for them. This playbook should eliminate guesswork for the marketing team.

The user's Cultural DNA Profile, derived from Qloo API data, is as follows:
- Music Affinity Score: {{music.score}}/100 (Preferences: {{json music.preferences}})
- Entertainment Affinity Score: {{entertainment.score}}/100 (Preferences: {{json entertainment.preferences}})
- Dining Affinity Score: {{dining.score}}/100 (Preferences: {{json dining.preferences}})
- Fashion Affinity Score: {{fashion.score}}/100 (Preferences: {{json fashion.preferences}})
- Travel Affinity Score: {{travel.score}}/100 (Preferences: {{json travel.preferences}})
- Social Causes Affinity Score: {{socialCauses.score}}/100 (Preferences: {{json socialCauses.preferences}})

Based *specifically* on this rich, data-driven profile, generate a detailed playbook with the following sections:
1.  **Email Marketing Optimization**: Fully localize the approach. Define the tone, language style (e.g., formal, casual, witty), and provide three compelling subject line examples optimized for open rates for this specific profile.
2.  **Social Media Content Strategy**: Recommend the best platforms, content types, and a specific posting style that aligns with their tastes.
3.  **Visual Content Optimization**: Describe the visual branding elements, color palettes, and imagery that will resonate most strongly.
4.  **E-commerce & Service**: 
    -   Outline the best strategy for recommending products (e.g., story-telling, highlighting features, focusing on lifestyle alignment).
    -   Define the ideal communication style for customer service.
5.  **Cultural Guardrails (Taboo Detection System)**: This is the most critical part. To eliminate guesswork and prevent brand-damaging missteps:
    -   **DO's**: List specific cultural references, values, or trends from their profile to emphasize in communications.
    -   **DON'Ts**: Crucially, list what topics, tones, imagery, or approaches to AVOID. This is the taboo detection system. Be specific (e.g., 'Avoid overtly political humor,' 'Steer clear of luxury-focused language as it may seem inauthentic.').
6.  **Predicted ROI**: Provide a single, high-level sentence estimating the potential ROI for using this strategy (e.g., "Adopting this strategy could lead to a 15-20% increase in engagement and conversion.").

Format the output as a JSON object that strictly adheres to the provided schema. This playbook must be ready for a marketing team to use immediately.
`,
});

export const generateCommunicationStrategyFlow = ai.defineFlow(
  {
    name: 'generateCommunicationStrategyFlow',
    inputSchema: CulturalDnaInputSchema,
    outputSchema: GenerateCommunicationStrategyOutputSchema,
  },
  async (input) => {
    const { output } = await strategyPrompt(input);
    if (!output) {
      throw new Error('The AI model did not return a valid communication strategy.');
    }
    return output;
  }
);
