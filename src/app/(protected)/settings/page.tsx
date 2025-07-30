
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Trash2, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from 'next/navigation';

interface ISettings {
    averageLTV: number;
    averageConversionRate: number;
    averageCPA: number;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<ISettings>({
        averageLTV: 0,
        averageConversionRate: 0,
        averageCPA: 0
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/settings');
                if (response.ok) {
                    const data = await response.json();
                    setSettings(data);
                } else {
                     toast({
                        title: 'Notice',
                        description: 'No settings found. Using default values.',
                        variant: 'default',
                    });
                }
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to fetch settings.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [toast]);
    
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (!response.ok) {
                throw new Error('Failed to save settings');
            }

            toast({
                title: 'Success',
                description: 'Settings have been saved.',
            });
        } catch (error: any) {
             toast({
                title: 'Error',
                description: error.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    }
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, [id]: Number(value) }));
    };

    const handleClearData = async () => {
        setIsClearing(true);
        try {
            const response = await fetch('/api/data/clear', {
                method: 'POST',
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to clear data');
            }
             toast({
                title: 'Success!',
                description: data.message,
            });
            // A full reload is better to ensure all state is reset across the app
            router.refresh(); 
            window.location.reload();
        } catch (error: any) {
             toast({
                title: 'Error Clearing Data',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsClearing(false);
        }
    };

    if (loading) {
        return (
            <main className="flex-1 p-4 md:p-8">
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-full max-w-lg" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full max-w-sm" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full max-w-sm" />
                        </div>
                         <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full max-w-sm" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </CardContent>
                 </Card>
            </main>
        );
    }

    return (
        <main className="flex-1 p-4 md:p-8 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Business Settings</CardTitle>
                    <CardDescription>
                        Enter your baseline business metrics here. The AI will use these values to generate more accurate ROI projections for campaign briefs.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-2 max-w-sm">
                            <Label htmlFor="averageLTV">Average Customer Lifetime Value (LTV) in $</Label>
                            <Input id="averageLTV" type="number" value={settings.averageLTV} onChange={handleInputChange} placeholder="e.g., 500" />
                        </div>
                         <div className="space-y-2 max-w-sm">
                            <Label htmlFor="averageConversionRate">Average Campaign Conversion Rate in %</Label>
                            <Input id="averageConversionRate" type="number" step="0.1" value={settings.averageConversionRate} onChange={handleInputChange} placeholder="e.g., 2.5" />
                        </div>
                         <div className="space-y-2 max-w-sm">
                            <Label htmlFor="averageCPA">Average Customer Acquisition Cost (CPA) in $</Label>
                            <Input id="averageCPA" type="number" value={settings.averageCPA} onChange={handleInputChange} placeholder="e.g., 50" />
                        </div>
                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Settings
                        </Button>
                    </form>
                </CardContent>
            </Card>

             <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/> Danger Zone</CardTitle>
                    <CardDescription>
                       These actions are permanent and cannot be undone.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isClearing}>
                                 {isClearing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                Clear All Customer Data
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete all customer profiles,
                                segments, campaigns, and analytics stories from the database.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClearData} disabled={isClearing} className="bg-destructive hover:bg-destructive/90">
                                {isClearing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Yes, delete everything
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <p className="text-xs text-muted-foreground mt-2">
                        This will delete all customer profiles, segments, campaigns, and stories. Business settings will not be affected.
                    </p>
                </CardContent>
            </Card>
        </main>
    );
}
