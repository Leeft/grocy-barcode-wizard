import BarcodeScannerApp from "@/ui/barcode/scanner-app";
import React, { Suspense } from "react";

export default async function Page({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BarcodeScannerApp />
      <Suspense>{children}</Suspense>
    </>
  );
}
