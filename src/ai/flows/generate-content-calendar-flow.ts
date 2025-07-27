
'use server';

/**
 * @fileOverview Generates a 30-day content calendar based on the overall cultural profile of the customer base.
 *
 * - generateContentCalendar - The main flow function.
 * - GenerateContentCalendarOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import CustomerProfile from '@/models/customer-profile';

const CalendarDaySchema = z.object({
  day: z.number().describe("The day of the month (1-30)."),
  theme: z.string().describe("The content theme for the day (e.g., 'Wellness Wednesday', 'Throwback Thursday')."),
  platform: z.string().describe("The primary social media platform for this post (e.g., 'Instagram', 'TikTok', 'Email Newsletter')."),
  postSuggestion: z.string().describe("A specific and creative post idea for the day that aligns with the customer base's cultural interests."),
  culturalTieIn: z.string().describe("Crucially, explain how this post ties into a specific cultural trend, holiday, or event relevant to the customer base. This simulates a cultural calendar."),
});

const GenerateContentCalendarOutputSchema = z.object({
  summary: z.string().describe("A high-level summary of the content strategy for the month, including which cultural trends and events it leans into."),
  calendar: z.array(CalendarDaySchema).length(30).describe("An array of 30 days of content ideas."),
});

export type GenerateContentCalendarOutput = z.infer<typeof GenerateContentCalendarOutputSchema>;

export async function generateContentCalendar(): Promise<GenerateContentCalendarOutput> {
  return generateContentCalendarFlow();
}

const calendarPrompt = ai.definePrompt({
  name: 'contentCalendarPrompt',
  input: { schema: z.any() }, // Input is the array of profiles
  output: { schema: GenerateContentCalendarOutputSchema },
  prompt: `You are a creative and strategic social media manager with a deep understanding of cultural trends. Your task is to generate a 30-day content calendar for an e-commerce brand based on an analysis of its customer base's cultural DNA. The goal is to create content that resonates deeply by timing it with relevant cultural moments.

Analyze the key cultural trends from the following sample of customer profiles:
{{{json profiles}}}

Based on this data, create a content calendar for the next 30 days.
1.  **Summarize the Strategy**: Write a short summary of the overarching content strategy. What are the main cultural trends to focus on and why?
2.  **Generate 30 Days of Content**: For each day from 1 to 30, provide:
    *   A creative content **theme**.
    *   The best **platform** for the post.
    *   A specific **post suggestion** that feels authentic and engaging.
    *   A **Cultural Tie-In**: This is the most important part. Explain how the post connects to a relevant cultural event, holiday, or trend identified in the data. For example: "Day 15: Post about sustainable fashion. Cultural Tie-In: This aligns with the 'eco-conscious' trend and comes just before Earth Day." This simulates a cultural calendar API.

Make the content ideas engaging, creative, and tailored to the cultural interests revealed in the customer data. Ensure there is a good mix of content types and platforms. Avoid generic ideas.

Format the output in the specified JSON format.
`,
});

const generateContentCalendarFlow = ai.defineFlow(
  {
    name: 'generateContentCalendarFlow',
    outputSchema: GenerateContentCalendarOutputSchema,
  },
  async () => {
    await dbConnect();
    const profiles = await CustomerProfile.find({}).lean();

    // To prevent exceeding context window limits, we'll summarize a sample of profiles.
    const MAX_PROFILES_FOR_ANALYSIS = 50;
    let profilesForPrompt;
    if (profiles.length > MAX_PROFILES_FOR_ANALYSIS) {
        profilesForPrompt = profiles.slice(0, MAX_PROFILES_FOR_ANALYSIS).map(p => ({
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


    const { output } = await calendarPrompt({ profiles: profilesForPrompt });

    if (!output) {
      throw new Error('The AI model did not return a valid content calendar.');
    }
    
    return output;
  }
);
