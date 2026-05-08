import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/ui/navbar";
import UserProvider from "@/providers/user-context";
import { getUser } from "./lib/user-db";
import { countPendingProducts } from "./lib/product-db";
import { Toaster } from "react-hot-toast";
import { isEnvironmentConfigured } from "./lib/utils";

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
        <div className="flex min-h-screen w-screen">
          <div className="hidden w-10 md:flex-auto lg:block"></div>
          <main id="main" className="relative w-full max-w-240 grow bg-slate-800 px-2 py-2 text-sm md:px-4">
            <UserProvider promise={getUser(1)}>
              <div>
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
              </div>
              {isEnvironmentConfigured() && <Navbar promise={countPendingProducts()} />}
              {children}
            </UserProvider>
          </main>
          <div className="hidden w-10 md:flex-auto lg:block"></div>
        </div>
      </body>
    </html>
  );
}
