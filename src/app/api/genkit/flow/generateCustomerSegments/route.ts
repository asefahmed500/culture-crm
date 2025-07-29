
import { generateCustomerSegments } from "@/ai/flows/generate-customer-segments-flow";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const segmentsData = await generateCustomerSegments();
        return NextResponse.json(segmentsData, { status: 200 });
    } catch (error: any) {
        console.error("Failed to generate customer segments:", error);
        return NextResponse.json({ message: "Failed to generate customer segments.", error: error.message }, { status: 500 });
    }
}

    
