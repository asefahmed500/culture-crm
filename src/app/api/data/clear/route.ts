
'use server';

import dbConnect from "@/lib/mongoose";
import CustomerProfile from "@/models/customer-profile";
import Segment from "@/models/segment";
import Campaign from "@/models/campaign";
import Story from "@/models/story";
import Settings from "@/models/settings";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();

        const profileDeletion = await CustomerProfile.deleteMany({});
        const segmentDeletion = await Segment.deleteMany({});
        const campaignDeletion = await Campaign.deleteMany({});
        const storyDeletion = await Story.deleteMany({});
        // We do not delete the Settings document, as it might contain valuable baseline metrics.
        // If you want to reset settings, it should be done manually.

        return NextResponse.json({ 
            message: "All customer-related data has been cleared successfully.",
            deletedCounts: {
                customerProfiles: profileDeletion.deletedCount,
                segments: segmentDeletion.deletedCount,
                campaigns: campaignDeletion.deletedCount,
                stories: storyDeletion.deletedCount,
            }
        }, { status: 200 });
        
    } catch (error: any) {
        console.error("Failed to clear data:", error);
        return NextResponse.json({ message: "Failed to clear data.", error: error.message }, { status: 500 });
    }
}
