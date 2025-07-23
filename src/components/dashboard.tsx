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
import { useEffect, useState } from 'react';
import { ArrowRight, Loader2, Upload, Users, Milestone } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface ICustomerProfile {
    _id: string;
}

export default function Dashboard() {
    const router = useRouter();
    const { data: session } = useSession();
    const [profiles, setProfiles] = useState<ICustomerProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/customer-profiles');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();
                setProfiles(data);
            } catch (err: any) {
                console.error(err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, []);

    const WelcomeCard = () => (
         <Card className="bg-gradient-to-br from-primary/10 to-transparent">
            <CardHeader>
                <CardTitle className="text-3xl">
                    Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}!
                </CardTitle>
                <CardDescription>
                    Ready to uncover the cultural drivers behind your customer behavior?
                </CardDescription>
            </CardHeader>
        </Card>
    );

    const OnboardingCard = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Upload className="text-primary"/> Get Started: Import Your First Batch of Customers</CardTitle>
                <CardDescription>
                    The first step to unlocking cultural intelligence is to import your anonymized customer data. Upload a CSV file to begin the analysis.
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
                        <CardTitle>Your Customer Base</CardTitle>
                        <CardDescription>You have successfully imported {profiles.length} customer profiles.</CardDescription>
                    </div>
                     <div className="flex items-center gap-2 text-primary font-bold">
                        <Users />
                        <span>{profiles.length} Profiles</span>
                     </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p>Now you're ready to dive deeper. What would you like to do next?</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={() => router.push('/segments')} className="flex-1">
                        <Milestone className="mr-2 h-4 w-4"/>
                        Generate Customer Segments
                    </Button>
                     <Button onClick={() => router.push('/analytics')} variant="secondary" className="flex-1">
                        <Users className="mr-2 h-4 w-4"/>
                        Analyze Trends & Analytics
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
    
    const LoadingState = () => (
         <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
            </Card>
             <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-1/3" />
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
        ) : profiles.length === 0 ? (
            <OnboardingCard />
        ) : (
            <NextStepsCard />
        )}
      </main>
  );
}
