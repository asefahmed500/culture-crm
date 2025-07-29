
'use server';

import dbConnect from "@/lib/mongoose";
import Segment from "@/models/segment";
import Campaign from "@/models/campaign";
import { NextRequest, NextResponse } from "next/server";

// This function now fetches saved segments from the database
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const segments = await Segment.find({}).sort({ businessOpportunityRank: 'asc' }).lean();
        const campaigns = await Campaign.find({}).sort({ createdAt: -1 }).limit(3).lean();
        
        let summary = "No segments have been generated yet.";
        if (segments && segments.length > 0) {
            summary = `Found ${segments.length} saved segments. Displaying from database.`;
        }

        const responsePayload = {
            segments: segments || [],
            summary: summary,
            topCampaignIdeas: campaigns || [],
        };
        
        return NextResponse.json(responsePayload, { status: 200 });

    } catch (error: any) {
        console.error("Failed to fetch customer segments:", error);
        return NextResponse.json({ message: "Failed to fetch customer segments: " + error.message }, { status: 500 });
    }
}
