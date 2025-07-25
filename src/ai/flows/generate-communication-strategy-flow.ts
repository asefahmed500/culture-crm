
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
import { ICulturalDNA } from '@/models/customer-profile';

// The input is the Cultural DNA profile from the CustomerProfile model.
// We can't import the Zod schema from the model directly due to server/client constraints,
// so we redefine it here for the AI flow.
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
    tone: z.string().describe('Recommended tone of voice for emails.'),
    language: z.string().describe('The type of language to use (e.g., casual, formal, witty).'),
    subjectLineExamples: z.array(z.string()).describe('Three examples of effective email subject lines that will maximize open rates for this segment.'),
  }),
  socialMediaApproach: z.object({
    platforms: z.array(z.string()).describe('The most effective social media platforms for this segment.'),
    contentTypes: z.array(z.string()).describe('Types of content that will resonate (e.g., short-form video, tutorials, articles).'),
    postingStyle: z.string().describe('The recommended style for social media posts, including caption tone and visual aesthetic.'),
  }),
  productRecommendationStrategy: z.string().describe('The best method for recommending products. Should it be direct, story-driven, or subtle? Provide a brief strategy.'),
  customerServiceApproach: z.string().describe('The ideal communication style and problem-solving method for customer service interactions.'),
  visualBrandingElements: z.array(z.string()).describe('Visual branding elements, aesthetics, and imagery that will resonate.'),
  culturalInsights: z.object({
      referencesToEmphasize: z.array(z.string()).describe('Cultural references, values, or trends to emphasize in communications.'),
      approachesToAvoid: z.array(z.string()).describe('Communication approaches, topics, or tones to avoid to prevent cultural missteps.'),
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
    prompt: `You are an expert marketing strategist and cultural analyst for a modern e-commerce brand. Your task is to analyze a customer's "Cultural DNA" profile and generate a complete, actionable communication playbook for them.

Cultural DNA Profile:
- Music Affinity: {{music.score}}% (Preferences: {{json music.preferences}})
- Entertainment Affinity: {{entertainment.score}}% (Preferences: {{json entertainment.preferences}})
- Dining Affinity: {{dining.score}}% (Preferences: {{json dining.preferences}})
- Fashion Affinity: {{fashion.score}}% (Preferences: {{json fashion.preferences}})
- Travel Affinity: {{travel.score}}% (Preferences: {{json travel.preferences}})
- Social Causes Affinity: {{socialCauses.score}}% (Preferences: {{json socialCauses.preferences}})

Based on this profile, generate a detailed playbook with the following sections:
1.  **Email Marketing Optimization**: Define the tone, language, and provide three compelling subject line examples optimized for open rates.
2.  **Social Media Content Strategy**: Recommend the best platforms, content types, and posting style. How can we engage them authentically?
3.  **E-commerce Product Recommendations**: How should we present products to this customer? Should we use story-telling, highlight technical features, or focus on lifestyle alignment?
4.  **Engagement & Service**: 
    -   Outline the ideal communication style for customer service.
    -   Suggest visual branding elements that will resonate.
5.  **Cultural Guardrails**: 
    -   List specific cultural references or values to emphasize.
    -   Crucially, list what topics, tones, or approaches to AVOID to prevent brand-damaging missteps.
6.  **Predicted ROI**: Provide a single, high-level sentence estimating the potential ROI for using this strategy (e.g., "Adopting this strategy could lead to a 15-20% increase in engagement and conversion.").

Format the output as a JSON object that strictly adheres to the provided schema. This playbook should be ready for a marketing team to use immediately.
`,
});

const generateCommunicationStrategyFlow = ai.defineFlow(
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
