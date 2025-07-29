
import { generateCampaignBrief, GenerateCampaignBriefInput } from "@/ai/flows/generate-campaign-brief-flow";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const input: GenerateCampaignBriefInput = await req.json();

        if (!input.segmentName) {
            return NextResponse.json({ message: "Missing segmentName parameter" }, { status: 400 });
        }

        const brief = await generateCampaignBrief(input);

        return NextResponse.json(brief, { status: 200 });
    } catch (error: any) {
        console.error("Failed to generate campaign brief:", error);
        return NextResponse.json({ message: "Failed to generate campaign brief.", error: error.message }, { status: 500 });
    }
}

    
