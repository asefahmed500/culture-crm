
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
import { getBusinessMetricsTool } from '../tools/business-metrics-tool';
import Segment from '@/models/segment';

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
    sampleEmailCopy: z.string().describe("A sample email marketing snippet that would resonate with this segment."),
    sampleSocialCopy: z.string().describe("A sample social media caption that would resonate with this segment."),
  }),
  visualDirection: z.array(z.string()).describe("Guidelines for the campaign's visual aesthetic, including colors, imagery, and style."),
  successMetrics: z.array(z.string()).describe("Key Performance Indicators (KPIs) to measure the campaign's success."),
  budgetAllocation: z.string().describe("High-level suggestions for allocating the marketing budget across different channels or activities."),
  projectedImpact: z.object({
      conversionLift: z.string().describe("The predicted percentage lift in conversion rate for this campaign. Formatted as a range (e.g., '15-25%')."),
      cpaReduction: z.string().describe("The estimated percentage reduction in Customer Acquisition Cost (CPA). Formatted as a range (e.g., '10-20%')."),
      ltvIncrease: z.string().describe("The projected percentage increase in Lifetime Value (LTV) for customers in this segment. Formatted as a range (e.g., '5-15%')."),
      justification: z.string().describe("A brief justification for these projections, referencing the segment's cultural profile."),
  }).describe("The projected business impact and ROI of running this culturally-attuned campaign.")
});

export type GenerateCampaignBriefOutput = z.infer<typeof GenerateCampaignBriefOutputSchema>;

export async function generateCampaignBrief(input: GenerateCampaignBriefInput): Promise<GenerateCampaignBriefOutput> {
  return generateCampaignBriefFlow(input);
}

const briefPrompt = ai.definePrompt({
  name: 'campaignBriefPrompt',
  input: { schema: z.object({ segmentContext: z.any() }) },
  output: { schema: GenerateCampaignBriefOutputSchema },
  tools: [getBusinessMetricsTool],
  prompt: `You are a world-class marketing campaign strategist and financial analyst. Your task is to create a comprehensive campaign brief for a specific customer segment based on their detailed profile.

Use the provided 'getBusinessMetrics' tool to fetch the company's current baseline metrics. Use this baseline to create a 'Projected Impact' section with specific, quantifiable ROI projections for this new campaign.

Target Segment Profile and Data Summary:
{{{json segmentContext}}}

Based on this profile and the baseline business metrics, generate a complete campaign brief with the following sections:
1.  **Campaign Title**: Create a catchy, creative title for the campaign.
2.  **Target Segment**: State the name of the segment.
3.  **Executive Summary**: Write a brief, high-level overview of the campaign's goals, strategy, and expected outcomes.
4.  **Target Segment Analysis**: Provide a detailed analysis of the target segment's cultural DNA, motivations, and behaviors. What makes them tick?
5.  **Cultural Insights**: What are the most actionable insights from their cultural profile that should drive this campaign?
6.  **Messaging Strategy**:
    *   **Core Message**: What is the single most important message we want to convey?
    *   **Key Themes**: What are the key themes that support this message?
    *   **Sample Email Copy**: Provide a short, effective copy snippet for an email marketing campaign.
    *   **Sample Social Media Copy**: Provide a short, engaging caption for a social media post.
7.  **Visual Direction**: Describe the visual aesthetic. What kind of imagery, colors, and style should be used?
8.  **Success Metrics & KPIs**: List the key metrics to track to measure success (e.g., 'Engagement Rate', 'Conversion Rate', 'Brand Mentions').
9.  **Budget Allocation Suggestions**: Provide high-level advice on how to allocate a hypothetical budget (e.g., '60% on digital ads targeting [platforms], 30% on influencer collaborations, 10% on content creation').
10. **Projected Impact & ROI**: Based on the baseline metrics and the tailored nature of this campaign, project the impact on Conversion Rate, CPA, and LTV. Provide a brief justification.

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
    await dbConnect();
    
    // Find the segment definition
    const segment = await Segment.findOne({ segmentName }).lean();
    if (!segment) {
        throw new Error(`Segment "${segmentName}" not found. Please generate segments first.`);
    }

    // Create a rich context summary for the AI from the segment data itself.
    const segmentContext = {
      name: segment.segmentName,
      description: `A segment of ${segment.segmentSize} customers, ranked #${segment.businessOpportunityRank} for business opportunity. They have a ${segment.potentialLifetimeValue.toLowerCase()} potential LTV and an average customer value of '${segment.averageCustomerValue}'.`,
      communicationPreferences: segment.communicationPreferences,
      lovedProductCategories: segment.lovedProductCategories,
      bestMarketingChannels: segment.bestMarketingChannels,
      topCulturalCharacteristics: segment.topCulturalCharacteristics,
      sampleMessaging: segment.sampleMessaging,
      note: `This campaign brief is for the '${segment.segmentName}' segment. Use the provided data to inform the analysis.`,
    };

    const { output } = await briefPrompt({ segmentContext });

    if (!output) {
      throw new Error('The AI model did not return a valid campaign brief.');
    }
    
    return output;
  }
);
