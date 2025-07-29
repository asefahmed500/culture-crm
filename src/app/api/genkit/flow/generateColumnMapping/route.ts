
import { generateColumnMapping, GenerateColumnMappingInput } from "@/ai/flows/generate-column-mapping-flow";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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

    