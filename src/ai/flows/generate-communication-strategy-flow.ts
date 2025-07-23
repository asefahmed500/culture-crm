
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
  emailStyle: z.object({
    tone: z.string().describe('Recommended tone of voice for emails.'),
    language: z.string().describe('The type of language to use (e.g., casual, formal, witty).'),
    subjectLineExamples: z.array(z.string()).describe('Three examples of effective email subject lines.'),
  }),
  socialMediaApproach: z.object({
    platforms: z.array(z.string()).describe('The most effective social media platforms for this segment.'),
    contentTypes: z.array(z.string()).describe('Types of content that will resonate (e.g., short-form video, tutorials, articles).'),
    postingStyle: z.string().describe('The recommended style for social media posts.'),
  }),
  productRecommendationMethod: z.string().describe('How to best present product recommendations to this customer segment.'),
  customerServiceApproach: z.string().describe('The ideal communication style and problem-solving method for customer service interactions.'),
  visualBrandingElements: z.array(z.string()).describe('Visual branding elements and aesthetics that will resonate.'),
  culturalInsights: z.object({
      referencesToEmphasize: z.array(z.string()).describe('Cultural references and values to emphasize in communications.'),
      approachesToAvoid: z.array(z.string()).describe('Communication approaches, topics, or tones to avoid.'),
  }),
  predictedROI: z.string().describe('A brief, high-level prediction of the potential ROI improvement from using this tailored strategy.'),
});

export type GenerateCommunicationStrategyOutput = z.infer<typeof GenerateCommunicationStrategyOutputSchema>;

export async function generateCommunicationStrategy(input: GenerateCommunicationStrategyInput): Promise<GenerateCommunicationStrategyOutput> {
  return generateCommunicationStrategyFlow(input);
}


const strategyPrompt = ai.definePrompt({
    name: 'communicationStrategyPrompt',
    input: { schema: CulturalDnaInputSchema },
    output: { schema: GenerateCommunicationStrategyOutputSchema },
    prompt: `You are an expert marketing strategist. Analyze the following customer's "Cultural DNA" profile and generate a comprehensive, actionable communication strategy.

Cultural DNA Profile:
- Music Affinity: {{music.score}}% (Preferences: {{json music.preferences}})
- Entertainment Affinity: {{entertainment.score}}% (Preferences: {{json entertainment.preferences}})
- Dining Affinity: {{dining.score}}% (Preferences: {{json dining.preferences}})
- Fashion Affinity: {{fashion.score}}% (Preferences: {{json fashion.preferences}})
- Travel Affinity: {{travel.score}}% (Preferences: {{json travel.preferences}})
- Social Causes Affinity: {{socialCauses.score}}% (Preferences: {{json socialCauses.preferences}})

Based on this profile, generate the following for the marketing team:
1.  **Email Communication Style**: Define the tone, language, and provide three compelling subject line examples.
2.  **Social Media Approach**: Recommend the best platforms, content types, and posting style.
3.  **Product Recommendation Method**: Describe the most effective way to present product options.
4.  **Customer Service Approach**: Outline the ideal communication style for support interactions.
5.  **Visual Branding Elements**: Suggest visual aesthetics and branding elements that would resonate.
6.  **Cultural Insights & Guidelines**: List cultural references/values to emphasize and, crucially, what to avoid.
7.  **Predicted ROI**: Provide a high-level, estimated ROI prediction for using this strategy (e.g., "15-20% increase in engagement").

Format the output as actionable guidelines in the specified JSON format.
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
