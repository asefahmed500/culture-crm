
import { generateAnalyticsInsights } from "@/ai/flows/generate-analytics-insights-flow";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const insights = await generateAnalyticsInsights();
        return NextResponse.json(insights, { status: 200 });
    } catch (error: any) {
        console.error("Failed to generate analytics insights:", error);
        return NextResponse.json({ message: "Failed to generate analytics insights.", error: error.message }, { status: 500 });
    }
}

    
