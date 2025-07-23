
'use client';

import React, { useState } from 'react';
import AppShell from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Zap, BarChart, TrendingUp, Users, Bell, Star, HeartCrack, ArrowUpRight, Lightbulb } from 'lucide-react';
import type { GenerateAnalyticsInsightsOutput } from '@/ai/flows/generate-analytics-insights-flow';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

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


export default function AnalyticsPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [insights, setInsights] = useState<GenerateAnalyticsInsightsOutput | null>(null);

    const handleGenerateInsights = async () => {
        setLoading(true);
        setError(null);
        setInsights(null);

        try {
            const response = await fetch('/api/analytics-insights');
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
                        <CardTitle>Predictive Analytics Dashboard</CardTitle>
                        <CardDescription>
                            Generate high-level insights by analyzing all customer profiles in the database. 
                            This action processes the entire dataset to identify trends and make predictions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleGenerateInsights} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating Insights...
                                </>
                            ) : (
                                 <>
                                    <Zap className="mr-2 h-4 w-4" />
                                    Generate Predictive Insights
                                </>
                            )}
                        </Button>
                         {error && (
                             <Alert variant="destructive" className="mt-4">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {insights && (
                    <div className="mt-8 space-y-8">
                        {insights.dataShiftAlert && (
                            <Alert variant="destructive">
                                <Bell className="h-4 w-4" />
                                <AlertTitle>Significant Data Shift Detected!</AlertTitle>
                                <AlertDescription>{insights.dataShiftAlert}</AlertDescription>
                            </Alert>
                        )}

                        <Card className="bg-primary/5 border-primary/20">
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
                                    <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5" /> Key Patterns</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                                        {insights.keyPatterns.map((pattern, i) => <li key={i}>{pattern}</li>)}
                                    </ul>
                                </CardContent>
                           </Card>
                           <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Emerging Trends</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {insights.emergingTrends.map((trend, i) => (
                                        <div key={i} className="p-3 border rounded-lg">
                                           <h4 className="font-semibold">{trend.trend}</h4>
                                           <p className="text-sm text-muted-foreground mt-1"><strong className="text-foreground">Implication:</strong> {trend.implication}</p>
                                           <p className="text-xs text-muted-foreground mt-2"><em>Supporting data: {trend.supportingData}</em></p>
                                        </div>
                                    ))}
                                </CardContent>
                           </Card>
                        </div>
                        
                        <div>
                             <h2 className="text-2xl font-bold tracking-tight mb-4">Predictions</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                <PredictionCard title="Upsell Opportunity" icon={ArrowUpRight} prediction={insights.predictions.upsellOpportunity} />
                                <PredictionCard title="Brand Advocacy" icon={Star} prediction={insights.predictions.brandAdvocacy} />
                                <PredictionCard title="Purchase Likelihood" icon={Users} prediction={insights.predictions.purchaseLikelihood} />
                                <PredictionCard title="Churn Risk" icon={HeartCrack} prediction={insights.predictions.churnRisk} />
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </AppShell>
    );
}

