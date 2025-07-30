
'use server';

/**
 * @fileOverview Provides a conversational interface for querying cultural insights.
 *
 * - conversationalInsights - The main flow function.
 * - ConversationalInsightsInput - Input schema for the flow.
 * - ConversationalInsightsOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getCustomerProfilesTool } from '../tools/customer-profiles-tool';
import { getCustomerSegmentsTool } from '../tools/customer-segments-tool';

const ConversationalInsightsInputSchema = z.object({
  query: z.string().describe("The user's natural language question about their customers or cultural segments."),
});

export type ConversationalInsightsInput = z.infer<typeof ConversationalInsightsInputSchema>;

export type ConversationalInsightsOutput = string;

export async function conversationalInsights(input: ConversationalInsightsInput): Promise<ConversationalInsightsOutput> {
  return conversationalInsightsFlow(input);
}

const conversationalPrompt = ai.definePrompt({
  name: 'conversationalInsightsPrompt',
  tools: [getCustomerProfilesTool, getCustomerSegmentsTool],
  input: { schema: ConversationalInsightsInputSchema },
  output: { schema: z.string() },
  prompt: `You are an AI Strategy Co-pilot agent named "Cultura." Your primary function is to act as an intelligent partner to the user, helping them understand their customer data and formulate marketing strategies.

Your capabilities:
-   **Answer Questions**: Use the provided tools to fetch information about customer profiles and cultural segments. Synthesize the data to provide comprehensive, well-written answers.
-   **Provide Strategic Guidance**: If the user asks for recommendations, brainstorming, or "why" questions, provide reasoned explanations and actionable advice based on the cultural data.
-   **Act as a Coach**: If the user asks a "how-to" question, provide clear, step-by-step guidance.
-   **Be Proactive**: After answering the initial query, anticipate the user's next question. Suggest 1-2 insightful follow-up questions they could ask to dig deeper into the data or strategy. This is a key part of your agentic behavior.

Interaction Style:
-   Always be friendly, insightful, and conversational.
-   Format your responses using markdown for readability (e.g., using lists, bolding).
-   When presenting data, synthesize it into a narrative. Don't just dump raw numbers.

User's Question:
"{{{query}}}"
`,
});

export const conversationalInsightsFlow = ai.defineFlow(
  {
    name: 'conversationalInsightsFlow',
    inputSchema: ConversationalInsightsInputSchema,
    outputSchema: z.string(),
  },
  async ({ query }) => {
    const { output } = await conversationalPrompt({ query });
    if (!output) {
      throw new Error('The AI model did not return a valid response.');
    }
    return output as string;
  }
);
