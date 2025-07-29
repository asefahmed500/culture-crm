'use server';

import { generateCustomerSegments } from "@/ai/flows/generate-customer-segments-flow";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import Segment from "@/models/segment";

// This function now fetches saved segments from the database
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        const segments = await Segment.find({}).sort({ businessOpportunityRank: 'asc' }).lean();
        
        let summary = "No segments have been generated yet.";
        if (segments && segments.length > 0) {
            summary = `Found ${segments.length} saved segments. Displaying from database.`;
        }

        // This is a stand-in for fetching top campaign ideas,
        // which are not stored with individual segments.
        // In a real app, these might be stored in a separate "Report" collection.
        const responsePayload = {
            segments: segments || [],
            summary: summary,
            topCampaignIdeas: [], // This would need a more complex implementation to store/retrieve
        };
        
        return NextResponse.json(responsePayload, { status: 200 });

    } catch (error: any) {
        console.error("Failed to fetch customer segments:", error);
        return NextResponse.json({ message: "Failed to fetch customer segments: " + error.message }, { status: 500 });
    }
}


// This function now triggers the generation and saving of new segments
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const segmentsData = await generateCustomerSegments();
        return NextResponse.json(segmentsData, { status: 200 });
    } catch (error: any)
        {
        console.error("Failed to generate customer segments:", error);
        // Ensure a consistent error structure
        return NextResponse.json({ message: "Failed to generate customer segments.", error: error.message }, { status: 500 });
    }
}
