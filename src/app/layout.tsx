import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grocy Barcode Wizard",
  description: "A no-frills, opinionated, quick to use barcode scanner frontend for your Grocy instance",
};

export const viewport: Viewport = {
  initialScale: 1,
 // width: 860,
  width: 'device-width',
  //viewportFit: 'cover',
}

export default function RootLayout({ children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main className="min-h-screen md:pt-4 md:pl-4 md:lr-4">
          {children}
        </main>

      </body>
    </html>
  );
}
