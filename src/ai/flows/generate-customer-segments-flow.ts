
'use server';

/**
 * @fileOverview Analyzes all customer profiles to create distinct cultural segments and provides targeting recommendations.
 *
 * - generateCustomerSegments - The main flow function.
 * - GenerateCustomerSegmentsOutput - The structured output for the segmentation dashboard.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import CustomerProfile from '@/models/customer-profile';
import Segment from '@/models/segment';


const SegmentSchema = z.object({
    segmentName: z.string().describe("A descriptive, catchy name for the segment (e.g., 'Eco-Conscious Indie Enthusiasts', 'Globetrotting Foodies')."),
    segmentSize: z.number().describe("The number of customers in this segment."),
    averageCustomerValue: z.string().describe("A qualitative description of the average customer value (e.g., 'High', 'Medium', 'Low')."),
    topCulturalCharacteristics: z.array(z.string()).min(5).max(5).describe("The top 5 most defining cultural characteristics for this segment."),
    communicationPreferences: z.string().describe("A summary of how this segment prefers to be communicated with (e.g., 'Prefers witty, infrequent emails and authentic social media content.')."),
    lovedProductCategories: z.array(z.string()).describe("A feature preference matrix. List product categories, features, or service types this segment loves. This should guide product development."),
    bestMarketingChannels: z.array(z.string()).describe("The most effective marketing channels to reach this segment (e.g., 'Instagram Stories', 'Email Newsletter', 'Podcast Sponsorships')."),
    sampleMessaging: z.string().describe("A sample messaging snippet that would resonate with this segment."),
    potentialLifetimeValue: z.string().describe("A qualitative assessment of the potential lifetime value (e.g., 'Very High', 'Moderate')."),
    businessOpportunityRank: z.number().describe("A rank from 1 to 12 indicating the business opportunity, where 1 is the highest."),
    biasWarning: z.string().optional().describe("If the segment relies on correlations that could be interpreted as stereotypical or biased (e.g., based on age, gender), include a brief, actionable warning message here. Frame it as a constructive alert. For example, 'This segment correlates fashion preferences with age, which could be a stereotype. Validate this with other data points.' Omit this field entirely if no potential bias is detected."),
});

const CampaignIdeaSchema = z.object({
    targetSegment: z.string().describe("The name of the segment this campaign idea is for."),
    campaignTitle: z.string().describe("A catchy title for the marketing campaign."),
    description: z.string().describe("A brief description of the campaign concept, strategy, and goals."),
    suggestedChannels: z.array(z.string()).describe("The best channels to run this campaign on."),
});


const GenerateCustomerSegmentsOutputSchema = z.object({
    segments: z.array(SegmentSchema).describe("An array of 8-12 distinct cultural segments identified from the customer base."),
    topCampaignIdeas: z.array(CampaignIdeaSchema).min(3).max(3).describe("A list of 3 campaign ideas for the top-ranked segments."),
    summary: z.string().describe("A high-level summary of the segmentation results."),
});

export type GenerateCustomerSegmentsOutput = z.infer<typeof GenerateCustomerSegmentsOutputSchema>;

export async function generateCustomerSegments(): Promise<GenerateCustomerSegmentsOutput> {
  return generateCustomerSegmentsFlow();
}

const segmentationPrompt = ai.definePrompt({
  name: 'customerSegmentationPrompt',
  input: { schema: z.any() }, // Input is the array of profiles
  output: { schema: GenerateCustomerSegmentsOutputSchema },
  prompt: `You are a world-class market research analyst and product development strategist with a strong commitment to ethical AI. Your task is to analyze a database of customer profiles, each with a "Cultural DNA" score derived from the Qloo Taste AI API, and create 8-12 distinct cultural segments.

Analyze the following customer profiles, which now contain rich, real-world taste data:
{{{json profiles}}}

Based on similarities in their Cultural DNA, perform the following actions:
1.  **Cluster Customers**: Group the customers into 8-12 meaningful, distinct segments. Go beyond simple taste clusters; create personas that feel real. For example, instead of "Likes Rock Music", create "The Weekend Warrior" who buys durable outdoor gear and listens to classic rock.
2.  **Name Each Segment**: Give each segment a descriptive and memorable name.
3.  **Create Detailed Personas**: For each segment, provide a detailed profile including:
    *   The size of the segment (count of customers).
    *   A qualitative average customer value ('Low', 'Medium', 'High').
    *   The top 5 most prominent cultural characteristics based on the Qloo data.
    *   Their communication preferences (inferred from their likely media consumption habits).
    *   **Feature Preference Matrix**: For the 'lovedProductCategories' field, create a feature preference matrix. List the specific product categories, product features, or service attributes that this segment has a high affinity for. This should directly inform product development by highlighting what these customers want and value in a product.
    *   The best marketing channels to reach them.
    *   A sample messaging snippet that would resonate with them.
    *   A qualitative assessment of their potential lifetime value ('Low', 'Moderate', 'High', 'Very High').
4.  **Ethical Review (Bias Check)**: This is critical. For each segment, critically evaluate if the defining characteristics could be based on harmful or reductive stereotypes (e.g., related to age, gender, location). If a potential bias is detected, populate the 'biasWarning' field with a concise, constructive explanation. For instance: 'Warning: This segment links specific music tastes to an age range. This could be a stereotype, so consider validating this insight before acting on it.' If no bias is detected, omit the field completely.
5.  **Rank Segments**: Rank each segment by business opportunity, from 1 (highest) to 12 (lowest).
6.  **Suggest Campaigns**: Based on your analysis, devise 3 innovative campaign ideas for the top 3 highest-opportunity segments. Each idea should have a target segment, a title, a brief description, and suggested channels.
7.  **Summarize**: Provide a high-level summary of your findings.

Synthesize all of this into the specified JSON format.
`,
});

const generateCustomerSegmentsFlow = ai.defineFlow(
  {
    name: 'generateCustomerSegmentsFlow',
    outputSchema: GenerateCustomerSegmentsOutputSchema,
  },
  async () => {
    await dbConnect();
    const profiles = await CustomerProfile.find({}).lean();

    // To prevent exceeding context window limits, we'll summarize if there are too many profiles.
    const MAX_PROFILES_FOR_FULL_ANALYSIS = 100;
    let profilesForPrompt;
    if (profiles.length > MAX_PROFILES_FOR_FULL_ANALYSIS) {
        profilesForPrompt = profiles.slice(0, MAX_PROFILES_FOR_FULL_ANALYSIS).map(p => ({
            ageRange: p.ageRange,
            spendingLevel: p.spendingLevel,
            interactionFrequency: p.interactionFrequency,
            culturalDNA: p.culturalDNA ? {
                music: p.culturalDNA.music.score,
                entertainment: p.culturalDNA.entertainment.score,
                dining: p.culturalDNA.dining.score,
                fashion: p.culturalDNA.fashion.score,
                travel: p.culturalDNA.travel.score,
                socialCauses: p.culturalDNA.socialCauses.score,
            } : {}
        }));
    } else {
        profilesForPrompt = profiles.map(p => ({
            ageRange: p.ageRange,
            spendingLevel: p.spendingLevel,
            interactionFrequency: p.interactionFrequency,
            culturalDNA: p.culturalDNA,
        }));
    }


    const { output } = await segmentationPrompt({ profiles: profilesForPrompt });

    if (!output) {
      throw new Error('The AI model did not return a valid segmentation report.');
    }
    
    // Sort segments by rank before saving
    output.segments.sort((a, b) => a.businessOpportunityRank - b.businessOpportunityRank);

    // Clear existing segments and save the new ones
    await Segment.deleteMany({});
    await Segment.insertMany(output.segments);
    
    return output;
  }
);
