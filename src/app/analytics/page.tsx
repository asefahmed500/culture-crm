
'use client';

import React, { useState } from 'react';
import AppShell from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Zap, TrendingUp, TrendingDown, Lightbulb, Briefcase, Sparkles, Users, Activity, AlertTriangle, BrainCircuit, Star, HeartCrack, ArrowUpRight, CalendarClock, ChevronsRight, Footprints, Wind, Telescope, Globe, Puzzle, TestTube, ShieldCheck } from 'lucide-react';
import type { GenerateAnalyticsInsightsOutput } from '@/ai/flows/generate-analytics-insights-flow';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

const PredictionCard = ({ title, icon: Icon, prediction }: { title: string, icon: React.ElementType, prediction: GenerateAnalyticsInsightsOutput['predictions']['purchaseLikelihood'] }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className="h-5 w-5 text-primary" />
                {title}
            </CardTitle>
            <CardDescription>{prediction.segmentDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-sm font-medium">{prediction.prediction}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Confidence:</span>
                <Badge variant={prediction.confidenceScore > 75 ? 'default' : 'secondary'}>
                    {prediction.confidenceScore.toFixed(0)}%
                </Badge>
            </div>
             <Separator />
             <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm"><Lightbulb className="h-4 w-4 text-amber-500" /> Actionable Recommendation</h4>
                <p className="text-sm text-muted-foreground">{prediction.recommendation}</p>
             </div>
        </CardContent>
    </Card>
);

const InterestTrendCard = ({ title, icon: Icon, trends, iconColor }: { title: string, icon: React.ElementType, trends: GenerateAnalyticsInsightsOutput['topEmergingInterests'], iconColor: string }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${iconColor}`} />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {trends.map((trend, i) => (
                <div key={i}>
                    <p className="font-semibold text-sm">{trend.interest}</p>
                    <p className="text-xs text-muted-foreground">{trend.changeDescription}</p>
                </div>
            ))}
        </CardContent>
    </Card>
);

const EvolutionCard = ({ title, icon: Icon, items }: { title: string, icon: React.ElementType, items: string[] }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
                <Icon className="h-4 w-4 text-primary" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="space-y-3 list-disc list-inside text-sm text-muted-foreground">
                {items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
        </CardContent>
    </Card>
);


const LoadingSkeleton = () => (
    <div className="mt-8 space-y-8">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <div className="pt-4">
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <Skeleton className="h-7 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </CardContent>
            </Card>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><Skeleton className="h-7 w-3/4" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><Skeleton className="h-7 w-3/4" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
);


export default function AnalyticsPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [insights, setInsights] = useState<GenerateAnalyticsInsightsOutput | null>(null);

    const handleGenerateInsights = async () => {
        setLoading(true);
        setError(null);
        setInsights(null);

        try {
            const response = await fetch('/api/analytics-insights', { method: 'POST' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate insights');
            }
            const data = await response.json();
            setInsights(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <AppShell>
            <main className="flex-1 p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Cultural Trend & Analytics Engine</CardTitle>
                                <CardDescription>
                                    Generate a real-time report by analyzing all customer profiles. This self-learning AI processes the entire dataset to discover patterns, detect anomalies, and find opportunities.
                                </CardDescription>
                            </div>
                            <Button onClick={handleGenerateInsights} disabled={loading} size="lg">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating Report...
                                    </>
                                ) : (
                                     <>
                                        <Zap className="mr-2 h-4 w-4" />
                                        Generate Trend Report
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
                    </CardContent>
                </Card>

                {loading && <LoadingSkeleton />}

                {insights && (
                    <div className="mt-8 space-y-8">
                        {insights.dataShiftAlert && (
                            <Alert variant="destructive" className="border-2 border-amber-500/50">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Cultural Anomaly Detected!</AlertTitle>
                                <AlertDescription>{insights.dataShiftAlert}</AlertDescription>
                            </Alert>
                        )}

                        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                            <CardHeader>
                                <CardTitle className="text-3xl font-bold flex items-center gap-3"><BrainCircuit className="h-8 w-8 text-primary"/> AI-Generated Cultural Shift Story</CardTitle>
                                <CardDescription className="text-lg">{insights.culturalShiftStory.title}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground leading-relaxed">{insights.culturalShiftStory.narrative}</p>
                                <Separator />
                                <div>
                                    <h4 className="font-semibold mb-2">Key Supporting Data</h4>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                        {insights.culturalShiftStory.keyDataPoints.map((point, i) => <li key={i}>{point}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-primary/90"><Lightbulb className="h-4 w-4" /> Strategic Recommendation</h4>
                                    <p className="text-sm font-medium">{insights.culturalShiftStory.recommendation}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Overall Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{insights.overallSummary}</p>
                            </CardContent>
                        </Card>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                           <Card className="lg:col-span-1">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Key Patterns Discovered</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                                        {insights.keyPatterns.map((pattern, i) => <li key={i}>{pattern}</li>)}
                                    </ul>
                                </CardContent>
                           </Card>
                           <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InterestTrendCard title="Top 5 Emerging Interests" icon={TrendingUp} trends={insights.topEmergingInterests} iconColor="text-green-500" />
                                <InterestTrendCard title="Top 5 Declining Interests" icon={TrendingDown} trends={insights.topDecliningInterests} iconColor="text-red-500" />
                           </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold tracking-tight mb-4">Dynamic Cultural Evolution Tracking</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                <EvolutionCard title="Life Stage Shifts" icon={Footprints} items={insights.culturalEvolution.lifeStageShifts} />
                                <EvolutionCard title="Cultural Drift" icon={ChevronsRight} items={insights.culturalEvolution.culturalDrift} />
                                <EvolutionCard title="External Influence" icon={Wind} items={insights.culturalEvolution.externalInfluenceMapping} />
                                <EvolutionCard title="Micro-Trends" icon={Telescope} items={insights.culturalEvolution.microTrends} />
                            </div>
                        </div>

                         <div>
                            <h2 className="text-2xl font-bold tracking-tight mb-4">Global Intelligence Insights</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <Card className="lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Regional Cultural Mapping</CardTitle>
                                        <CardDescription>How cultural trends may manifest in different global markets.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {insights.globalIntelligence.regionalCulturalMapping.map((region, i) => (
                                            <div key={i} className="p-3 border rounded-lg bg-accent/20">
                                                <h3 className="font-semibold">{region.region}</h3>
                                                <div className="flex flex-wrap gap-2 my-2">
                                                    {region.dominantCulturalTraits.map((trait, idx) => <Badge key={idx} variant="secondary">{trait}</Badge>)}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{region.marketImplication}</p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="h-5 w-5" /> Cultural Sensitivity Score</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-4">
                                                 <Progress value={insights.globalIntelligence.culturalSensitivityScore} className="h-3" />
                                                 <span className="text-xl font-bold">{insights.globalIntelligence.culturalSensitivityScore.toFixed(0)}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">Represents how well the brand's appeal spans diverse cultural tastes.</p>
                                        </CardContent>
                                    </Card>
                                     <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-lg"><Lightbulb className="h-5 w-5 text-amber-500" /> Cross-Cultural Advice</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">{insights.globalIntelligence.crossCulturalCampaignAdvice}</p>
                                        </CardContent>
                                    </Card>
                                </div>

                            </div>
                             <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><TestTube className="h-5 w-5" /> Cultural Collision Hotspots</CardTitle>
                                    <CardDescription>Potential areas of friction when marketing globally, and how to mitigate them.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {insights.globalIntelligence.culturalCollisionHotspots.map((hotspot, i) => (
                                        <div key={i} className="p-4 border rounded-lg">
                                            <h4 className="font-semibold flex items-center gap-2"><Puzzle className="h-4 w-4 text-destructive" /> {hotspot.hotspot}</h4>
                                            <p className="text-sm text-muted-foreground mt-2">{hotspot.description}</p>
                                            <Separator className="my-2" />
                                            <p className="text-xs"><strong className="text-green-600">Recommendation:</strong> {hotspot.recommendation}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold tracking-tight mb-4">Market Intelligence & Product Development</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Briefcase /> Cultural Gap Analysis</CardTitle>
                                        <CardDescription>Actionable ideas for new product development based on unmet cultural needs.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                                            {insights.marketOpportunityGaps.map((gap, i) => <li key={i}>{gap}</li>)}
                                        </ul>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Sparkles /> Competitive Intelligence</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{insights.competitiveIntelligence}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                        
                        <div>
                             <h2 className="text-2xl font-bold tracking-tight mb-4">Predictive Cultural Journey Mapping</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                <PredictionCard title="Upsell Opportunity" icon={ArrowUpRight} prediction={insights.predictions.upsellOpportunity} />
                                <PredictionCard title="Brand Advocacy" icon={Star} prediction={insights.predictions.brandAdvocacy} />
                                <PredictionCard title="Purchase Likelihood" icon={Users} prediction={insights.predictions.purchaseLikelihood} />
                                <PredictionCard title="Cultural Churn Risk" icon={HeartCrack} prediction={insights.predictions.churnRisk} />
                            </div>
                        </div>

                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5" /> Seasonal Forecasts</CardTitle>
                                <CardDescription>Predictions on how key customer segments will behave during upcoming seasons or events.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {insights.seasonalForecasts.map((forecast, i) => (
                                    <div key={i} className="p-4 border rounded-lg bg-accent/20">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-lg">{forecast.season}</h3>
                                            <Badge variant="secondary">{forecast.segmentDescription}</Badge>
                                        </div>
                                       <p className="text-muted-foreground mt-2">{forecast.predictedBehavior}</p>
                                       <Separator className="my-3" />
                                       <p className="text-sm">
                                            <strong className="text-foreground">Recommendation:</strong> {forecast.recommendation}
                                       </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                    </div>
                )}
            </main>
        </AppShell>
    );
}
