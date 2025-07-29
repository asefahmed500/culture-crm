
import { generateCommunicationStrategy, GenerateCommunicationStrategyInput } from "@/ai/flows/generate-communication-strategy-flow";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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

    