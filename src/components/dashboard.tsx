
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import { ArrowRight, Upload, Users, Milestone, LineChart, Target, Percent } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import type { ICustomerProfile } from '@/models/customer-profile';
import type { ISegment } from '@/models/segment';

export default function Dashboard() {
    const router = useRouter();
    const { data: session } = useSession();
    const [profiles, setProfiles] = useState<ICustomerProfile[]>([]);
    const [segments, setSegments] = useState<ISegment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [profilesRes, segmentsRes] = await Promise.all([
                    fetch('/api/customer-profiles'),
                    fetch('/api/customer-segments'),
                ]);
                
                if (!profilesRes.ok || !segmentsRes.ok) {
                    throw new Error('Failed to fetch data');
                }
                const profilesData = await profilesRes.json();
                const segmentsData = await segmentsRes.json();
                
                setProfiles(profilesData);
                setSegments(segmentsData.segments || []);

            } catch (err: any) {
                console.error(err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    
    const accuracyScore = useMemo(() => {
        const feedbackGiven = profiles.filter(p => p.accuracyFeedback !== 0 && p.accuracyFeedback !== undefined && p.accuracyFeedback !== null);
        if (feedbackGiven.length === 0) return null;

        const accurateCount = feedbackGiven.filter(p => p.accuracyFeedback === 1).length;
        return (accurateCount / feedbackGiven.length) * 100;
    }, [profiles]);

    const averageROI = useMemo(() => {
        const segmentsWithRoi = segments.filter(s => typeof s.actualROI === 'number');
        if (segmentsWithRoi.length === 0) return null;

        const totalRoi = segmentsWithRoi.reduce((acc, s) => acc + s.actualROI!, 0);
        return totalRoi / segmentsWithRoi.length;
    }, [segments]);


    const WelcomeCard = () => (
         <Card className="bg-gradient-to-br from-primary/10 to-transparent">
            <CardHeader>
                <CardTitle className="text-3xl">
                    Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}!
                </CardTitle>
                <CardDescription>
                    Ready to stop guessing and start understanding the cultural drivers behind your customer behavior?
                </CardDescription>
            </CardHeader>
        </Card>
    );
    
    const KpiCard = ({ title, value, unit, icon: Icon }: { title: string, value: number | null, unit: string, icon: React.ElementType }) => (
        <Card>
            <CardHeader>
                <CardDescription className="flex items-center gap-2"><Icon className="h-4 w-4" />{title}</CardDescription>
            </CardHeader>
            <CardContent>
                 {loading ? <Skeleton className="h-8 w-20" /> : (
                     value !== null ? (
                         <p className="text-3xl font-bold">{value.toFixed(1)}<span className="text-xl font-normal">{unit}</span></p>
                    ) : (
                        <p className="text-sm text-muted-foreground">No data yet</p>
                    )
                 )}
            </CardContent>
        </Card>
    );

    const OnboardingCard = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Upload className="text-primary"/> Get Started: Import Your Anonymized Customer Data</CardTitle>
                <CardDescription>
                    Stop marketing with outdated demographics. The first step to unlocking real cultural intelligence is to import your anonymized customer data. Upload a CSV file to begin the analysis.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => router.push('/import')}>
                    Go to Import Page <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
    );

    const NextStepsCard = () => (
        <Card>
             <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Your Customer Base at a Glance</CardTitle>
                        <CardDescription>You have successfully imported {profiles.length} customer profiles.</CardDescription>
                    </div>
                     <div className="flex items-center gap-2 text-primary font-bold">
                        <Users />
                        <span>{profiles.length} Profiles</span>
                     </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">Now you're ready to dive deeper. Generate cultural segments or analyze market trends.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={() => router.push('/segments')} className="flex-1">
                        <Milestone className="mr-2 h-4 w-4"/>
                        Generate Customer Segments
                    </Button>
                     <Button onClick={() => router.push('/analytics')} variant="secondary" className="flex-1">
                        <LineChart className="mr-2 h-4 w-4"/>
                        Analyze Market-Wide Trends
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
    
    const LoadingState = () => (
         <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
            </Card>
             <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-48" />
                </CardContent>
            </Card>
         </div>
    );

  return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <WelcomeCard />
        
        {loading ? (
            <LoadingState />
        ) : (
            <>
                {profiles.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Overview</CardTitle>
                             <CardDescription>High-level metrics on AI accuracy and campaign performance.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                             <KpiCard key="accuracy" title="Cultural DNA Accuracy" value={accuracyScore} unit="%" icon={Target} />
                             <KpiCard key="roi" title="Avg. Campaign ROI" value={averageROI} unit="%" icon={Percent} />
                        </CardContent>
                    </Card>
                )}

                {profiles.length === 0 ? (
                    <OnboardingCard />
                ) : (
                    <NextStepsCard />
                )}
            </>
        )}
      </main>
  );
}
