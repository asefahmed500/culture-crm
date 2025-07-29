
'use server';

import dbConnect from "@/lib/mongoose";
import CustomerProfile from "@/models/customer-profile";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { feedback } = await req.json();

    if (![-1, 1].includes(feedback)) {
        return NextResponse.json({ message: "Invalid feedback value" }, { status: 400 });
    }

    try {
        await dbConnect();
        
        const updatedProfile = await CustomerProfile.findByIdAndUpdate(
            id,
            { accuracyFeedback: feedback },
            { new: true }
        );

        if (!updatedProfile) {
            return NextResponse.json({ message: "Profile not found" }, { status: 404 });
        }

        return NextResponse.json(updatedProfile, { status: 200 });
    } catch (error: any) {
        console.error("Failed to save feedback:", error);
        return NextResponse.json({ message: "Failed to save feedback.", error: error.message }, { status: 500 });
    }
}
