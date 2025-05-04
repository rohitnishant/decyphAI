import type {Metadata} from 'next';
import {Geist} from 'next/font/google'; // Removed Geist_Mono as it wasn't used
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Removed geistMono as it wasn't used

export const metadata: Metadata = {
  title: 'InsightScan', // Updated title
  description: 'AI-powered image analysis for product labels and medical reports.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning={true}> {/* Keep suppressHydrationWarning on html */}
      <body
        className={cn(geistSans.variable, "antialiased font-sans flex flex-col min-h-screen bg-background")}
        suppressHydrationWarning={true} // Add suppressHydrationWarning to body as well
      >
        <main>
          {children}
        </main>
        <Toaster /> {/* Add Toaster here */}
      </body>
    </html>
  );
}
