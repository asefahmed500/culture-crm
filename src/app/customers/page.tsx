
'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';

interface ICustomerProfile {
    _id: string;
    ageRange: string;
    spendingLevel: string;
    purchaseCategories: string[];
    interactionFrequency: string;
    createdAt: string;
}

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
            </TableRow>
        ))
    );

    return (
        <AppShell>
            <main className="flex-1 p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Profiles</CardTitle>
                        <CardDescription>
                            A list of all processed and anonymized customer profiles stored in the database.
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
                                    <TableHead>Interaction Frequency</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? renderSkeletons() : (
                                    profiles.length > 0 ? (
                                        profiles.map(profile => (
                                            <TableRow key={profile._id}>
                                                <TableCell>{format(new Date(profile.createdAt), 'PPp')}</TableCell>
                                                <TableCell><Badge variant="outline">{profile.ageRange || 'N/A'}</Badge></TableCell>
                                                <TableCell><Badge variant={
                                                    profile.spendingLevel === 'High' ? 'default' : profile.spendingLevel === 'Medium' ? 'secondary' : 'outline'
                                                }>{profile.spendingLevel || 'N/A'}</Badge></TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(profile.purchaseCategories && profile.purchaseCategories.length > 0) ? profile.purchaseCategories.map(cat => (
                                                            <Badge key={cat} variant="secondary">{cat}</Badge>
                                                        )) : 'N/A'}
                                                    </div>
                                                </TableCell>
                                                <TableCell><Badge variant="outline">{profile.interactionFrequency || 'N/A'}</Badge></TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24">
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
