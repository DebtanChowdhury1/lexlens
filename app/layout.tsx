import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'LexLens — See Through Every Contract',
    template: '%s | LexLens',
  },
  description:
    'AI-powered contract analyzer. Upload any legal document and instantly get risk scores, red flag alerts, plain-English clause explanations, and a downloadable PDF report.',
  keywords: ['contract analysis', 'AI legal', 'risk assessment', 'legal tech', 'contract review'],
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
    shortcut: '/icon',
  },
  openGraph: {
    title: 'LexLens — See Through Every Contract',
    description: 'AI-powered contract analyzer. Sign nothing blindly.',
    type: 'website',
    siteName: 'LexLens',
  },
  twitter: {
    card: 'summary',
    title: 'LexLens — See Through Every Contract',
    description: 'AI-powered contract analyzer. Sign nothing blindly.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="bg-[#0A0A0F] text-[#F8FAFC] antialiased">
          {/* Skip to main content — keyboard / screen-reader users */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-violet-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
          >
            Skip to main content
          </a>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#12121A',
                color: '#F8FAFC',
                border: '1px solid #2D2D40',
                borderRadius: '8px',
              },
              success: {
                iconTheme: { primary: '#059669', secondary: '#F8FAFC' },
              },
              error: {
                iconTheme: { primary: '#DC2626', secondary: '#F8FAFC' },
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
