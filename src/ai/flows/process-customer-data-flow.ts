
'use server';

/**
 * @fileOverview Processes raw customer CSV data, saves it to the database, 
 * and generates anonymous behavioral profiles.
 *
 * - processCustomerData - The main flow function for processing customer data.
 * - ProcessCustomerDataInput - Input schema for the flow.
 * - ProcessCustomerDataOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import CustomerProfile from '@/models/customer-profile';

// Define Zod schema for input validation
const ProcessCustomerDataInputSchema = z.object({
  csvData: z.string().describe('The raw customer data in CSV format as a single string.'),
  columnMapping: z.record(z.string()).describe('A mapping of CSV headers to system fields.'),
});
export type ProcessCustomerDataInput = z.infer<typeof ProcessCustomerDataInputSchema>;


// Define Zod schema for the structured output
const ProcessCustomerDataOutputSchema = z.object({
  recordsProcessed: z.number().describe('The total number of records processed from the CSV.'),
  recordsSaved: z.number().describe('The total number of valid records saved to the database.'),
  dataQuality: z.object({
    completeness: z.number().describe('The percentage of required fields that were successfully filled across all records.'),
    // We can add more quality metrics here later
  }),
  processedData: z.array(z.record(z.string().or(z.array(z.string()))))
    .describe('An array of processed customer objects with standardized fields and extracted behavioral patterns. PII has been removed.'),
  summary: z.string().describe('A brief summary of the data processing results.'),
});
export type ProcessCustomerDataOutput = z.infer<typeof ProcessCustomerDataOutputSchema>;

// Exported wrapper function that calls the flow
export async function processCustomerData(input: ProcessCustomerDataInput): Promise<ProcessCustomerDataOutput> {
  return await processCustomerDataFlow(input);
}

// Define the Genkit prompt
const customerDataPrompt = ai.definePrompt({
  name: 'customerDataPrompt',
  input: { schema: ProcessCustomerDataInputSchema },
  // The prompt's output schema is slightly different, it doesn't need the `recordsSaved` field
  output: { schema: ProcessCustomerDataOutputSchema.omit({ recordsSaved: true }) },
  prompt: `You are a data processing expert for a Cultural Intelligence CRM. Your task is to process raw customer data from a CSV file, enrich it, and prepare it for analysis, ensuring all Personally Identifiable Information (PII) is removed.

Here is the raw CSV data:
\`\`\`csv
{{{csvData}}}
\`\`\`

Here is the column mapping provided by the user. The key is the original CSV header, and the value is the system field it maps to.
\`\`\`json
{{{json columnMapping}}}
\`\`\`

Follow these steps precisely:
1.  **Parse the CSV Data**: Read the provided CSV string. The first row is the header.
2.  **Apply Column Mapping**: Use the \`columnMapping\` to identify the data for the required fields: 'age_range', 'spending_level', 'purchase_categories', 'interaction_frequency'.
3.  **PII Removal**: Absolutely ensure that any fields NOT in the mapping are completely discarded. Do not include any potential PII like names, emails, addresses, etc., in the output.
4.  **Data Standardization & Cleaning**:
    -   **age_range**: Standardize values into brackets like '18-24', '25-34', '35-44', '45-54', '55+'.
    -   **spending_level**: Standardize into 'Low', 'Medium', 'High'.
    -   **purchase_categories**: Clean up and standardize categories. This should be an array of strings.
    -   **interaction_frequency**: Standardize into 'Low', 'Medium', 'High', 'Very High'.
    -   For any missing or un-parseable required data, leave the field as an empty string or empty array.
5.  **Calculate Metrics**:
    -   Count the total number of data rows processed (excluding the header).
    -   Calculate the data completeness: For each record, count how many of the 4 required fields have a non-empty value. The final completeness score should be the average completeness percentage across all records.
6.  **Generate Output**: Create a JSON object matching the defined output schema. The \`processedData\` array should contain one object per processed customer row, containing only the standardized, non-PII fields.`,
});

// Define the Genkit flow
const processCustomerDataFlow = ai.defineFlow(
  {
    name: 'processCustomerDataFlow',
    inputSchema: ProcessCustomerDataInputSchema,
    outputSchema: ProcessCustomerDataOutputSchema,
  },
  async (input) => {
    // 1. Call the AI model to process the data
    const { output } = await customerDataPrompt(input);

    if (!output) {
      throw new Error('The AI model did not return a valid output.');
    }

    // 2. Connect to the database
    await dbConnect();

    // 3. Save the processed data to MongoDB
    let recordsSaved = 0;
    if (output.processedData && output.processedData.length > 0) {
      const customerDocs = output.processedData.map(record => ({
        ageRange: record.age_range,
        spendingLevel: record.spending_level,
        purchaseCategories: record.purchase_categories,
        interactionFrequency: record.interaction_frequency,
      })).filter(doc => doc.ageRange || doc.spendingLevel || doc.purchaseCategories?.length || doc.interactionFrequency); // Filter out completely empty records
      
      if(customerDocs.length > 0) {
        const result = await CustomerProfile.insertMany(customerDocs);
        recordsSaved = result.length;
      }
    }
    
    // 4. Return the final output including the count of saved records
    return {
      ...output,
      recordsSaved,
    };
  }
);
