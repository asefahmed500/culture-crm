
import { generateContentCalendar } from "@/ai/flows/generate-content-calendar-flow";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const calendar = await generateContentCalendar();
        return NextResponse.json(calendar, { status: 200 });
    } catch (error: any) {
        console.error("Failed to generate content calendar:", error);
        return NextResponse.json({ message: "Failed to generate content calendar.", error: error.message }, { status: 500 });
    }
}

    
