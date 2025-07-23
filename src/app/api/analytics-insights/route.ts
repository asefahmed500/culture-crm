
import { generateAnalyticsInsights } from "@/ai/flows/generate-analytics-insights-flow";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const insights = await generateAnalyticsInsights();
        return NextResponse.json(insights, { status: 200 });
    } catch (error: any) {
        console.error("Failed to generate analytics insights:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
