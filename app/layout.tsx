import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ToastProvider from "@/components/ui/ToastProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = 'https://www.accessaudit.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'AccessAudit — ADA Website Compliance Scanner & Monitoring',
    template: '%s | AccessAudit',
  },
  description:
    'Find and fix ADA/WCAG accessibility violations on your website. Free scan, plain-English reports, automated monitoring. Plans from $79/month.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'AccessAudit',
    title: 'AccessAudit — ADA Website Compliance Scanner & Monitoring',
    description:
      'Find and fix ADA/WCAG accessibility violations on your website. Free scan, plain-English reports, automated monitoring. Plans from $79/month.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'AccessAudit — ADA Website Compliance Scanner & Monitoring',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AccessAudit — ADA Website Compliance Scanner & Monitoring',
    description:
      'Find and fix ADA/WCAG accessibility violations on your website. Free scan, plain-English reports, automated monitoring. Plans from $79/month.',
    images: ['/og-default.png'],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
