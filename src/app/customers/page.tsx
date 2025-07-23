
'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { BarChart, TrendingUp } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ChartConfig } from "@/components/ui/chart"

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
    createdAt: string;
}

const chartConfig = {
  score: {
    label: "Affinity Score",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function CustomersPage() {
    const [profiles, setProfiles] = useState<ICustomerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch('/api/customer-profiles');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();
                setProfiles(data);
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, []);

    const renderSkeletons = () => (
        Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            </TableRow>
        ))
    );
    
    const getTopCategory = (dna: ICulturalDNA) => {
        const categories: Record<string, number> = {
            Music: dna.music.score,
            Entertainment: dna.entertainment.score,
            Dining: dna.dining.score,
            Fashion: dna.fashion.score,
            Travel: dna.travel.score,
            'Social Causes': dna.socialCauses.score,
        };
        return Object.entries(categories).reduce((a, b) => a[1] > b[1] ? a : b, ['', -1]);
    };
    
    const getChartData = (dna: ICulturalDNA) => {
        return [
            { category: 'Music', score: dna.music.score },
            { category: 'Entertainment', score: dna.entertainment.score },
            { category: 'Dining', score: dna.dining.score },
            { category: 'Fashion', score: dna.fashion.score },
            { category: 'Travel', score: dna.travel.score },
            { category: 'Social Causes', score: dna.socialCauses.score },
        ].sort((a, b) => b.score - a.score);
    }

    return (
        <AppShell>
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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? renderSkeletons() : (
                                    profiles.length > 0 ? (
                                        profiles.map(profile => {
                                            const [topCategory, topScore] = profile.culturalDNA ? getTopCategory(profile.culturalDNA) : ['N/A', 0];
                                            const chartData = profile.culturalDNA ? getChartData(profile.culturalDNA) : [];

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
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                                                                        <BarChart className="h-4 w-4 text-accent" />
                                                                        View Profile
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-96">
                                                                    <div className="grid gap-4">
                                                                        <div className="space-y-2">
                                                                            <h4 className="font-medium leading-none">Cultural DNA Profile</h4>
                                                                            <p className="text-sm text-muted-foreground">
                                                                                Top Category: <span className="font-bold">{topCategory} ({topScore.toFixed(0)}%)</span> |
                                                                                Confidence: <span className="font-bold">{profile.culturalDNA.confidenceScore.toFixed(0)}%</span>
                                                                            </p>
                                                                        </div>
                                                                         <div className="h-[200px]">
                                                                             <ChartContainer config={chartConfig} className="w-full h-full">
                                                                                <ResponsiveContainer width="100%" height="100%">
                                                                                    <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                                                                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                                                        <XAxis type="number" domain={[0, 100]} hide />
                                                                                        <YAxis dataKey="category" type="category" width={80} tickLine={false} axisLine={false} />
                                                                                        <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent indicator="dot" />} />
                                                                                        <Bar dataKey="score" radius={4}>
                                                                                        </Bar>
                                                                                    </BarChart>
                                                                                </ResponsiveContainer>
                                                                            </ChartContainer>
                                                                        </div>
                                                                        <div>
                                                                            <h5 className="font-medium leading-none mb-2">Surprising Connections</h5>
                                                                            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                                                                                {profile.culturalDNA.surpriseConnections.map((conn, i) => <li key={i}>{conn}</li>)}
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>
                                                        ) : (
                                                            <Badge variant="outline">Not Available</Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center h-24">
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
        </AppShell>
    );
}

