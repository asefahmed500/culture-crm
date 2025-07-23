
import dbConnect from "@/lib/mongoose";
import CustomerProfile from "@/models/customer-profile";
import { generateCustomerSegments } from "@/ai/flows/generate-customer-segments-flow";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Helper function to find which segment a profile belongs to.
// This is computationally intensive and not ideal for production.
// A better approach would be to save the segment assignment to the profile.
const findSegmentForProfile = (profile: any, segments: any[]) => {
    let bestSegment = 'Uncategorized';
    let highestScore = -1;

    if (!profile.culturalDNA) return bestSegment;

    segments.forEach(segment => {
        let score = 0;
        const profileDna = profile.culturalDNA;

        // Simple scoring mechanism: check if segment characteristics are present in profile preferences
        segment.topCulturalCharacteristics.forEach((char: string) => {
            if (profileDna.music.preferences.includes(char)) score++;
            if (profileDna.entertainment.preferences.includes(char)) score++;
            if (profileDna.dining.preferences.includes(char)) score++;
            if (profileDna.fashion.preferences.includes(char)) score++;
            if (profileDna.travel.preferences.includes(char)) score++;
            if (profileDna.socialCauses.preferences.includes(char)) score++;
        });
        
        if (score > highestScore) {
            highestScore = score;
            bestSegment = segment.segmentName;
        }
    });

    return bestSegment;
};


const getTopAffinities = (dna: any) => {
    if (!dna) return [];
    const affinities = [
        { name: 'Music', score: dna.music.score },
        { name: 'Entertainment', score: dna.entertainment.score },
        { name: 'Dining', score: dna.dining.score },
        { name: 'Fashion', score: dna.fashion.score },
        { name: 'Travel', score: dna.travel.score },
        { name: 'Social Causes', score: dna.socialCauses.score },
    ];
    return affinities.sort((a, b) => b.score - a.score).slice(0, 3).map(a => `${a.name} (${a.score.toFixed(0)}%)`);
};


export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        
        // Fetch profiles and generated segments
        const profiles = await CustomerProfile.find({}).lean();
        const segmentationResult = await generateCustomerSegments();
        const segments = segmentationResult.segments;

        // Create CSV header
        const headers = [
            "customerId",
            "assignedSegment",
            "topAffinity1",
            "topAffinity2",
            "topAffinity3",
            "interactionFrequency",
            "spendingLevel",
        ];
        
        let csvContent = headers.join(",") + "\n";

        // Create CSV rows
        profiles.forEach(profile => {
            const segmentName = findSegmentForProfile(profile, segments);
            const topAffinities = getTopAffinities(profile.culturalDNA);

            const row = [
                profile._id,
                segmentName,
                topAffinities[0] || 'N/A',
                topAffinities[1] || 'N/A',
                topAffinities[2] || 'N/A',
                profile.interactionFrequency || 'N/A',
                profile.spendingLevel || 'N/A',
            ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(","); // Escape quotes and wrap in quotes

            csvContent += row + "\n";
        });
        
        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="customer_segments_export.csv"`,
            },
        });

    } catch (error: any) {
        console.error("Failed to export customer data:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
