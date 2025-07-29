
import { generateCommunicationStrategy, GenerateCommunicationStrategyInput } from "@/ai/flows/generate-communication-strategy-flow";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const culturalDNA: GenerateCommunicationStrategyInput = await req.json();

        if (!culturalDNA) {
            return NextResponse.json({ message: "Missing culturalDNA payload" }, { status: 400 });
        }

        const strategy = await generateCommunicationStrategy(culturalDNA);

        return NextResponse.json(strategy, { status: 200 });
    } catch (error: any) {
        console.error("Failed to generate communication strategy:", error);
        return NextResponse.json({ message: "Failed to generate communication strategy.", error: error.message }, { status: 500 });
    }
}

    
