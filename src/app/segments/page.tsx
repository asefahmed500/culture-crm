
'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Zap, Users, Trophy, Lightbulb, Target, MessageSquare, ShoppingBag, BarChart, FileText, RefreshCw } from 'lucide-react';
import type { GenerateCustomerSegmentsOutput } from '@/ai/flows/generate-customer-segments-flow';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function SegmentsPage() {
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<GenerateCustomerSegmentsOutput | null>(null);
    
    useEffect(() => {
        async function fetchSegments() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/customer-segments');
                if (!response.ok) {
                    throw new Error('Failed to fetch existing segments');
                }
                const data = await response.json();
                setResult(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchSegments();
    }, []);

    const handleGenerateSegments = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch('/api/customer-segments', { method: 'POST' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate segments');
            }
            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <AppShell>
            <main className="flex-1 p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                             <div>
                                <CardTitle>Smart Segmentation & Targeting</CardTitle>
                                <CardDescription>
                                    Analyze customer profiles to create distinct cultural segments, develop personas, and get targeting recommendations. Segments are saved to the database.
                                </CardDescription>
                            </div>
                             <Button onClick={handleGenerateSegments} disabled={isGenerating || loading}>
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                     <>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        {result && result.segments.length > 0 ? 'Re-generate Segments' : 'Generate Segments'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                         {error && (
                             <Alert variant="destructive" className="mt-4">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {loading && !result && <p>Loading saved segments...</p>}
                    </CardContent>
                </Card>

                {result && result.segments.length > 0 && (
                    <div className="mt-8 space-y-8">
                        
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle>Executive Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{result.summary}</p>
                            </CardContent>
                        </Card>
                        
                        <div>
                             <h2 className="text-2xl font-bold tracking-tight mb-4">Cultural Segments Overview</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                {result.segments.map((segment, i) => (
                                    <Card key={i} className="flex flex-col">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-xl pr-4">{segment.segmentName}</CardTitle>
                                                <Badge variant="default" className="flex-shrink-0">
                                                    <Trophy className="h-3 w-3 mr-1.5" />
                                                     Rank #{segment.businessOpportunityRank}
                                                </Badge>
                                            </div>
                                            <CardDescription>
                                                <span className="font-semibold">LTV:</span> {segment.potentialLifetimeValue} | <span className="font-semibold">Value:</span> {segment.averageCustomerValue} | <span className="font-semibold">Size:</span> {segment.segmentSize} users
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4 flex-grow">
                                            <div>
                                                <h4 className="font-semibold mb-2 text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Top Characteristics</h4>
                                                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                                                   {segment.topCulturalCharacteristics.map((char, idx) => <li key={idx}>{char}</li>)}
                                                </ul>
                                            </div>
                                             <Separator />
                                            <div>
                                                <h4 className="font-semibold mb-2 text-sm flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> Loved Product Categories</h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {segment.lovedProductCategories.map((cat, idx) => <Badge key={idx} variant="secondary">{cat}</Badge>)}
                                                </div>
                                            </div>
                                            <Separator />
                                            <div>
                                                <h4 className="font-semibold mb-2 text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Sample Messaging</h4>
                                                <p className="text-xs text-muted-foreground italic">"{segment.sampleMessaging}"</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {result.topCampaignIdeas && result.topCampaignIdeas.length > 0 && (
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" /> Top Campaign Ideas</CardTitle>
                                    <CardDescription>Actionable campaign strategies for the highest-opportunity segments.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {result.topCampaignIdeas.map((idea, i) => (
                                        <div key={i} className="p-4 border rounded-lg bg-accent/20">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                <h3 className="font-semibold text-lg">{idea.campaignTitle}</h3>
                                                <Badge>
                                                    <Target className="h-3 w-3 mr-1.5" />
                                                    For: {idea.targetSegment}
                                                </Badge>
                                            </div>
                                           <p className="text-muted-foreground mt-2">{idea.description}</p>
                                           <Separator className="my-3" />
                                           <div className="flex items-center gap-4">
                                                <h4 className="text-sm font-semibold">Suggested Channels:</h4>
                                                 <div className="flex flex-wrap gap-2">
                                                    {idea.suggestedChannels.map((channel, idx) => <Badge key={idx} variant="outline">{channel}</Badge>)}
                                                </div>
                                           </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}


                    </div>
                )}
                 { !loading && result && result.segments.length === 0 && (
                     <Alert className="mt-4">
                        <Zap className="h-4 w-4" />
                        <AlertTitle>No Segments Found</AlertTitle>
                        <AlertDescription>
                            No segments are currently saved in the database. Click the "Generate Segments" button to analyze your customers and create new segments.
                        </AlertDescription>
                    </Alert>
                )}
            </main>
        </AppShell>
    );
}
