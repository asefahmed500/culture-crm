
'use server';

/**
 * @fileOverview Generates a comprehensive campaign brief for a specific customer segment.
 *
 * - generateCampaignBrief - The main flow function.
 * - GenerateCampaignBriefInput - Input schema for the flow.
 * - GenerateCampaignBriefOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import CustomerProfile from '@/models/customer-profile';

const GenerateCampaignBriefInputSchema = z.object({
  segmentName: z.string().describe("The name of the target customer segment."),
});

export type GenerateCampaignBriefInput = z.infer<typeof GenerateCampaignBriefInputSchema>;

const GenerateCampaignBriefOutputSchema = z.object({
  campaignTitle: z.string().describe("A catchy, creative title for the campaign."),
  targetSegment: z.string().describe("The name of the target segment."),
  executiveSummary: z.string().describe("A brief, high-level overview of the campaign's goals, strategy, and expected outcomes."),
  targetSegmentAnalysis: z.string().describe("A detailed analysis of the target segment's cultural DNA, motivations, and behaviors."),
  culturalInsights: z.string().describe("Actionable insights derived from the segment's cultural preferences that will inform the campaign."),
  messagingStrategy: z.object({
    coreMessage: z.string().describe("The single, most important message to convey to the target audience."),
    keyThemes: z.array(z.string()).describe("A list of key themes or pillars that support the core message."),
    sampleSnippets: z.array(z.string()).describe("A few examples of ad copy or social media captions that resonate with the segment."),
  }),
  visualDirection: z.array(z.string()).describe("Guidelines for the campaign's visual aesthetic, including colors, imagery, and style."),
  successMetrics: z.array(z.string()).describe("Key Performance Indicators (KPIs) to measure the campaign's success."),
  budgetAllocation: z.string().describe("High-level suggestions for allocating the marketing budget across different channels or activities."),
});

export type GenerateCampaignBriefOutput = z.infer<typeof GenerateCampaignBriefOutputSchema>;

export async function generateCampaignBrief(input: GenerateCampaignBriefInput): Promise<GenerateCampaignBriefOutput> {
  return generateCampaignBriefFlow(input);
}

const briefPrompt = ai.definePrompt({
  name: 'campaignBriefPrompt',
  input: { schema: z.object({ segment: z.any() }) },
  output: { schema: GenerateCampaignBriefOutputSchema },
  prompt: `You are a world-class marketing campaign strategist. Your task is to create a comprehensive campaign brief for a specific customer segment based on their detailed profile.

Target Segment Profile:
{{{json segment}}}

Based on this profile, generate a complete campaign brief with the following sections:
1.  **Campaign Title**: Create a catchy, creative title for the campaign.
2.  **Target Segment**: State the name of the segment.
3.  **Executive Summary**: Write a brief, high-level overview of the campaign's goals, strategy, and expected outcomes.
4.  **Target Segment Analysis**: Provide a detailed analysis of the target segment's cultural DNA, motivations, and behaviors. What makes them tick?
5.  **Cultural Insights**: What are the most actionable insights from their cultural profile that should drive this campaign?
6.  **Messaging Strategy**:
    *   **Core Message**: What is the single most important message we want to convey?
    *   **Key Themes**: What are the key themes that support this message?
    *   **Sample Snippets**: Provide 2-3 examples of ad copy or social media captions.
7.  **Visual Direction**: Describe the visual aesthetic. What kind of imagery, colors, and style should be used?
8.  **Success Metrics & KPIs**: List the key metrics to track to measure success (e.g., 'Engagement Rate', 'Conversion Rate', 'Brand Mentions').
9.  **Budget Allocation Suggestions**: Provide high-level advice on how to allocate a hypothetical budget (e.g., '60% on digital ads targeting [platforms], 30% on influencer collaborations, 10% on content creation').

Format the output in the specified JSON format.
`,
});

const generateCampaignBriefFlow = ai.defineFlow(
  {
    name: 'generateCampaignBriefFlow',
    inputSchema: GenerateCampaignBriefInputSchema,
    outputSchema: GenerateCampaignBriefOutputSchema,
  },
  async ({ segmentName }) => {
    // This is a simplified approach. A real app might fetch the segment definition
    // from a database or another source. Here, we'll just find one profile
    // from that segment to act as a representative proxy.
    await dbConnect();
    
    // We can't directly query by a segment name that's AI-generated and not in the DB.
    // So, we'll fetch all profiles and ask the segmentation flow to give us the definition
    // for the one we care about. This is inefficient but demonstrates the concept.
    // A better approach would be to save the segment definitions themselves.
    const profiles = await CustomerProfile.find({}).lean();
    
    // For now, as a proxy, we'll just pass a few profiles to the prompt
    // and tell the AI to focus on the characteristics that would define the segment name.
    // This is a conceptual stand-in for a more robust segment data fetching mechanism.
     const representativeProfile = profiles.length > 0 ? profiles[0] : {};


    const { output } = await briefPrompt({ segment: {
        name: segmentName,
        // The prompt will use the name and this sample profile to infer the segment's characteristics
        sampleProfile: representativeProfile, 
        note: "This is a representative profile. Infer the segment's broader characteristics based on its descriptive name."
    } });

    if (!output) {
      throw new Error('The AI model did not return a valid campaign brief.');
    }
    
    return output;
  }
);
