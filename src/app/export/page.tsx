
'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Download, FileText, CalendarDays, Users, Rocket, Target, Lightbulb, TrendingUp, CheckCircle, Wallet, AreaChart, MessageSquare, Mail, Video, Bot, Mic } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { GenerateCampaignBriefOutput } from '@/ai/flows/generate-campaign-brief-flow';
import type { GenerateContentCalendarOutput } from '@/ai/flows/generate-content-calendar-flow';
import type { GenerateSalesScriptOutput } from '@/ai/flows/generate-sales-script-flow';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ISegment } from '@/models/segment';
import { Textarea } from '@/components/ui/textarea';

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

    const [isScriptLoading, setIsScriptLoading] = useState(false);
    const [scriptError, setScriptError] = useState<string | null>(null);
    const [salesScript, setSalesScript] = useState<GenerateSalesScriptOutput | null>(null);
    
    const [isDownloading, setIsDownloading] = useState(false);

    const [isCoPilotLoading, setIsCoPilotLoading] = useState(false);
    const [coPilotError, setCoPilotError] = useState<string | null>(null);
    const [coPilotQuery, setCoPilotQuery] = useState('');
    const [coPilotResponse, setCoPilotResponse] = useState<string | null>(null);

    const { toast } = useToast();

    useEffect(() => {
        async function fetchSegments() {
            try {
                setIsSegmentsLoading(true);
                const response = await fetch('/api/customer-segments');
                if (!response.ok) throw new Error('Failed to fetch segments');
                const data = await response.json();
                const fetchedSegments = data.segments || [];
                setSegments(fetchedSegments);
                if (fetchedSegments.length > 0) {
                    setSelectedSegment(fetchedSegments[0].segmentName);
                } else {
                    setSelectedSegment('');
                }
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

    const handleGenerateScript = async () => {
        if (!selectedSegment) {
            setScriptError('Please select a customer segment first.');
            return;
        }
        setIsScriptLoading(true);
        setScriptError(null);
        setSalesScript(null);
        try {
            const response = await fetch('/api/export/sales-script', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ segmentName: selectedSegment }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate sales script');
            }
            const data = await response.json();
            setSalesScript(data);
        } catch (err: any) {
            setScriptError(err.message);
        } finally {
            setIsScriptLoading(false);
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

    const handleCoPilotQuery = async () => {
        if (!coPilotQuery) {
            setCoPilotError('Please enter a question.');
            return;
        }
        setIsCoPilotLoading(true);
        setCoPilotError(null);
        setCoPilotResponse(null);
        try {
            const response = await fetch('/api/conversational-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: coPilotQuery }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to get insight from Co-pilot');
            }
            const data = await response.json();
            setCoPilotResponse(data.response);
        } catch (err: any) {
            setCoPilotError(err.message);
        } finally {
            setIsCoPilotLoading(false);
        }
    };


    const downloadCalendarCsv = () => {
        if (!contentCalendar) return;

        const headers = ['Day', 'Theme', 'Platform', 'PostSuggestion', 'CulturalTieIn'];
        const csvRows = [
            headers.join(','),
            ...contentCalendar.calendar.map(day => 
                [
                    day.day,
                    `"${day.theme.replace(/"/g, '""')}"`,
                    `"${day.platform.replace(/"/g, '""')}"`,
                    `"${day.postSuggestion.replace(/"/g, '""')}"`,
                    `"${(day.culturalTieIn || '').replace(/"/g, '""')}"`
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
                        <CardTitle>Export Center & AI Co-pilot</CardTitle>
                        <CardDescription>
                            Generate campaign materials, download lists, or ask our AI Co-pilot a question to get natural language insights. Start by selecting a target segment for the generators.
                        </CardDescription>
                    </CardHeader>
                     <CardContent>
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Generators</h3>
                            <div className="flex items-end gap-4 max-w-md mb-4">
                                <div className="flex-grow">
                                    <label className="text-sm font-medium">Target Segment</label>
                                    <Select onValueChange={setSelectedSegment} disabled={isSegmentsLoading || segments.length === 0} value={selectedSegment}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isSegmentsLoading ? "Loading..." : "No segments found"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {segments.map(s => <SelectItem key={s.segmentName} value={s.segmentName}>{s.segmentName}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Button variant="outline" className="h-auto py-4 flex flex-col items-start justify-start gap-2" onClick={handleGenerateBrief} disabled={isBriefLoading || !selectedSegment}>
                                    <div className="flex items-center gap-2"><Rocket className="h-5 w-5 text-primary"/> <h3 className="font-semibold text-lg">Campaign Brief</h3></div>
                                    <p className="text-xs text-muted-foreground text-left whitespace-normal">Generate a full campaign brief with strategy, messaging, and ROI.</p>
                                    {isBriefLoading && <Loader2 className="h-4 w-4 animate-spin self-center" />}
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col items-start justify-start gap-2" onClick={handleGenerateScript} disabled={isScriptLoading || !selectedSegment}>
                                    <div className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary"/> <h3 className="font-semibold text-lg">Sales Script</h3></div>
                                    <p className="text-xs text-muted-foreground text-left whitespace-normal">Generate a tailored sales script with talking points and objection handling.</p>
                                    {isScriptLoading && <Loader2 className="h-4 w-4 animate-spin self-center" />}
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col items-start justify-start gap-2" onClick={handleGenerateCalendar} disabled={isCalendarLoading}>
                                <div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary"/> <h3 className="font-semibold text-lg">Content Calendar</h3></div>
                                <p className="text-xs text-muted-foreground text-left whitespace-normal">Generate a 30-day content calendar based on overall cultural trends.</p>
                                {isCalendarLoading && <Loader2 className="h-4 w-4 animate-spin self-center" />}
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col items-start justify-start gap-2" onClick={handleDownloadCustomers} disabled={isDownloading}>
                                    <div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary"/> <h3 className="font-semibold text-lg">Customer List</h3></div>
                                    <p className="text-xs text-muted-foreground text-left whitespace-normal">Download a CSV of all customers with their assigned cultural segments.</p>
                                    {isDownloading && <Loader2 className="h-4 w-4 animate-spin self-center" />}
                                </Button>
                            </div>
                        </div>

                        <Separator />
                        
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Bot /> AI Strategy Co-pilot <span className="text-xs font-normal text-muted-foreground">(Powered by Cultura™)</span></h3>
                             <div className="space-y-4">
                                <div className="relative">
                                    <Textarea 
                                        placeholder="Ask a question... e.g., 'What music do my high-value customers like?' or 'How do I create a campaign for the Globetrotting Foodies segment?'"
                                        value={coPilotQuery}
                                        onChange={(e) => setCoPilotQuery(e.target.value)}
                                        className="pr-10"
                                    />
                                    <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground" disabled>
                                        <Mic className="h-4 w-4" />
                                        <span className="sr-only">Use Voice</span>
                                    </Button>
                                </div>
                                <Button onClick={handleCoPilotQuery} disabled={isCoPilotLoading}>
                                    {isCoPilotLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Get Insight
                                </Button>
                            </div>
                        </div>


                         {briefError && <Alert variant="destructive" className="mt-4"><AlertTitle>Error</AlertTitle><AlertDescription>{briefError}</AlertDescription></Alert>}
                         {calendarError && <Alert variant="destructive" className="mt-4"><AlertTitle>Error</AlertTitle><AlertDescription>{calendarError}</AlertDescription></Alert>}
                         {scriptError && <Alert variant="destructive" className="mt-4"><AlertTitle>Error</AlertTitle><AlertDescription>{scriptError}</AlertDescription></Alert>}
                         {coPilotError && <Alert variant="destructive" className="mt-4"><AlertTitle>Error</AlertTitle><AlertDescription>{coPilotError}</AlertDescription></Alert>}
                    </CardContent>
                </Card>

                {isCoPilotLoading && (
                    <Card>
                        <CardContent className="p-6 flex items-center justify-center">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            <p>Our AI Co-pilot is thinking...</p>
                        </CardContent>
                    </Card>
                )}

                {coPilotResponse && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Cultura's Response</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                                {coPilotResponse}
                            </div>
                        </CardContent>
                    </Card>
                )}


                {salesScript && (
                    <Card className="print:shadow-none print:border-none">
                        <CardHeader className="flex flex-row justify-between items-start">
                           <div>
                             <CardTitle className="text-2xl">{salesScript.scriptTitle}</CardTitle>
                             <CardDescription>Sales Script for: <Badge>{salesScript.targetSegment}</Badge></CardDescription>
                           </div>
                           <Button variant="outline" onClick={() => window.print()}><Download className="mr-2 h-4 w-4"/> Save as PDF</Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-muted-foreground italic border-l-4 pl-4">{salesScript.scriptIntroduction}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Opening Lines</h3>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                                        {salesScript.openingLines.map((line, i) => <li key={i}>{line}</li>)}
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                     <h3 className="font-semibold text-lg">Closing Techniques</h3>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                                        {salesScript.closingTechniques.map((tech, i) => <li key={i}>{tech}</li>)}
                                    </ul>
                                </div>
                            </div>
                            <Separator />
                             <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Key Talking Points</h3>
                                <div className="space-y-4">
                                    {salesScript.keyTalkingPoints.map((tp, i) => (
                                        <div key={i} className="p-3 border rounded-lg bg-accent/20">
                                            <p className="font-semibold">{tp.point}</p>
                                            <p className="text-xs text-muted-foreground mt-1"><span className="font-bold">Why it works:</span> {tp.culturalJustification}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Objection Handling</h3>
                                <div className="space-y-4">
                                    {salesScript.objectionHandling.map((oh, i) => (
                                        <div key={i} className="p-3 border rounded-lg">
                                            <p className="font-semibold text-destructive">Potential Objection: "{oh.potentialObjection}"</p>
                                            <p className="text-sm text-muted-foreground mt-1"><span className="font-bold text-green-600">Suggested Response:</span> {oh.suggestedResponse}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
                
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
                            <p className="text-muted-foreground italic border-l-4 pl-4">{campaignBrief.executiveSummary}</p>
                            <Separator />
                            <Card>
                                <CardHeader>
                                    <CardTitle className='flex items-center gap-2 text-xl'><AreaChart /> Projected Impact &amp; ROI</CardTitle>
                                    <CardDescription>{campaignBrief.projectedImpact.justification}</CardDescription>
                                </CardHeader>
                                <CardContent className='grid grid-cols-3 gap-4'>
                                    <div className='text-center p-4 border rounded-lg bg-green-500/10'>
                                        <p className='text-3xl font-bold text-green-600'>{campaignBrief.projectedImpact.conversionLift}</p>
                                        <p className='text-sm text-muted-foreground'>Conversion Lift</p>
                                    </div>
                                    <div className='text-center p-4 border rounded-lg bg-green-500/10'>
                                        <p className='text-3xl font-bold text-green-600'>{campaignBrief.projectedImpact.cpaReduction}</p>
                                        <p className='text-sm text-muted-foreground'>CPA Reduction</p>
                                    </div>
                                     <div className='text-center p-4 border rounded-lg bg-green-500/10'>
                                        <p className='text-3xl font-bold text-green-600'>{campaignBrief.projectedImpact.ltvIncrease}</p>
                                        <p className='text-sm text-muted-foreground'>LTV Increase</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2"><Target/> Target Segment Analysis</h3>
                                    <p className="text-sm">{campaignBrief.targetSegmentAnalysis}</p>
                                </div>
                                <div className="space-y-4">
                                     <h3 className="font-semibold text-lg flex items-center gap-2"><Lightbulb/> Cultural Insights</h3>
                                    <p className="text-sm">{campaignBrief.culturalInsights}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Messaging Strategy</h3>
                                <div className="p-4 border rounded-lg bg-accent/20">
                                    <p className="text-base font-medium"><strong className="text-foreground">Core Message:</strong> {campaignBrief.messagingStrategy.coreMessage}</p>
                                    <p className="text-sm mt-2"><strong className="text-foreground">Key Themes:</strong> {campaignBrief.messagingStrategy.keyThemes.join(', ')}</p>
                                    <Separator className="my-4" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-semibold text-sm flex items-center gap-2 mb-1"><Mail /> Sample Email Copy</h4>
                                            <p className="text-sm text-muted-foreground italic">"{campaignBrief.messagingStrategy.sampleEmailCopy}"</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm flex items-center gap-2 mb-1"><Video /> Sample Social Media Copy</h4>
                                            <p className="text-sm text-muted-foreground italic">"{campaignBrief.messagingStrategy.sampleSocialCopy}"</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Visual Direction</h3>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                        {campaignBrief.visualDirection.map((v,i) => <li key={i}>{v}</li>)}
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                     <h3 className="font-semibold text-lg flex items-center gap-2"><CheckCircle/> Success Metrics &amp; KPIs</h3>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                        {campaignBrief.successMetrics.map((m,i) => <li key={i}>{m}</li>)}
                                    </ul>
                                </div>
                            </div>
                             <div className="space-y-4">
                                 <h3 className="font-semibold text-lg flex items-center gap-2"><Wallet/> Budget Allocation Suggestions</h3>
                                <p className="text-sm text-muted-foreground">{campaignBrief.budgetAllocation}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}


                {contentCalendar && (
                     <Card>
                        <CardHeader className="flex-row justify-between items-center">
                           <div>
                             <CardTitle>30-Day Social Media Content Calendar</CardTitle>
                             <CardDescription>{contentCalendar.summary}</CardDescription>
                           </div>
                            <Button variant="outline" onClick={downloadCalendarCsv}><Download className="mr-2 h-4 w-4"/> Download as CSV</Button>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Day</TableHead>
                                        <TableHead>Theme</TableHead>
                                        <TableHead>Platform</TableHead>
                                        <TableHead>Suggestion</TableHead>
                                        <TableHead>Cultural Tie-In</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contentCalendar.calendar.map(day => (
                                        <TableRow key={day.day}>
                                            <TableCell className="font-bold">{day.day}</TableCell>
                                            <TableCell>{day.theme}</TableCell>
                                            <TableCell><Badge variant="secondary">{day.platform}</Badge></TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-sm">{day.postSuggestion}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground max-w-xs">{day.culturalTieIn || 'N/A'}</TableCell>
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
