import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// @ts-expect-error can't import CSS in typescript
import "@/styles/globals.css";
import Navbar from "@/ui/navbar";

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
  description:
    "A no-frills, opinionated, quick to use barcode scanner frontend for your Grocy instance",
};

export const viewport: Viewport = {
  initialScale: 1,
  // width: 860,
  width: "device-width",
  //viewportFit: 'cover',
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
        <div className="flex min-h-screen w-screen">
          <div className="hidden w-10 md:flex-auto lg:block"></div>
          <main
            id="main"
            className="relative w-full max-w-240 grow bg-slate-800 px-2 py-2 text-sm md:px-4"
          >
            <Navbar />
            {children}
          </main>
          <div className="hidden w-10 md:flex-auto lg:block"></div>
        </div>
      </body>
    </html>
  );
}
