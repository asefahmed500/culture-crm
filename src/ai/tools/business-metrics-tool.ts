'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import Settings from '@/models/settings';

const BusinessMetricsSchema = z.object({
  averageLTV: z.number().describe('The average lifetime value of a customer in dollars.'),
  averageConversionRate: z.number().describe('The average campaign conversion rate as a percentage.'),
  averageCPA: z.number().describe('The average cost to acquire a new customer in dollars.'),
});

export const getBusinessMetricsTool = ai.defineTool(
  {
    name: 'getBusinessMetrics',
    description: 'Returns the current baseline business metrics for the company, such as LTV, Conversion Rate, and CPA.',
    inputSchema: z.object({}), // No input needed
    outputSchema: BusinessMetricsSchema,
  },
  async () => {
    console.log('Fetching business metrics from database...');
    await dbConnect();
    // There should only ever be one settings document.
    const settings = await Settings.findOne({ singleton: true }).lean();

    if (settings) {
      console.log('Found settings:', settings);
      return {
        averageLTV: settings.averageLTV,
        averageConversionRate: settings.averageConversionRate,
        averageCPA: settings.averageCPA,
      };
    }

    // Return default values if no settings are found
    console.log('No settings found, returning defaults.');
    return {
      averageLTV: 500,
      averageConversionRate: 2.5,
      averageCPA: 50,
    };
  }
);
