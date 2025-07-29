
import { generateSalesScript, GenerateSalesScriptInput } from "@/ai/flows/generate-sales-script-flow";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const input: GenerateSalesScriptInput = await req.json();

        if (!input.segmentName) {
            return NextResponse.json({ message: "Missing segmentName parameter" }, { status: 400 });
        }

        const script = await generateSalesScript(input);

        return NextResponse.json(script, { status: 200 });
    } catch (error: any) {
        console.error("Failed to generate sales script:", error);
        return NextResponse.json({ message: "Failed to generate sales script.", error: error.message }, { status: 500 });
    }
}

    
