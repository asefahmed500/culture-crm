
import { generateCampaignBrief } from "@/ai/flows/generate-campaign-brief-flow";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { segmentName } = await req.json();

        if (!segmentName) {
            return NextResponse.json({ message: "Missing segmentName parameter" }, { status: 400 });
        }

        const brief = await generateCampaignBrief({ segmentName });

        return NextResponse.json(brief, { status: 200 });
    } catch (error: any) {
        console.error("Failed to generate campaign brief:", error);
        return NextResponse.json({ message: "Failed to generate campaign brief.", error: error.message }, { status: 500 });
    }
}

    
