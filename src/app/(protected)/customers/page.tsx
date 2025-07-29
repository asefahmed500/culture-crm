'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { BarChart, Wand2, Loader2, Rocket, ThumbsUp, ThumbsDown, CheckCircle, XCircle, ShoppingCart, Send, Tv, Lightbulb, Shield } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ResponsiveContainer } from 'recharts';
import type { ChartConfig } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { GenerateCommunicationStrategyOutput } from '../../../../ai/flows/generate-communication-strategy-flow';
import { useSession } from 'next-auth/react';


interface ICulturalDNA {
    music: { score: number; preferences: string[] };
    entertainment: { score: number; preferences: string[] };
    dining: { score: number; preferences: string[] };
    fashion: { score: number; preferences: string[] };
    travel: { score: number; preferences: string[] };
    socialCauses: { score: number; preferences: string[] };
    surpriseConnections: string[];
    confidenceScore: number;
}

interface ICustomerProfile {
    _id: string;
    ageRange: string;
    spendingLevel: string;
    purchaseCategories: string[];
    interactionFrequency: string;
    culturalDNA?: ICulturalDNA;
    accuracyFeedback: number;
    createdAt: string;
}

const chartConfig = {
  score: {
    label: "Affinity Score",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const getRadarChartData = (dna: ICulturalDNA) => {
    return [
        { subject: 'Music', score: dna.music.score, fullMark: 100 },
        { subject: 'Entertainment', score: dna.entertainment.score, fullMark: 100 },
        { subject: 'Dining', score: dna.dining.score, fullMark: 100 },
        { subject: 'Fashion', score: dna.fashion.score, fullMark: 100 },
        { subject: 'Travel', score: dna.travel.score, fullMark: 100 },
        { subject: 'Social Causes', score: dna.socialCauses.score, fullMark: 100 },
    ];
};

export default function CustomersPage() {
    const { data: session, status } = useSession();
    const [profiles, setProfiles] = useState<ICustomerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<ICustomerProfile | null>(null);
    const [strategy, setStrategy] = useState<GenerateCommunicationStrategyOutput | null>(null);
    const { toast } = useToast();

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/customer-profiles');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch customer profiles');
            }
            const data = await response.json();
            setProfiles(data);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (status === 'authenticated') {
            fetchProfiles();
        } else if (status === 'unauthenticated') {
            setLoading(false);
        }
    }, [status]);

    const handleGenerateStrategy = async (profile: ICustomerProfile) => {
        if (!profile.culturalDNA) return;

        setIsGenerating(true);
        setSelectedProfile(profile);
        setStrategy(null);

        try {
            const response = await fetch('/api/genkit/flow/generateCommunicationStrategyFlow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile.culturalDNA),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate strategy');
            }

            const data = await response.json();
            setStrategy(data);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "An unexpected error occurred.",
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    };
    
     const handleFeedback = async (profileId: string, feedback: number) => {
        try {
            const response = await fetch(`/api/customer-profiles/${profileId}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedback }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit feedback');
            }
            
            toast({
                title: 'Feedback Submitted',
                description: 'Thank you for helping us improve!',
            });
            
            // Refetch profiles to ensure the UI is in sync with the database
            await fetchProfiles();

        } catch (err: any) {
            toast({
                title: 'Error',
                description: err.message || 'Could not submit feedback.',
                variant: 'destructive',
            });
        }
    };

    const renderSkeletons = () => (
        Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-9 w-32" /></TableCell>
            </TableRow>
        ))
    );
    
    return (
        <main className="flex-1 p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Customer Profiles</CardTitle>
                    <CardDescription>
                        A list of all processed and anonymized customer profiles stored in the database, enriched with Cultural DNA.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                         <Alert variant="destructive" className="mb-4">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Imported On</TableHead>
                                <TableHead>Age Range</TableHead>
                                <TableHead>Spending Level</TableHead>
                                <TableHead>Purchase Categories</TableHead>
                                <TableHead>Interaction Freq.</TableHead>
                                <TableHead>Cultural DNA</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? renderSkeletons() : (
                                profiles.length > 0 ? (
                                    profiles.map(profile => {
                                        const radarChartData = profile.culturalDNA ? getRadarChartData(profile.culturalDNA) : [];
                                        const allPreferences = profile.culturalDNA ? [
                                            ...profile.culturalDNA.music.preferences.map(p => ({ category: 'Music', preference: p })),
                                            ...profile.culturalDNA.entertainment.preferences.map(p => ({ category: 'Entertainment', preference: p })),
                                            ...profile.culturalDNA.dining.preferences.map(p => ({ category: 'Dining', preference: p })),
                                            ...profile.culturalDNA.fashion.preferences.map(p => ({ category: 'Fashion', preference: p })),
                                            ...profile.culturalDNA.travel.preferences.map(p => ({ category: 'Travel', preference: p })),
                                            ...profile.culturalDNA.socialCauses.preferences.map(p => ({ category: 'Social Causes', preference: p })),
                                        ] : [];


                                        return (
                                            <TableRow key={profile._id}>
                                                <TableCell>{format(new Date(profile.createdAt), 'PPp')}</TableCell>
                                                <TableCell><Badge variant="outline">{profile.ageRange || 'N/A'}</Badge></TableCell>
                                                <TableCell><Badge variant={
                                                    profile.spendingLevel === 'High' ? 'default' : profile.spendingLevel === 'Medium' ? 'secondary' : 'outline'
                                                }>{profile.spendingLevel || 'N/A'}</Badge></TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(profile.purchaseCategories && profile.purchaseCategories.length > 0) ? profile.purchaseCategories.slice(0, 3).map(cat => (
                                                            <Badge key={cat} variant="secondary">{cat}</Badge>
                                                        )) : 'N/A'}
                                                    </div>
                                                </TableCell>
                                                <TableCell><Badge variant="outline">{profile.interactionFrequency || 'N/A'}</Badge></TableCell>
                                                <TableCell>
                                                    {profile.culturalDNA ? (
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                                                    <BarChart className="h-4 w-4 text-accent-foreground" />
                                                                    View DNA
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                                                                <DialogHeader>
                                                                    <DialogTitle>Cultural DNA Visualization</DialogTitle>
                                                                    <DialogDescription>
                                                                       An interactive visualization of the customer's cultural affinities and preferences.
                                                                       Confidence Score: <span className="font-bold">{profile.culturalDNA.confidenceScore.toFixed(0)}%</span>
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
                                                                    <Card className="flex flex-col">
                                                                        <CardHeader>
                                                                            <CardTitle>Affinity Overview</CardTitle>
                                                                        </CardHeader>
                                                                        <CardContent className="flex-1">
                                                                            <ChartContainer config={chartConfig} className="w-full h-full">
                                                                                 <ResponsiveContainer width="100%" height="100%">
                                                                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                                                                                        <PolarGrid />
                                                                                        <PolarAngleAxis dataKey="subject" />
                                                                                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                                                                        <Radar name="Score" dataKey="score" stroke="var(--color-score)" fill="var(--color-score)" fillOpacity={0.6} />
                                                                                        <ChartTooltip content={<ChartTooltipContent />} />
                                                                                    </RadarChart>
                                                                                </ResponsiveContainer>
                                                                            </ChartContainer>
                                                                        </CardContent>
                                                                    </Card>
                                                                    <div className="flex flex-col gap-6">
                                                                        <Card>
                                                                            <CardHeader>
                                                                                <CardTitle>Preferences & Connections</CardTitle>
                                                                            </CardHeader>
                                                                            <CardContent className="space-y-4">
                                                                                <div>
                                                                                    <h3 className="font-semibold text-sm mb-2">Top Preferences</h3>
                                                                                    <div className="flex flex-wrap gap-2">
                                                                                        {allPreferences.slice(0,15).map((pref, i) => (
                                                                                            <Badge key={i} variant="secondary">{pref.preference}</Badge>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                                <Separator />
                                                                                <div>
                                                                                    <h3 className="font-semibold text-sm mb-2">Surprising Connections</h3>
                                                                                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                                                                                        {profile.culturalDNA.surpriseConnections.map((conn, i) => <li key={i}>{conn}</li>)}
                                                                                    </ul>
                                                                                </div>
                                                                            </CardContent>
                                                                        </Card>
                                                                         <Card>
                                                                            <CardHeader>
                                                                                <CardTitle className="text-base">Was this profile accurate?</CardTitle>
                                                                            </CardHeader>
                                                                             <CardContent className="flex items-center gap-4">
                                                                                <Button 
                                                                                    size="sm" 
                                                                                    variant={profile.accuracyFeedback === 1 ? 'default' : 'outline'}
                                                                                    onClick={() => handleFeedback(profile._id, 1)}
                                                                                >
                                                                                    <ThumbsUp className="mr-2 h-4 w-4"/> Accurate
                                                                                </Button>
                                                                                 <Button 
                                                                                    size="sm" 
                                                                                    variant={profile.accuracyFeedback === -1 ? 'destructive' : 'outline'}
                                                                                    onClick={() => handleFeedback(profile._id, -1)}
                                                                                >
                                                                                    <ThumbsDown className="mr-2 h-4 w-4"/> Inaccurate
                                                                                </Button>
                                                                                {profile.accuracyFeedback === 1 && <CheckCircle className="h-5 w-5 text-green-500" />}
                                                                                {profile.accuracyFeedback === -1 && <XCircle className="h-5 w-5 text-red-500" />}
                                                                            </CardContent>
                                                                        </Card>
                                                                    </div>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    ) : (
                                                        <Badge variant="outline">Not Available</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                   {profile.culturalDNA && (
                                                      <Dialog onOpenChange={(open) => !open && setStrategy(null)}>
                                                        <DialogTrigger asChild>
                                                          <Button
                                                            size="sm"
                                                            onClick={() => handleGenerateStrategy(profile)}
                                                            disabled={isGenerating && selectedProfile?._id === profile._id}
                                                          >
                                                            {isGenerating && selectedProfile?._id === profile._id ? (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Wand2 className="mr-2 h-4 w-4" />
                                                            )}
                                                            Generate Playbook
                                                          </Button>
                                                        </DialogTrigger>
                                                         <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
                                                            <DialogHeader>
                                                                <DialogTitle>AI-Generated Communication Playbook</DialogTitle>
                                                                <DialogDescription>
                                                                    A tailored communication strategy based on the customer's cultural DNA to eliminate guesswork.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            {isGenerating && <div className="flex flex-col items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-4 text-muted-foreground">Generating playbook...</p></div>}
                                                            {strategy && (
                                                                <div className="space-y-6 overflow-y-auto pr-6 text-sm">
                                                                    <div className="p-4 border rounded-lg bg-primary/10">
                                                                        <h3 className="font-semibold flex items-center gap-2"><Rocket className="text-primary" /> Predicted ROI</h3>
                                                                        <p className="text-muted-foreground mt-1">{strategy.predictedROI}</p>
                                                                    </div>

                                                                    <div className="space-y-4">
                                                                        <h3 className="font-semibold text-base flex items-center gap-2"><Send /> Email Marketing Optimization</h3>
                                                                        <p><strong>Tone:</strong> {strategy.emailMarketing.tone}</p>
                                                                        <p><strong>Language:</strong> {strategy.emailMarketing.language}</p>
                                                                        <h4 className="font-semibold">Subject Line Examples:</h4>
                                                                        <ul className="list-disc list-inside text-muted-foreground">
                                                                            {strategy.emailMarketing.subjectLineExamples.map((s, i) => <li key={i}>{s}</li>)}
                                                                        </ul>
                                                                    </div>
                                                                    <Separator />
                                                                    <div className="space-y-4">
                                                                        <h3 className="font-semibold text-base flex items-center gap-2"><Tv /> Social Media Content Strategy</h3>
                                                                        <p><strong>Platforms:</strong> {strategy.socialMediaApproach.platforms.join(', ')}</p>
                                                                        <p><strong>Content Types:</strong> {strategy.socialMediaApproach.contentTypes.join(', ')}</p>
                                                                        <p><strong>Posting Style:</strong> {strategy.socialMediaApproach.postingStyle}</p>
                                                                    </div>
                                                                    <Separator />
                                                                     <div className="space-y-4">
                                                                        <h3 className="font-semibold text-base flex items-center gap-2"><ShoppingCart /> E-commerce & Product Recommendations</h3>
                                                                        <p><strong>Recommendation Strategy:</strong> {strategy.productRecommendationStrategy}</p>
                                                                        <p><strong>Customer Service Approach:</strong> {strategy.customerServiceApproach}</p>
                                                                        <div>
                                                                            <h4 className="font-semibold">Visual Branding Elements:</h4>
                                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                                {strategy.visualBrandingElements.map((s, i) => <Badge key={i} variant="secondary">{s}</Badge>)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                     <Separator />
                                                                     <div className="space-y-4">
                                                                        <h3 className="font-semibold text-base flex items-center gap-2"><Shield /> Cultural Guardrails (Taboo Detection)</h3>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
                                                                                <h4 className="font-semibold text-green-600 flex items-center gap-2"><Lightbulb /> DOs: Emphasize These</h4>
                                                                                 <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                                                                                    {strategy.culturalGuardrails.dos.map((s, i) => <li key={i}>{s}</li>)}
                                                                                </ul>
                                                                            </div>
                                                                            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
                                                                                <h4 className="font-semibold text-destructive flex items-center gap-2"><XCircle /> DON'Ts: Avoid These</h4>
                                                                                 <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                                                                                    {strategy.culturalGuardrails.donts.map((s, i) => <li key={i}>{s}</li>)}
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                         </DialogContent>
                                                      </Dialog>
                                                   )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24">
                                            No customer profiles found. You can import data from the Customer Import page.
                                        </TableCell>
                                    </TableRow>
                                )
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}
