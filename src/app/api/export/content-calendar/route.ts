
import { generateContentCalendar } from "@/ai/flows/generate-content-calendar-flow";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const calendar = await generateContentCalendar();
        return NextResponse.json(calendar, { status: 200 });
    } catch (error: any) {
        console.error("Failed to generate content calendar:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
