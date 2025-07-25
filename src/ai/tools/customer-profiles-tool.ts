
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import CustomerProfile from '@/models/customer-profile';

const CustomerProfileToolOutputSchema = z.array(z.object({
  ageRange: z.string().optional(),
  spendingLevel: z.string().optional(),
  interactionFrequency: z.string().optional(),
  culturalDNA: z.object({
    music: z.object({ score: z.number(), preferences: z.array(z.string()) }),
    entertainment: z.object({ score: z.number(), preferences: z.array(z.string()) }),
    dining: z.object({ score: z.number(), preferences: z.array(z.string()) }),
    fashion: z.object({ score: z.number(), preferences: z.array(z.string()) }),
    travel: z.object({ score: z.number(), preferences: z.array(z.string()) }),
    socialCauses: z.object({ score: z.number(), preferences: z.array(z.string()) }),
  }).optional(),
}));

export const getCustomerProfilesTool = ai.defineTool(
  {
    name: 'getCustomerProfiles',
    description: 'Returns a list of all customer profiles, including their behavioral data and cultural DNA. Use this to answer questions about the entire customer base.',
    inputSchema: z.object({}), // No input needed
    outputSchema: CustomerProfileToolOutputSchema,
  },
  async () => {
    await dbConnect();
    const profiles = await CustomerProfile.find({}).lean();
    
    // Sanitize the data to only include what's necessary for the tool's purpose
    return profiles.map(p => ({
      ageRange: p.ageRange,
      spendingLevel: p.spendingLevel,
      interactionFrequency: p.interactionFrequency,
      // The AI doesn't need surprise connections or confidence for this type of query
      culturalDNA: p.culturalDNA ? {
          music: p.culturalDNA.music,
          entertainment: p.culturalDNA.entertainment,
          dining: p.culturalDNA.dining,
          fashion: p.culturalDNA.fashion,
          travel: p.culturalDNA.travel,
          socialCauses: p.culturalDNA.socialCauses,
      } : undefined
    }));
  }
);
