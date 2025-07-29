
import { conversationalInsights, ConversationalInsightsInput } from '@/ai/flows/conversational-insights-flow';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const input: ConversationalInsightsInput = await req.json();

        if (!input.query) {
            return NextResponse.json({ message: "Missing query parameter" }, { status: 400 });
        }

        const response = await conversationalInsights(input);

        return NextResponse.json(response, { status: 200 });
    } catch (error: any) {
        console.error("Failed to get conversational insight:", error);
        return NextResponse.json({ message: "Failed to get conversational insight.", error: error.message }, { status: 500 });
    }
}

    