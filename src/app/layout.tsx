import type {Metadata} from 'next';
import {Geist} from 'next/font/google'; // Removed Geist_Mono as it wasn't used
import Script from 'next/script'; // Import Script
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Removed geistMono as it wasn't used

export const metadata: Metadata = {
  title: 'decyph.ai', // Updated title
  description: 'AI-powered image analysis for product labels and medical reports.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning={true}> {/* Keep suppressHydrationWarning on html */}
    <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','GTM-MPSHTLKV');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
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
