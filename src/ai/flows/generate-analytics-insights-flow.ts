
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

const GenerateAnalyticsInsightsOutputSchema = z.object({
  overallSummary: z.string().describe("A high-level summary of the most important findings from the analysis."),
  keyPatterns: z.array(z.string()).describe("List of 3-5 key behavioral or cultural patterns identified across the entire customer base."),
  predictions: z.object({
    purchaseLikelihood: PredictionSchema,
    churnRisk: PredictionSchema,
    brandAdvocacy: PredictionSchema,
    upsellOpportunity: PredictionSchema,
  }),
  emergingTrends: z.array(TrendSchema).describe("A list of 2-3 emerging cultural or behavioral trends."),
  seasonalForecasts: z.array(SeasonalForecastSchema).describe("2-3 seasonal behavior forecasts for key customer segments."),
  dataShiftAlert: z.string().optional().describe("An alert message if a significant shift in customer data patterns is detected. Omit if no significant shifts."),
});

export type GenerateAnalyticsInsightsOutput = z.infer<typeof GenerateAnalyticsInsightsOutputSchema>;

export async function generateAnalyticsInsights(): Promise<GenerateAnalyticsInsightsOutput> {
  return generateAnalyticsInsightsFlow();
}

const analyticsPrompt = ai.definePrompt({
  name: 'analyticsInsightsPrompt',
  input: { schema: z.any() }, // Input is the array of profiles
  output: { schema: GenerateAnalyticsInsightsOutputSchema },
  prompt: `You are a world-class marketing analyst and data scientist. Your task is to analyze a database of anonymized customer cultural profiles and generate a predictive analytics report.

Analyze the following customer profiles:
{{{json profiles}}}

Based on this entire dataset, perform the following analysis:
1.  **Overall Summary**: Provide a high-level summary of the most critical insights a marketing director would need to know.
2.  **Identify Key Patterns**: Find 3-5 of the most significant recurring patterns. For example, "Customers with high affinity for 'indie music' and 'vintage fashion' also show a strong preference for 'artisanal coffee shops', indicating a 'Modern Hipster' persona."
3.  **Generate Predictions**: Create specific, actionable predictions for the following categories. For each, describe the segment, the prediction, a confidence score, and a recommendation.
    -   **Purchase Likelihood**: Which segment is most likely to purchase a premium product soon?
    -   **Churn Risk**: Which segment shows the highest risk of churning in the next 90 days?
    -   **Brand Advocacy**: Which segment has the highest potential to become strong brand advocates?
    -   **Upsell Opportunity**: Which segment is most ripe for an upsell or cross-sell campaign?
4.  **Identify Emerging Trends**: Detect 2-3 emerging cultural or behavioral trends within the data that might not be obvious yet.
5.  **Seasonal Behavior Forecasts**: Based on cultural affinities, predict how 2-3 key segments might behave during upcoming seasons or major holidays (e.g., Summer, Holiday Season). For each, describe the segment, the predicted behavior, and a relevant marketing recommendation.
6.  **Data Shift Alert**: Determine if there are any recent, significant shifts in the overall data patterns compared to historical norms (assume data is chronological). If so, generate a concise alert message. If not, omit this field.

Synthesize all of this into the specified JSON format to power an analytics dashboard.
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

    // To prevent exceeding context window limits, we'll summarize if there are too many profiles.
    // This is a simple summarization; more complex logic could be used for larger datasets.
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
