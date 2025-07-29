
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
import { generateCulturalDna } from './generate-cultural-dna-flow';


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

// A simple helper to parse CSV text
function parseCsv(csvText: string, mapping: Record<string, string>): Array<Record<string, any>> {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return []; // Not enough data to process

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const records = lines.slice(1);
    
    const requiredSystemFields = ['age_range', 'spending_level', 'purchase_categories', 'interaction_frequency'];
    
    const reverseMapping: Record<string, string> = {};
    for (const key in mapping) {
        if (mapping[key]) {
            reverseMapping[mapping[key]] = key;
        }
    }

    return records.map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length !== headers.length) return null; // Skip malformed rows
        
        const record: Record<string, any> = {};

        for (const field of requiredSystemFields) {
            const csvHeader = reverseMapping[field];
            if (csvHeader) {
                const headerIndex = headers.indexOf(csvHeader);
                if (headerIndex !== -1 && values[headerIndex]) {
                    const value = values[headerIndex];
                    if (field === 'purchase_categories' && typeof value === 'string') {
                        // Split by comma or semicolon for more flexibility
                        record[field] = value.split(/[;,|]/).map(item => item.trim()).filter(Boolean);
                    } else {
                        record[field] = value;
                    }
                }
            }
        }
        return record;
    }).filter(record => record !== null) as Array<Record<string, any>>;
}


// Define the Genkit flow
export const processCustomerDataFlow = ai.defineFlow(
  {
    name: 'processCustomerDataFlow',
    inputSchema: ProcessCustomerDataInputSchema,
    outputSchema: ProcessCustomerDataOutputSchema,
  },
  async (input) => {
    // 1. Manually parse the CSV data first for reliability.
    const parsedRecords = parseCsv(input.csvData, input.columnMapping);

    if (!parsedRecords || parsedRecords.length === 0) {
      throw new Error('Could not parse any valid records from the CSV file. Please check the file format.');
    }

    // 2. Connect to the database
    await dbConnect();

    // 3. Enrich and save the processed data to MongoDB
    let recordsSaved = 0;
    const customerDocsToSave = [];

    for (const record of parsedRecords) {
      const behavioralData = {
          ageRange: record.age_range as string || '',
          spendingLevel: record.spending_level as string || '',
          purchaseCategories: record.purchase_categories as string[] || [],
          interactionFrequency: record.interaction_frequency as string || '',
      };

      const hasAnyData = behavioralData.ageRange || behavioralData.spendingLevel || behavioralData.interactionFrequency || (behavioralData.purchaseCategories && behavioralData.purchaseCategories.length > 0);

      if (hasAnyData) {
          try {
              // Generate DNA only if purchase categories are available, as it's the primary input for Qloo.
              const culturalDNA = (behavioralData.purchaseCategories && behavioralData.purchaseCategories.length > 0)
                  ? await generateCulturalDna(behavioralData)
                  : undefined;
              customerDocsToSave.push({ ...behavioralData, culturalDNA });
          } catch (e: any) {
              console.error(`Failed to generate cultural DNA for a record: ${e.message}. Saving record without DNA.`);
              // Save the record even if DNA generation fails to not lose data.
              customerDocsToSave.push(behavioralData);
          }
      }
    }
    
    if(customerDocsToSave.length > 0) {
      // Clear existing profiles before importing new ones to prevent data duplication.
      await CustomerProfile.deleteMany({});
      const result = await CustomerProfile.insertMany(customerDocsToSave, { ordered: false }); // ordered:false to continue on errors
      recordsSaved = result.length;
    }

    // 4. Calculate final metrics
    const totalRecords = parsedRecords.length;
    const completedFields = parsedRecords.reduce((acc, record) => {
        if (record.age_range) acc++;
        if (record.spending_level) acc++;
        if (record.purchase_categories && record.purchase_categories.length > 0) acc++;
        if (record.interaction_frequency) acc++;
        return acc;
    }, 0);
    const completeness = totalRecords > 0 ? (completedFields / (totalRecords * 4)) * 100 : 0;
    
    // 5. Return the final output
    return {
      recordsProcessed: totalRecords,
      recordsSaved,
      dataQuality: {
        completeness: isNaN(completeness) ? 0 : completeness,
      },
      processedData: parsedRecords, // Return the data that was actually processed and saved
      summary: `${recordsSaved} of ${totalRecords} customer profiles were successfully imported and enriched.`,
    };
  }
);
