
import { generateColumnMapping } from "@/ai/flows/generate-column-mapping-flow";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { headers, previewData } = await req.json();

        if (!headers || !previewData) {
            return NextResponse.json({ message: "Missing headers or previewData payload" }, { status: 400 });
        }
        
        const mapping = await generateColumnMapping({ headers, previewData });

        return NextResponse.json(mapping, { status: 200 });
    } catch (error: any) {
        console.error("Failed to generate smart column mapping:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
