
'use server';

/**
 * @fileOverview Analyzes all customer profiles to generate high-level predictive analytics and trends.
 *
 * - generateAnalyticsInsights - The main flow function.
 * - GenerateAnalyticsInsightsOutput - The structured output for the analytics dashboard.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import CustomerProfile from '@/models/customer-profile';

const PredictionSchema = z.object({
  segmentDescription: z.string().describe("A description of the customer segment this prediction applies to."),
  prediction: z.string().describe("The specific prediction for this segment (e.g., 'Likely to purchase premium products in the next quarter')."),
  confidenceScore: z.number().describe("Confidence score (0-100) for this prediction."),
  recommendation: z.string().describe("An actionable recommendation based on this prediction."),
});

const TrendSchema = z.object({
  trend: z.string().describe("A description of the identified trend (e.g., 'Rising interest in sustainable travel')."),
  supportingData: z.string().describe("A brief summary of the data points supporting this trend."),
  implication: z.string().describe("The business implication of this trend."),
});

const SeasonalForecastSchema = z.object({
    season: z.string().describe("The season or event for the forecast (e.g., 'Summer', 'Back-to-School', 'Holiday Season')."),
    segmentDescription: z.string().describe("The customer segment the forecast applies to."),
    predictedBehavior: z.string().describe("The predicted behavior for this segment during the season."),
    recommendation: z.string().describe("A marketing recommendation based on this seasonal forecast."),
});

const InterestTrendSchema = z.object({
    interest: z.string().describe("The cultural interest or preference (e.g., 'Indie Music', 'Vintage Fashion')."),
    changeDescription: z.string().describe("A brief explanation of why this trend is emerging or declining."),
});

const GenerateAnalyticsInsightsOutputSchema = z.object({
  overallSummary: z.string().describe("A high-level summary of the most important findings from the analysis."),
  keyPatterns: z.array(z.string()).describe("List of 3-5 key behavioral or cultural patterns identified across the entire customer base."),
  predictions: z.object({
    purchaseLikelihood: PredictionSchema,
    churnRisk: PredictionSchema,
    brandAdvocacy: PredictionSchema,
    upsellOpportunity: PredictionSchema,
  }),
  topEmergingInterests: z.array(InterestTrendSchema).length(5).describe("A ranked list of the top 5 emerging cultural interests gaining popularity."),
  topDecliningInterests: z.array(InterestTrendSchema).length(5).describe("A ranked list of the top 5 declining cultural interests losing engagement."),
  seasonalForecasts: z.array(SeasonalForecastSchema).describe("2-3 seasonal behavior forecasts for key customer segments."),
  marketOpportunityGaps: z.array(z.string()).describe("A list of 2-3 potential market opportunity gaps based on unmet or underserved cultural preferences in the data."),
  competitiveIntelligence: z.string().describe("A brief analysis of how the identified trends position the business against potential competitors and where cultural gaps can be turned into a competitive advantage."),
  dataShiftAlert: z.string().optional().describe("An alert message if a significant shift in customer data patterns is detected (e.g., a trend affecting >15% of the base). Omit if no significant shifts."),
});

export type GenerateAnalyticsInsightsOutput = z.infer<typeof GenerateAnalyticsInsightsOutputSchema>;

export async function generateAnalyticsInsights(): Promise<GenerateAnalyticsInsightsOutput> {
  return generateAnalyticsInsightsFlow();
}

const analyticsPrompt = ai.definePrompt({
  name: 'analyticsInsightsPrompt',
  input: { schema: z.any() }, // Input is the array of profiles
  output: { schema: GenerateAnalyticsInsightsOutputSchema },
  prompt: `You are a world-class cultural sociologist and market intelligence analyst. Your task is to analyze a database of anonymized customer cultural profiles to generate a comprehensive trend report and predictive analysis. Assume the data is chronological.

Analyze the following customer profiles:
{{{json profiles}}}

Based on this entire dataset, perform the following analysis:
1.  **Overall Summary**: Provide a high-level summary of the most critical insights a marketing director would need to know.
2.  **Identify Key Patterns**: Find 3-5 of the most significant recurring cultural patterns.
3.  **Generate Predictions**: Create specific predictions for Purchase Likelihood, Churn Risk, Brand Advocacy, and Upsell Opportunities.
4.  **Cultural Trend Monitoring**:
    - **Top 5 Emerging Interests**: Identify the top 5 cultural interests that are gaining popularity among the customer base.
    - **Top 5 Declining Interests**: Identify the top 5 cultural interests that are losing engagement.
5.  **Seasonal Behavior Forecasts**: Predict behavior for 2-3 key segments during upcoming seasons or major holidays.
6.  **Market Intelligence**:
    - **Market Opportunity Gaps**: Identify 2-3 potential market opportunities where customer preferences appear to be underserved.
    - **Competitive Intelligence**: Provide a brief analysis of how these trends could create a competitive advantage. What cultural positioning should the business take?
7.  **Data Shift Alert**: Determine if there are any recent, significant shifts in the overall data patterns (e.g., a single trend rapidly growing to affect >15% of the customer base). If so, generate a concise alert message. If not, omit this field.

Synthesize all of this into the specified JSON format to power a trend monitoring dashboard.
`,
});

const generateAnalyticsInsightsFlow = ai.defineFlow(
  {
    name: 'generateAnalyticsInsightsFlow',
    outputSchema: GenerateAnalyticsInsightsOutputSchema,
  },
  async () => {
    await dbConnect();
    const profiles = await CustomerProfile.find({}).lean();

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
        profilesForPrompt = profiles;
    }


    const { output } = await analyticsPrompt({ profiles: profilesForPrompt });

    if (!output) {
      throw new Error('The AI model did not return a valid analytics report.');
    }
    
    return output;
  }
);
