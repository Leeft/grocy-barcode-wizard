import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/ui/navbar";
import UserProvider from "@/providers/user-context";
import { getUser } from "./lib/user-db";
import { countPendingProducts } from "./lib/product-db";
import { Toaster } from "react-hot-toast";
import { isEnvironmentConfigured } from "./lib/utils";
import GitHub from "./components/icons/github";
import React from "react";

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
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThreeColumnLayout>
          <LeftColumn />
          <CentreColumn>
            <UserProvider promise={getUser(1)}>
              <div className="flex h-full flex-auto flex-col justify-between">
                <header className="">
                  <Toaster
                    toastOptions={{
                      // Define default options
                      className: "",
                      duration: 6000,
                      removeDelay: 1000,
                      style: {
                        background: "#363636",
                        color: "#fff",
                      },

                      // Default options for specific types
                      success: {
                        duration: 3000,
                        iconTheme: {
                          primary: "green",
                          secondary: "black",
                        },
                      },
                      error: {
                        duration: 10000,
                      },
                    }}
                  />
                  {isEnvironmentConfigured() && <Navbar promise={countPendingProducts()} />}
                </header>
                <main id="main" className="mb-auto h-full flex-auto basis-full">
                  {children}
                </main>
                <footer className="text-footer h-6 brightness-150">
                  Grocy Barcode Wizard &mdash; created by Lianna{" "}
                  <a target="_blank" href="https://github.com/Leeft/grocy-barcode-wizard">
                    <GitHub className={`fill-footer ml-6 inline size-7 pr-2`} />
                    github.com
                  </a>
                </footer>
              </div>
            </UserProvider>
          </CentreColumn>
          <RightColumn />
        </ThreeColumnLayout>
      </body>
    </html>
  );
}

const columnsEnabled = true;

function ThreeColumnLayout({ children }: { children: React.ReactNode }) {
  if (!columnsEnabled) return <>{children}</>;
  return <div className="flex min-h-lvh grow flex-row">{children}</div>;
}

function LeftColumn() {
  if (!columnsEnabled) return <></>;
  return <div className="hidden w-10 md:flex-auto lg:block"></div>;
}

function CentreColumn({ children }: { children: React.ReactNode }) {
  if (!columnsEnabled) return <>{children}</>;
  return (
    <div className="relative w-full max-w-240 grow bg-slate-800 px-2 py-2 text-sm md:px-4">{children}</div>
  );
}

function RightColumn() {
  if (!columnsEnabled) return <></>;
  return <div className="hidden w-10 md:flex-auto lg:block"></div>;
}
