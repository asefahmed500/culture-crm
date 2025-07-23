
import dbConnect from "@/lib/mongoose";
import CustomerProfile from "@/models/customer-profile";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        
        const profiles = await CustomerProfile.find({}).sort({ createdAt: -1 });

        return NextResponse.json(profiles, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch customer profiles:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
