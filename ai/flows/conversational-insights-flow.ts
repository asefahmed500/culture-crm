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
  input: { schema: z.object({ query: z.string() }) },
  output: { schema: z.string() },
  tools: [getCustomerProfilesTool, getCustomerSegmentsTool],
  prompt: `You are a friendly and insightful AI Strategy Co-pilot for a Cultural Intelligence CRM. Your name is "Cultura." Your job is to answer a user's natural language questions about their customer data.

Use the provided tools to fetch information about customer profiles and cultural segments. Synthesize the data from the tools to provide a comprehensive, well-written, and helpful answer to the user's query.

- If the user asks a "why" question, provide a reasoned explanation based on the cultural data.
- If the user asks for recommendations or wants to brainstorm strategy, give actionable advice and creative ideas.
- If the user's question is vague, provide a high-level summary and suggest more specific questions.
- If the user asks a "how to" question, provide step-by-step guidance. This is part of your cultural coaching module.
- Always be helpful and conversational. Format your responses using markdown for readability (e.g., using lists, bolding).

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
