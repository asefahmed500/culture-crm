
import dbConnect from "@/lib/mongoose";
import CustomerProfile from "@/models/customer-profile";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        
        const profiles = await CustomerProfile.find({}).sort({ createdAt: -1 });

        return NextResponse.json(profiles, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch customer profiles:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
