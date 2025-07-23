import dbConnect from "@/lib/mongoose";
import Settings from "@/models/settings";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        // There should only be one settings document.
        const settings = await Settings.findOne({ singleton: true });
        
        if (!settings) {
            return NextResponse.json({ message: "No settings found" }, { status: 404 });
        }

        return NextResponse.json(settings, { status: 200 });
    } catch (error: any) {
        console.error("Failed to fetch settings:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        await dbConnect();

        const { averageLTV, averageConversionRate, averageCPA } = body;

        // Use `findOneAndUpdate` with `upsert: true` to either create the settings document if it doesn't exist,
        // or update it if it does. The query `{ singleton: true }` ensures we always target the same single document.
        const updatedSettings = await Settings.findOneAndUpdate(
            { singleton: true },
            { 
                averageLTV,
                averageConversionRate,
                averageCPA,
                singleton: true // ensure this field is set on creation
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json(updatedSettings, { status: 200 });

    } catch (error: any) {
        console.error("Failed to save settings:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
