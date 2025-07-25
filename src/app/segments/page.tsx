
'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Zap, Users, Trophy, Lightbulb, Target, MessageSquare, ShoppingBag, BarChart, RefreshCw, AlertTriangle, AreaChart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import type { GenerateCustomerSegmentsOutput } from '@/ai/flows/generate-customer-segments-flow';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ISegment } from '@/models/segment';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SegmentsPage() {
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<GenerateCustomerSegmentsOutput | null>(null);
    const [selectedSegment, setSelectedSegment] = useState<ISegment | null>(null);
    const [isSavingPerformance, setIsSavingPerformance] = useState(false);
    const [actualROI, setActualROI] = useState<number | ''>('');
    const { toast } = useToast();

    async function fetchSegments() {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/customer-segments');
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Failed to fetch existing segments');
            }
            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
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
    
    const handleSavePerformance = async () => {
        if (!selectedSegment || actualROI === '') return;
        setIsSavingPerformance(true);
        try {
            const response = await fetch(`/api/customer-segments/${selectedSegment._id}/performance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ actualROI }),
            });
            if (!response.ok) throw new Error('Failed to save performance');
            
            toast({
                title: 'Success',
                description: 'Campaign performance saved.',
            });
            // Refetch segments to show updated data
            await fetchSegments();
            setSelectedSegment(null); // Close dialog
            setActualROI('');

        } catch (error) {
             toast({
                title: 'Error',
                description: 'Could not save performance data.',
                variant: 'destructive',
            });
        } finally {
            setIsSavingPerformance(false);
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
                                {result.segments.map((segment: ISegment, i) => (
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
                                             {segment.biasWarning && (
                                                <Alert variant="destructive" className="mt-2 text-xs p-2">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <AlertTitle className="font-semibold">Potential Bias</AlertTitle>
                                                    <AlertDescription>{segment.biasWarning}</AlertDescription>
                                                </Alert>
                                            )}
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
                                                <h4 className="font-semibold mb-2 text-sm flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> Loved Product Categories & Features</h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {segment.lovedProductCategories.map((cat, idx) => <Badge key={idx} variant="secondary">{cat}</Badge>)}
                                                </div>
                                            </div>
                                             {segment.actualROI !== undefined && segment.actualROI !== null && (
                                                <>
                                                    <Separator />
                                                    <div>
                                                        <h4 className="font-semibold mb-2 text-sm flex items-center gap-2"><AreaChart className="h-4 w-4" /> Actual ROI</h4>
                                                        <p className="text-2xl font-bold text-green-600">{segment.actualROI}%</p>
                                                    </div>
                                                </>
                                            )}
                                        </CardContent>
                                        <CardContent>
                                             <Dialog onOpenChange={(open) => !open && setSelectedSegment(null)}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" className="w-full" onClick={() => setSelectedSegment(segment)}>
                                                        Track Performance
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Track Campaign Performance</DialogTitle>
                                                        <DialogDescription>
                                                            Enter the actual ROI from a campaign that targeted the "{selectedSegment?.segmentName}" segment.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="roi" className="text-right">Actual ROI (%)</Label>
                                                            <Input 
                                                                id="roi" 
                                                                type="number" 
                                                                className="col-span-3"
                                                                value={actualROI}
                                                                onChange={(e) => setActualROI(e.target.value === '' ? '' : Number(e.target.value))}
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button onClick={handleSavePerformance} disabled={isSavingPerformance}>
                                                        {isSavingPerformance && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Save Performance
                                                    </Button>
                                                </DialogContent>
                                            </Dialog>
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
