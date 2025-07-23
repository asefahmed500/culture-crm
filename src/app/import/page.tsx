
'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, FileText, X } from 'lucide-react';
import AppShell from '@/components/app-shell';
import { processCustomerData, ProcessCustomerDataOutput } from '@/ai/flows/process-customer-data-flow';

type CsvData = string[][];
type Mapping = {
  [key: string]: string;
};

const requiredFields = ['age_range', 'spending_level', 'purchase_categories', 'interaction_frequency'];

export default function CustomerImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<CsvData>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Mapping>({});
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessCustomerDataOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile && uploadedFile.type === 'text/csv') {
      setFile(uploadedFile);
      setError(null);
      setResult(null);

      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const rows = text.split('\n').map(row => row.split(','));
        setHeaders(rows[0]);
        setData(rows.slice(1));
        // Reset mapping when new file is uploaded
        setMapping(rows[0].reduce((acc, header) => ({ ...acc, [header]: '' }), {}));
      };
      reader.readAsText(uploadedFile);
    } else {
      setError('Please upload a valid CSV file.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'text/csv': ['.csv']} });

  const handleMappingChange = (csvHeader: string, systemField: string) => {
    setMapping(prev => ({ ...prev, [csvHeader]: systemField }));
  };
  
  const handleRemoveFile = () => {
    setFile(null);
    setData([]);
    setHeaders([]);
    setMapping({});
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const handleProcess = async () => {
    const mappedColumns = Object.values(mapping);
    const allRequiredFieldsMapped = requiredFields.every(field => mappedColumns.includes(field));

    if (!allRequiredFieldsMapped) {
        setError('Please map all required fields: ' + requiredFields.join(', '));
        return;
    }

    setProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    const fileContent = await file!.text();

    // Simulate progress
    const progressInterval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 90) {
                clearInterval(progressInterval);
                return 90;
            }
            return prev + 10;
        });
    }, 200);

    try {
        const response = await processCustomerData({
            csvData: fileContent,
            columnMapping: mapping
        });
        setResult(response);
    } catch (e: any) {
        setError(e.message || 'An error occurred during processing.');
    } finally {
        clearInterval(progressInterval);
        setProgress(100);
        setProcessing(false);
    }
  };

  return (
    <AppShell>
      <main className="flex-1 p-4 md:p-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Customer Data Import</CardTitle>
            <CardDescription>Upload a CSV file to import customer data for cultural intelligence analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            {!file ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary ${isDragActive ? 'border-primary bg-accent' : 'border-border'}`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  {isDragActive ? 'Drop the file here ...' : "Drag 'n' drop a CSV file here, or click to select a file"}
                </p>
              </div>
            ) : (
                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            {error && <Alert variant="destructive" className="mt-4"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
          </CardContent>
        </Card>

        {headers.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Column Mapping</CardTitle>
                <CardDescription>Map your CSV columns to the required system fields. Unmapped columns will be ignored.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {headers.map(header => (
                  <div key={header} className="space-y-2">
                    <p className="font-medium">{header}</p>
                    <Select onValueChange={value => handleMappingChange(header, value)} value={mapping[header]}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">- Unmapped -</SelectItem>
                        {requiredFields.map(field => (
                          <SelectItem key={field} value={field}>{field.replace(/_/g, ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Preview</CardTitle>
                <CardDescription>Showing the first 10 rows of your data.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map(header => (
                        <TableHead key={header}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.slice(0, 10).map((row, i) => (
                      <TableRow key={i}>
                        {row.map((cell, j) => (
                          <TableCell key={j}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleProcess} disabled={processing}>
                {processing ? 'Processing...' : 'Process Data'}
              </Button>
            </div>
          </>
        )}

        {processing && (
            <Card>
                <CardHeader>
                    <CardTitle>Processing Data</CardTitle>
                </CardHeader>
                <CardContent>
                    <Progress value={progress} className="w-full" />
                    <p className="text-center mt-2 text-sm text-muted-foreground">{progress}% complete</p>
                </CardContent>
            </Card>
        )}
        
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Import Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="default" className="bg-accent">
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>Your data has been processed successfully.</AlertDescription>
              </Alert>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader><CardTitle>Processed Records</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{result.recordsProcessed}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Data Quality</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{result.dataQuality.completeness.toFixed(2)}% complete</p></CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader><CardTitle>Processed Data Preview</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {Object.keys(result.processedData[0] || {}).map(header => (
                                    <TableHead key={header}>{header.replace(/_/g, ' ')}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {result.processedData.slice(0, 5).map((row, i) => (
                                <TableRow key={i}>
                                    {Object.values(row).map((cell: any, j: number) => (
                                        <TableCell key={j}>{Array.isArray(cell) ? cell.join(', ') : cell}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )}

      </main>
    </AppShell>
  );
}
