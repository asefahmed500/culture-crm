
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
        const segments = await Segment.find({}).sort({ businessOpportunityRank: 'asc' });
        
        // This is a stand-in for fetching top campaign ideas and summary,
        // which are not stored with individual segments.
        // In a real app, these might be stored in a separate "Report" collection.
        const responsePayload = {
            segments: segments,
            summary: segments.length > 0 ? `Found ${segments.length} saved segments. Displaying from database.` : "No saved segments found.",
            topCampaignIdeas: [], // This would need a more complex implementation to store/retrieve
        };
        
        return NextResponse.json(responsePayload, { status: 200 });

    } catch (error: any) {
        console.error("Failed to fetch customer segments:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}


// This function now triggers the generation and saving of new segments
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const segments = await generateCustomerSegments();
        return NextResponse.json(segments, { status: 200 });
    } catch (error: any) {
        console.error("Failed to generate customer segments:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
