
import dbConnect from "@/lib/mongoose";
import CustomerProfile from "@/models/customer-profile";
import Segment from "@/models/segment";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Helper function to find which segment a profile belongs to.
// This is computationally intensive and not ideal for production.
// A better approach would be to save the segment assignment to the profile.
const findSegmentForProfile = (profile: any, segments: any[]) => {
    let bestSegment: any = null;
    let highestScore = -1;

    if (!profile.culturalDNA) return null;

    segments.forEach(segment => {
        let score = 0;
        const profileDna = profile.culturalDNA;

        // Simple scoring mechanism: check if segment characteristics are present in profile preferences
        segment.topCulturalCharacteristics.forEach((char: string) => {
            const lowerChar = char.toLowerCase();
            if (profileDna.music.preferences.some((p: string) => p.toLowerCase().includes(lowerChar))) score++;
            if (profileDna.entertainment.preferences.some((p: string) => p.toLowerCase().includes(lowerChar))) score++;
            if (profileDna.dining.preferences.some((p: string) => p.toLowerCase().includes(lowerChar))) score++;
            if (profileDna.fashion.preferences.some((p: string) => p.toLowerCase().includes(lowerChar))) score++;
            if (profileDna.travel.preferences.some((p: string) => p.toLowerCase().includes(lowerChar))) score++;
            if (profileDna.socialCauses.preferences.some((p: string) => p.toLowerCase().includes(lowerChar))) score++;
        });
        
        if (score > highestScore) {
            highestScore = score;
            bestSegment = segment;
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
        const segments = await Segment.find({}).lean();

        // Create CSV header
        const headers = [
            "customerId",
            "assignedSegment",
            "predictedLifetimeValue",
            "bestContactMethods",
            "communicationPreferenceTags",
            "topAffinity1",
            "topAffinity2",
            "topAffinity3",
            "interactionFrequency",
            "spendingLevel",
        ];
        
        let csvContent = headers.join(",") + "\n";

        // Create CSV rows
        profiles.forEach(profile => {
            const assignedSegment = findSegmentForProfile(profile, segments);
            const topAffinities = getTopAffinities(profile.culturalDNA);

            const row = [
                profile._id,
                assignedSegment?.segmentName || 'Uncategorized',
                assignedSegment?.potentialLifetimeValue || 'N/A',
                assignedSegment?.bestMarketingChannels.join('; ') || 'N/A',
                assignedSegment?.communicationPreferences.replace(/"/g, '""') || 'N/A',
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
