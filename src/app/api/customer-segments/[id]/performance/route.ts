
import dbConnect from "@/lib/mongoose";
import Segment from "@/models/segment";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {

    const { id } = params;
    const { actualROI } = await req.json();

    if (typeof actualROI !== 'number') {
        return NextResponse.json({ message: "Invalid ROI value" }, { status: 400 });
    }

    try {
        await dbConnect();
        
        const updatedSegment = await Segment.findByIdAndUpdate(
            id,
            { actualROI: actualROI },
            { new: true }
        );

        if (!updatedSegment) {
            return NextResponse.json({ message: "Segment not found" }, { status: 404 });
        }

        return NextResponse.json(updatedSegment, { status: 200 });
    } catch (error: any) {
        console.error("Failed to save performance data:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}

