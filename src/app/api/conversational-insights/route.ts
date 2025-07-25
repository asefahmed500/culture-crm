
import { conversationalInsights } from "@/ai/flows/conversational-insights-flow";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ message: "Missing query parameter" }, { status: 400 });
        }

        const response = await conversationalInsights({ query });

        return NextResponse.json({ response }, { status: 200 });
    } catch (error: any) {
        console.error("Failed to get conversational insight:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
