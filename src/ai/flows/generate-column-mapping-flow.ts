
'use server';

/**
 * @fileOverview Analyzes CSV headers and preview data to intelligently map columns to system fields.
 *
 * - generateColumnMapping - The main flow function.
 * - GenerateColumnMappingInput - Input schema for the flow.
 * - GenerateColumnMappingOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateColumnMappingInputSchema = z.object({
  headers: z.array(z.string()).describe('The list of header columns from the CSV file.'),
  previewData: z.array(z.array(z.string())).describe('A 2D array representing the first 5 rows of data from the CSV for context.'),
});

export type GenerateColumnMappingInput = z.infer<typeof GenerateColumnMappingInputSchema>;

// The output is a simple key-value mapping object.
// The key is the original CSV header, and the value is the system field it maps to.
const GenerateColumnMappingOutputSchema = z.record(z.string());
export type GenerateColumnMappingOutput = z.infer<typeof GenerateColumnMappingOutputSchema>;


export async function generateColumnMapping(input: GenerateColumnMappingInput): Promise<GenerateColumnMappingOutput> {
  return generateColumnMappingFlow(input);
}


const mappingPrompt = ai.definePrompt({
    name: 'columnMappingPrompt',
    input: { schema: GenerateColumnMappingInputSchema },
    output: { schema: GenerateColumnMappingOutputSchema },
    prompt: `You are a data mapping expert. Your task is to analyze the headers and preview data from a user's CSV file and map them to a predefined set of system fields.

The required system fields are:
- 'age_range': Represents the age bracket of the customer (e.g., '25-34', '45-54'). Look for columns with ages or birth years.
- 'spending_level': Represents the customer's spending tier (e.g., 'Low', 'Medium', 'High'). Look for columns with currency values, LTV, or descriptive tiers.
- 'purchase_categories': Represents the types of products or services the customer has bought. This is the most important field. Look for columns with product names, categories, or descriptions.
- 'interaction_frequency': Represents how often the customer interacts with the brand (e.g., 'Low', 'Medium', 'High', 'Weekly'). Look for columns with visit counts or interaction descriptions.

Instructions:
1. Analyze both the headers and the data in each column.
2. For each CSV header, determine which of the four system fields it best corresponds to.
3. If a column does not seem to match any of the system fields, map it to 'unmapped'.
4. It is possible for multiple CSV columns to map to the same system field, but try to find the best, primary match for each system field. For example, if both 'Product' and 'LifetimeValueUSD' columns exist, 'Product' should map to 'purchase_categories' and 'LifetimeValueUSD' should map to 'spending_level'.

Your response must be a valid JSON object where each key is a CSV header and the value is the corresponding system field ('age_range', 'spending_level', 'purchase_categories', 'interaction_frequency') or 'unmapped'.

CSV Headers:
{{{json headers}}}

CSV Data Preview (first 5 rows):
{{{json previewData}}}
`,
  }
);


export const generateColumnMappingFlow = ai.defineFlow(
  {
    name: 'generateColumnMappingFlow',
    inputSchema: GenerateColumnMappingInputSchema,
    outputSchema: GenerateColumnMappingOutputSchema,
  },
  async (input) => {
    
    const { output } = await mappingPrompt(input);

    if (!output) {
      throw new Error('The AI model did not return a valid mapping.');
    }
    return output;
  }
);
