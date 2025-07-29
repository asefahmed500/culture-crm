
'use server';

/**
 * @fileOverview Generates a tailored sales script for a specific customer segment.
 *
 * - generateSalesScript - The main flow function.
 * - GenerateSalesScriptInput - Input schema for the flow.
 * - GenerateSalesScriptOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import Segment from '@/models/segment';

const GenerateSalesScriptInputSchema = z.object({
  segmentName: z.string().describe("The name of the target customer segment."),
});

export type GenerateSalesScriptInput = z.infer<typeof GenerateSalesScriptInputSchema>;

const GenerateSalesScriptOutputSchema = z.object({
  scriptTitle: z.string().describe("A title for this sales script, referencing the target segment."),
  targetSegment: z.string().describe("The name of the target segment."),
  scriptIntroduction: z.string().describe("A brief introduction for the sales team on how to approach this segment, including the right mindset and tone."),
  openingLines: z.array(z.string()).describe("3-4 example opening lines that will capture the attention of this segment."),
  keyTalkingPoints: z.array(z.object({
    point: z.string().describe("The core talking point."),
    culturalJustification: z.string().describe("Why this point will resonate with the segment's cultural DNA."),
  })).describe("A list of key talking points and why they are effective for this segment."),
  objectionHandling: z.array(z.object({
    potentialObjection: z.string().describe("A potential objection this segment might have."),
    suggestedResponse: z.string().describe("A culturally-attuned response to handle the objection."),
  })).describe("Strategies for handling common objections from this segment."),
  closingTechniques: z.array(z.string()).describe("2-3 closing techniques that align with the segment's values and decision-making style."),
});

export type GenerateSalesScriptOutput = z.infer<typeof GenerateSalesScriptOutputSchema>;

export async function generateSalesScript(input: GenerateSalesScriptInput): Promise<GenerateSalesScriptOutput> {
  return generateSalesScriptFlow(input);
}

const scriptPrompt = ai.definePrompt({
  name: 'salesScriptPrompt',
  input: { schema: z.object({ segment: z.any() }) },
  output: { schema: GenerateSalesScriptOutputSchema },
  prompt: `You are a world-class sales trainer specializing in cultural psychology. Your task is to create a detailed, actionable sales script for a specific customer segment based on their cultural profile.

Target Segment Profile:
{{{json segment}}}

Based on this profile, generate a complete sales script with the following sections:
1.  **Script Title**: A clear title for the script (e.g., "Sales Script for Eco-Conscious Creatives").
2.  **Target Segment**: The name of the segment.
3.  **Introduction for Sales Team**: A brief on the right mindset, tone, and approach for this segment.
4.  **Opening Lines**: Provide 3-4 compelling opening lines to grab their attention.
5.  **Key Talking Points**: List key points and explain the cultural justification for why each will resonate.
6.  **Objection Handling**: Identify potential objections and suggest culturally-aware responses.
7.  **Closing Techniques**: Suggest 2-3 closing techniques that align with the segment's values.

Format the output in the specified JSON format.
`,
});

export const generateSalesScriptFlow = ai.defineFlow(
  {
    name: 'generateSalesScriptFlow',
    inputSchema: GenerateSalesScriptInputSchema,
    outputSchema: GenerateSalesScriptOutputSchema,
  },
  async ({ segmentName }) => {
    await dbConnect();
    
    const segment = await Segment.findOne({ segmentName }).lean();

    if (!segment) {
      throw new Error(`Segment "${segmentName}" not found. Please generate segments first.`);
    }

    const { output } = await scriptPrompt({ segment });

    if (!output) {
      throw new Error('The AI model did not return a valid sales script.');
    }
    
    return output;
  }
);

    