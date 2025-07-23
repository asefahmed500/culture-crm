
'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Download, FileText, CalendarDays, Users, Rocket, Target, Lightbulb, TrendingUp, CheckCircle, Wallet } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { GenerateCampaignBriefOutput } from '@/ai/flows/generate-campaign-brief-flow';
import type { GenerateContentCalendarOutput } from '@/ai/flows/generate-content-calendar-flow';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ISegment } from '@/models/segment';

export default function ExportPage() {
    const [segments, setSegments] = useState<ISegment[]>([]);
    const [selectedSegment, setSelectedSegment] = useState<string>('');
    const [isSegmentsLoading, setIsSegmentsLoading] = useState(true);

    const [isBriefLoading, setIsBriefLoading] = useState(false);
    const [briefError, setBriefError] = useState<string | null>(null);
    const [campaignBrief, setCampaignBrief] = useState<GenerateCampaignBriefOutput | null>(null);

    const [isCalendarLoading, setIsCalendarLoading] = useState(false);
    const [calendarError, setCalendarError] = useState<string | null>(null);
    const [contentCalendar, setContentCalendar] = useState<GenerateContentCalendarOutput | null>(null);
    
    const [isDownloading, setIsDownloading] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        async function fetchSegments() {
            try {
                // The API now returns a different structure
                const response = await fetch('/api/customer-segments');
                if (!response.ok) throw new Error('Failed to fetch segments');
                const data = await response.json();
                setSegments(data.segments);
            } catch (error) {
                console.error(error);
                toast({
                    title: 'Error',
                    description: 'Could not load customer segments. Please generate them on the Segments page first.',
                    variant: 'destructive',
                });
            } finally {
                setIsSegmentsLoading(false);
            }
        }
        fetchSegments();
    }, [toast]);
    
    const handleGenerateBrief = async () => {
        if (!selectedSegment) {
            setBriefError('Please select a customer segment first.');
            return;
        }
        setIsBriefLoading(true);
        setBriefError(null);
        setCampaignBrief(null);
        try {
            const response = await fetch('/api/export/campaign-brief', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ segmentName: selectedSegment }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate campaign brief');
            }
            const data = await response.json();
            setCampaignBrief(data);
        } catch (err: any) {
            setBriefError(err.message);
        } finally {
            setIsBriefLoading(false);
        }
    };
    
    const handleGenerateCalendar = async () => {
        setIsCalendarLoading(true);
        setCalendarError(null);
        setContentCalendar(null);
        try {
            const response = await fetch('/api/export/content-calendar', {
                method: 'POST',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate content calendar');
            }
            const data = await response.json();
            setContentCalendar(data);
        } catch (err: any) {
            setCalendarError(err.message);
        } finally {
            setIsCalendarLoading(false);
        }
    };

    const handleDownloadCustomers = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch('/api/export/customers');
            if (!response.ok) {
                throw new Error('Failed to download customer list.');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'customer_segments_export.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
             toast({
                title: 'Success',
                description: 'Customer list download started.',
            });
        } catch (error: any) {
             toast({
                title: 'Error',
                description: error.message || 'Could not download customer list.',
                variant: 'destructive',
            });
        } finally {
            setIsDownloading(false);
        }
    };

    const downloadCalendarCsv = () => {
        if (!contentCalendar) return;

        const headers = ['Day', 'Theme', 'Platform', 'PostSuggestion', 'SeasonalTieIn'];
        const csvRows = [
            headers.join(','),
            ...contentCalendar.calendar.map(day => 
                [
                    day.day,
                    `"${day.theme.replace(/"/g, '""')}"`,
                    `"${day.platform.replace(/"/g, '""')}"`,
                    `"${day.postSuggestion.replace(/"/g, '""')}"`,
                    `"${(day.seasonalTieIn || '').replace(/"/g, '""')}"`
                ].join(',')
            )
        ];
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "content_calendar.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <AppShell>
            <main className="flex-1 p-4 md:p-8 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Export Center</CardTitle>
                        <CardDescription>
                            Generate and download campaign materials, customer lists, and content calendars powered by AI insights.
                        </CardDescription>
                    </CardHeader>
                     <CardContent>
                        <Card className="bg-muted/30">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="space-y-1.5">
                                    <CardTitle className="flex items-center gap-2 text-xl"><Users className="h-5 w-5"/> Customer Data Export</CardTitle>
                                    <CardDescription>
                                        Download a CSV of all customers with their assigned cultural segment and key traits.
                                    </CardDescription>
                                </div>
                                 <Button onClick={handleDownloadCustomers} disabled={isDownloading}>
                                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                    Download Customer CSV
                                </Button>
                            </CardHeader>
                        </Card>
                    </CardContent>
                </Card>

                {/* Campaign Brief Generator */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText /> AI Campaign Brief Generator</CardTitle>
                        <CardDescription>
                            Select a target segment to generate a comprehensive campaign brief, including strategy, messaging, and KPIs.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-end gap-4">
                            <div className="flex-grow">
                                <label className="text-sm font-medium">Target Segment</label>
                                 <Select onValueChange={setSelectedSegment} disabled={isSegmentsLoading || isBriefLoading} value={selectedSegment}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isSegmentsLoading ? "Loading segments..." : "Select a segment"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {segments.map(s => <SelectItem key={s.segmentName} value={s.segmentName}>{s.segmentName}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleGenerateBrief} disabled={isBriefLoading || !selectedSegment}>
                                {isBriefLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
                                Generate Brief
                            </Button>
                        </div>
                         {briefError && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{briefError}</AlertDescription></Alert>}
                    </CardContent>
                </Card>
                
                {campaignBrief && (
                    <Card className="print:shadow-none print:border-none">
                        <CardHeader className="flex flex-row justify-between items-start">
                           <div>
                             <CardTitle className="text-2xl">{campaignBrief.campaignTitle}</CardTitle>
                             <CardDescription>Campaign Brief for: <Badge>{campaignBrief.targetSegment}</Badge></CardDescription>
                           </div>
                           <Button variant="outline" onClick={() => window.print()}><Download className="mr-2 h-4 w-4"/> Save as PDF</Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-muted-foreground italic">{campaignBrief.executiveSummary}</p>
                            <Separator />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2"><Target/> Target Segment Analysis</h3>
                                    <p className="text-sm">{campaignBrief.targetSegmentAnalysis}</p>
                                </div>
                                <div className="space-y-4">
                                     <h3 className="font-semibold text-lg flex items-center gap-2"><Lightbulb/> Cultural Insights & Recommendations</h3>
                                    <p className="text-sm">{campaignBrief.culturalInsights}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Messaging Strategy</h3>
                                <div className="p-4 border rounded-lg bg-accent/20">
                                    <p className="text-sm"><strong className="text-foreground">Core Message:</strong> {campaignBrief.messagingStrategy.coreMessage}</p>
                                    <p className="text-sm mt-2"><strong className="text-foreground">Key Themes:</strong> {campaignBrief.messagingStrategy.keyThemes.join(', ')}</p>
                                    <div className="mt-2">
                                        <h4 className="font-semibold text-sm">Sample Snippets:</h4>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                                            {campaignBrief.messagingStrategy.sampleSnippets.map((s,i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Visual Direction</h3>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                                        {campaignBrief.visualDirection.map((v,i) => <li key={i}>{v}</li>)}
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                     <h3 className="font-semibold text-lg flex items-center gap-2"><CheckCircle/> Success Metrics & KPIs</h3>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                                        {campaignBrief.successMetrics.map((m,i) => <li key={i}>{m}</li>)}
                                    </ul>
                                </div>
                            </div>
                             <div className="space-y-4">
                                 <h3 className="font-semibold text-lg flex items-center gap-2"><Wallet/> Budget Allocation Suggestions</h3>
                                <p className="text-sm">{campaignBrief.budgetAllocation}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}


                {/* Content Calendar */}
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CalendarDays /> AI Content Calendar Generator</CardTitle>
                        <CardDescription>
                            Generate a 30-day content calendar with post ideas, themes, and seasonal tie-ins based on your overall customer cultural profile.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-start">
                             <Button onClick={handleGenerateCalendar} disabled={isCalendarLoading}>
                                {isCalendarLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                                Generate Content Calendar
                            </Button>
                        </div>
                         {calendarError && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{calendarError}</AlertDescription></Alert>}
                    </CardContent>
                </Card>

                {contentCalendar && (
                     <Card>
                        <CardHeader className="flex-row justify-between items-center">
                            <CardTitle>30-Day Content Plan</CardTitle>
                            <Button variant="outline" onClick={downloadCalendarCsv}><Download className="mr-2 h-4 w-4"/> Download as CSV</Button>
                        </CardHeader>
                        <CardContent>
                             <p className="text-muted-foreground mb-4">{contentCalendar.summary}</p>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Day</TableHead>
                                        <TableHead>Theme</TableHead>
                                        <TableHead>Platform</TableHead>
                                        <TableHead>Suggestion</TableHead>
                                        <TableHead>Seasonal Tie-In</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contentCalendar.calendar.map(day => (
                                        <TableRow key={day.day}>
                                            <TableCell className="font-bold">{day.day}</TableCell>
                                            <TableCell>{day.theme}</TableCell>
                                            <TableCell><Badge variant="secondary">{day.platform}</Badge></TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{day.postSuggestion}</TableCell>
                                            <TableCell>{day.seasonalTieIn || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                             </Table>
                        </CardContent>
                     </Card>
                )}
            </main>
        </AppShell>
    );
}
