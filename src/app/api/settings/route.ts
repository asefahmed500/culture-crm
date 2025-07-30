
'use server';

import dbConnect from "@/lib/mongoose";
import Settings from "@/models/settings";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        // There should only ever be one settings document.
        const settings = await Settings.findOne({ singleton: true }).lean();
        
        if (!settings) {
            // Return default values if no settings found.
            return NextResponse.json({
                averageLTV: 0,
                averageConversionRate: 0,
                averageCPA: 0
            }, { status: 200 });
        }

        return NextResponse.json(settings, { status: 200 });
    } catch (error: any) {
        console.error("Failed to fetch settings:", error);
        return NextResponse.json({ message: "Failed to fetch settings.", error: error.message }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        await dbConnect();

        const { averageLTV, averageConversionRate, averageCPA } = body;

        // Use `findOneAndUpdate` with `upsert: true` to either create the settings document if it doesn't exist,
        // or update it if it does. The query `{ singleton: true }` ensures we always target the same single document.
        const updatedSettings = await Settings.findOneAndUpdate(
            { singleton: true },
            { 
                averageLTV: Number(averageLTV) || 0,
                averageConversionRate: Number(averageConversionRate) || 0,
                averageCPA: Number(averageCPA) || 0,
                singleton: true // ensure this field is set on creation
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json(updatedSettings, { status: 200 });

    } catch (error: any) {
        console.error("Failed to save settings:", error);
        return NextResponse.json({ message: "Failed to save settings.", error: error.message }, { status: 500 });
    }
}
