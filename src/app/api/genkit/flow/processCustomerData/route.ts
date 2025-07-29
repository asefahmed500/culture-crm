
import { processCustomerData, ProcessCustomerDataInput } from '@/ai/flows/process-customer-data-flow';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const input: ProcessCustomerDataInput = await req.json();

    if (!input.csvData || !input.columnMapping) {
      return NextResponse.json({ message: 'Missing csvData or columnMapping' }, { status: 400 });
    }

    const result = await processCustomerData(input);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Failed to process customer data:', error);
    return NextResponse.json({ message: 'Failed to process customer data.', error: error.message }, { status: 500 });
  }
}

    
