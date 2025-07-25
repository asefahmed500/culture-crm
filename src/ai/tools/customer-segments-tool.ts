
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import Segment from '@/models/segment';

const SegmentToolSchema = z.object({
    segmentName: z.string(),
    topCulturalCharacteristics: z.array(z.string()),
    communicationPreferences: z.string(),
    lovedProductCategories: z.array(z.string()),
    bestMarketingChannels: z.array(z.string()),
    potentialLifetimeValue: z.string(),
});

export const getCustomerSegmentsTool = ai.defineTool(
  {
    name: 'getCustomerSegments',
    description: 'Returns a list of all defined customer segments and their detailed personas. Use this to answer questions about specific segments.',
    inputSchema: z.object({}), // No input needed
    outputSchema: z.array(SegmentToolSchema),
  },
  async () => {
    await dbConnect();
    const segments = await Segment.find({}).sort({ businessOpportunityRank: 'asc' }).lean();

    // Return a subset of the segment data that's most useful for answering questions
    return segments.map(s => ({
        segmentName: s.segmentName,
        topCulturalCharacteristics: s.topCulturalCharacteristics,
        communicationPreferences: s.communicationPreferences,
        lovedProductCategories: s.lovedProductCategories,
        bestMarketingChannels: s.bestMarketingChannels,
        potentialLifetimeValue: s.potentialLifetimeValue,
    }));
  }
);
