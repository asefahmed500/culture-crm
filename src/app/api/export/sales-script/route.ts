
import { generateSalesScript } from "@/ai/flows/generate-sales-script-flow";
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

        const script = await generateSalesScript({ segmentName });

        return NextResponse.json(script, { status: 200 });
    } catch (error: any) {
        console.error("Failed to generate sales script:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
