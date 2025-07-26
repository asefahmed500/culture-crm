
'use client';

import { BarChart, Filter, Zap, Users, BrainCircuit, LineChart, PieChart, Upload, Rocket } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold">Cultural CRM</span>
          </Link>
          <nav className="hidden flex-1 items-center justify-center space-x-6 text-sm font-medium md:flex">
            <Link
              href="#features"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </Link>
             <Link
              href="#problem"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              The Problem
            </Link>
          </nav>
          <div className="flex flex-1 items-center justify-end space-x-2">
             <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-12 text-center md:py-24 lg:py-32">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Stop Guessing. Understand the <span className="text-primary">Why</span> Behind the Buy.
          </h1>
          <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
            Your CRM is stuck in the 1950s. While 76% of consumers get frustrated by impersonal experiences, most CRMs still use outdated demographics. It's time to go deeper.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </section>

        <section id="problem" className="w-full bg-muted py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">The Problem</div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">You're Marketing in the Dark</h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    95% of new consumer products fail, often due to a failure to understand consumer needs. Most CRMs segment by age, location, and income—demographic models based on 1950s thinking. This tells you *who* is buying, but not *why*. An insight like <strong className="text-foreground">"Eco-conscious indie enthusiasts"</strong> is far more actionable and predictive than <strong className="text-foreground">"25-35 year olds in NYC."</strong>
                  </p>
                </div>
              </div>
               <div className="flex items-center justify-center p-8 bg-background/50 rounded-xl relative aspect-video overflow-hidden border">
                  <PieChart className="h-32 w-32 text-primary/30 absolute -bottom-10 -left-10" />
                  <LineChart className="h-48 w-48 text-primary/30 absolute -top-12 -right-16" />
                  <BarChart className="h-40 w-40 text-primary relative" />
              </div>
            </div>
          </div>
        </section>


        <section id="features" className="container space-y-12 py-12 md:py-24 lg:py-32">
            <div className="mx-auto flex max-w-4xl flex-col items-center space-y-4 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">A More Intelligent Way to Grow</h2>
                <p className="text-muted-foreground md:text-xl">
                    Powerful features to decode your customer's cultural DNA and drive business results.
                </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
                <div className="grid gap-1 rounded-lg border bg-card p-6 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">Cultural Personas</h3>
                    <p className="text-sm text-muted-foreground">Automatically segment customers into rich personas like "Eco-Conscious Indie Enthusiasts" instead of "Ages 25-34."</p>
                </div>
                <div className="grid gap-1 rounded-lg border bg-card p-6 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <BrainCircuit className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">Cultural DNA Profiles</h3>
                    <p className="text-sm text-muted-foreground">Visualize customer affinities across music, dining, entertainment, and more to truly understand them.</p>
                </div>
                <div className="grid gap-1 rounded-lg border bg-card p-6 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Filter className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">1-Click Campaign Generation</h3>
                    <p className="text-sm text-muted-foreground">Instantly generate tailored campaign briefs, sales scripts, and content calendars for any cultural segment.</p>
                </div>
            </div>
        </section>


        <section id="how-it-works" className="w-full bg-muted py-12 md:py-24 lg:py-32">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">How It Works</h2>
              <p className="text-muted-foreground md:text-xl">
                Turn anonymous data into rich cultural insights in three simple steps.
              </p>
               <ul className="grid gap-6">
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">1. Import Your Data</h3>
                    <p className="text-muted-foreground">
                      Securely upload your anonymized customer data (e.g., transaction history). Our system automatically removes PII and standardizes your information.
                    </p>
                  </div>
                </li>
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">2. AI-Powered Analysis</h3>
                    <p className="text-muted-foreground">
                      We query the Qloo API to get cultural correlation data, then use a Gemini to analyze the results and build a detailed Cultural DNA profile for each customer.
                    </p>
                  </div>
                </li>
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">3. Activate Insights</h3>
                    <p className="text-muted-foreground">
                      Use the generated communication strategies, personas, and targeted campaign materials to connect with your customers on a deeper level.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
             <div className="flex items-center justify-center p-8 bg-background/50 rounded-xl aspect-video border">
                <div className="flex items-center justify-center gap-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-4 rounded-full bg-primary/10 border-2 border-dashed border-primary/20"><Upload className="h-10 w-10 text-primary" /></div>
                    <p className="font-bold">Import</p>
                  </div>
                   <div className="h-1 w-10 bg-border rounded-full" />
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-4 rounded-full bg-primary/10 border-2 border-dashed border-primary/20"><BrainCircuit className="h-10 w-10 text-primary" /></div>
                    <p className="font-bold">Analyze</p>
                  </div>
                   <div className="h-1 w-10 bg-border rounded-full" />
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-4 rounded-full bg-primary/10 border-2 border-dashed border-primary/20"><Rocket className="h-10 w-10 text-primary" /></div>
                    <p className="font-bold">Activate</p>
                  </div>
                </div>
              </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Zap className="h-6 w-6 text-primary" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
             © {new Date().getFullYear()} Cultural CRM. A Qloo LLM Hackathon Project.
            </p>
          </div>
           <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built with Next.js, Gemini, and Qloo's Taste AI™.
            </p>
        </div>
      </footer>
    </div>
  );
}
