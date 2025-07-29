
import { generateColumnMapping, GenerateColumnMappingInput } from "@/ai/flows/generate-column-mapping-flow";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const input: GenerateColumnMappingInput = await req.json();

        if (!input.headers || !input.previewData) {
            return NextResponse.json({ message: "Missing headers or previewData payload" }, { status: 400 });
        }
        
        const mapping = await generateColumnMapping(input);

        return NextResponse.json(mapping, { status: 200 });
    } catch (error: any) {
        console.error("Failed to generate smart column mapping:", error);
        return NextResponse.json({ message: "Failed to generate smart column mapping.", error: error.message }, { status: 500 });
    }
}

    
