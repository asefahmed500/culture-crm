
'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, FileText, X, CheckCircle, Info, Loader2, Sparkles } from 'lucide-react';
import { ProcessCustomerDataOutput } from '@/ai/flows/process-customer-data-flow';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

type CsvData = string[][];
type Mapping = {
  [key: string]: string;
};

const requiredFields = ['age_range', 'spending_level', 'purchase_categories', 'interaction_frequency'];
const importantField = 'purchase_categories';
const UNMAPPED_VALUE = '--unmapped--';

export default function CustomerImportPage() {
  const { data: session, status } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<CsvData>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Mapping>({});
  const [isMappingLoading, setIsMappingLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessCustomerDataOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSmartMap = useCallback(async (headers: string[], data: CsvData) => {
    setIsMappingLoading(true);
    setError(null);
    try {
        const response = await fetch('/api/genkit/flow/generateColumnMapping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ headers, previewData: data.slice(0, 5) }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'AI mapping failed');
        }

        const smartMapping = await response.json();
        setMapping(smartMapping);

    } catch (err: any) {
        setError(`AI auto-mapping failed: ${err.message}. Please map columns manually.`);
    } finally {
        setIsMappingLoading(false);
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile && (uploadedFile.type === 'text/csv' || uploadedFile.name.endsWith('.csv'))) {
      setFile(uploadedFile);
      setError(null);
      setResult(null);

      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/"/g, '')));
        
        const validHeaders = rows[0].filter(header => header.trim() !== '');
        const validData = rows.slice(1).filter(row => row.length === rows[0].length && row.some(cell => cell));

        setHeaders(validHeaders);
        setData(validData);

        handleSmartMap(validHeaders, validData);
      };
      reader.readAsText(uploadedFile);
    } else {
      setError('Please upload a valid CSV file.');
    }
  }, [handleSmartMap]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'text/csv': ['.csv']} });

  const handleMappingChange = (csvHeader: string, systemField: string) => {
    setMapping(prev => ({ ...prev, [csvHeader]: systemField === UNMAPPED_VALUE ? '' : systemField }));
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
    const backendMapping: Mapping = {};
    for (const key in mapping) {
        if (mapping[key] && mapping[key] !== UNMAPPED_VALUE) {
            backendMapping[key] = mapping[key];
        }
    }
    
    const mappedColumns = Object.values(backendMapping);
    const allRequiredFieldsMapped = requiredFields.every(field => mappedColumns.includes(field));

    if (!allRequiredFieldsMapped) {
        setError('Please map all required fields: ' + requiredFields.map(f => f.replace(/_/g, ' ')).join(', '));
        return;
    }

    setProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    const fileContent = await file!.text();

    const progressInterval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 90) {
                clearInterval(progressInterval);
                return 90;
            }
            return prev + 10;
        });
    }, 500);

    try {
        const response = await fetch('/api/genkit/flow/processCustomerData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                csvData: fileContent,
                columnMapping: backendMapping
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'An error occurred during processing.');
        }

        const responseData = await response.json();
        setResult(responseData);
    } catch (e: any) {
        setError(e.message || 'An error occurred during processing.');
    } finally {
        clearInterval(progressInterval);
        setProgress(100);
        setProcessing(false);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Customer Data Import</CardTitle>
          <CardDescription>Upload a CSV file to import and analyze customer data. This process will add new profiles to your existing database.</CardDescription>
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
              <CardDescription>Map your CSV columns to the required system fields. The AI will attempt to auto-map them. Unmapped columns will be ignored.</CardDescription>
               <Alert className="mt-4">
                  <Info className="h-4 w-4"/>
                  <AlertTitle>Powered by Qloo Taste AI™ & Gemini</AlertTitle>
                  <AlertDescription>
                      The <strong>Purchase Categories</strong> field is the most important. It will be sent to the Qloo API to get taste correlation data. Then, Gemini synthesizes this data into a rich Cultural DNA profile for each customer.
                  </AlertDescription>
               </Alert>
            </CardHeader>
            <CardContent>
              {isMappingLoading && (
                  <div className="flex items-center justify-center p-8 gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span>AI is auto-mapping your columns...</span>
                  </div>
              )}
              {!isMappingLoading && headers.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {headers.map(header => (
                      <div key={header} className="space-y-2">
                          <p className="font-medium">{header}</p>
                          <div className="flex items-center gap-1">
                              <Select onValueChange={value => handleMappingChange(header, value)} value={mapping[header] || UNMAPPED_VALUE}>
                              <SelectTrigger>
                                  <SelectValue placeholder="- Unmapped -" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value={UNMAPPED_VALUE}>- Unmapped -</SelectItem>
                                  {requiredFields.map(field => (
                                  <SelectItem key={field} value={field} className={field === importantField ? 'font-bold' : ''}>
                                      {field.replace(/_/g, ' ')}{field === importantField ? ' (AI Input)' : ''}
                                  </SelectItem>
                                  ))}
                              </SelectContent>
                              </Select>
                              {mapping[header] && mapping[header] !== '' && (
                                   <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => handleMappingChange(header, UNMAPPED_VALUE)}>
                                      <X className="h-4 w-4" />
                                  </Button>
                              )}
                          </div>
                      </div>
                      ))}
                  </div>
              )}
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
            <Button onClick={handleProcess} disabled={processing || isMappingLoading}>
              {processing ? 'Processing...' : 'Process & Save Data'}
            </Button>
          </div>
        </>
      )}

      {processing && (
          <Card>
              <CardHeader>
                  <CardTitle>Processing Data...</CardTitle>
                  <CardDescription>The AI is analyzing, cleaning, and saving your data. Please wait.</CardDescription>
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
            <Alert variant="default" className="bg-green-100 dark:bg-green-900/20 border-green-500/50 text-green-800 dark:text-green-300">
              <CheckCircle className="h-4 w-4 !text-green-600 dark:!text-green-400"/>
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                  Your data has been processed and saved. You can view the results below or see all profiles on the{' '}
                  <Link href="/customers" className="font-bold underline hover:text-green-900 dark:hover:text-green-200">
                      Customers page
                  </Link>.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                  <CardHeader><CardTitle>Records Processed</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{result.recordsProcessed}</p></CardContent>
              </Card>
               <Card>
                  <CardHeader><CardTitle>Records Saved</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{result.recordsSaved}</p></CardContent>
              </Card>
              <Card>
                  <CardHeader><CardTitle>Data Quality</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{result.dataQuality.completeness.toFixed(2)}%</p><span className='text-sm text-muted-foreground'>Completeness</span></CardContent>
              </Card>
            </div>
            {result.processedData?.length > 0 && (
              <Card>
                  <CardHeader><CardTitle>Processed Data Preview</CardTitle><CardDescription>This is a preview of the first 5 records saved to the database.</CardDescription></CardHeader>
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
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
