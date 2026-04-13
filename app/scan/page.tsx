import BarcodeScannerApp from "@/ui/barcode/scanner-app";
import React from "react";

export default async function Page({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BarcodeScannerApp slug={undefined} />
      {children}
    </>
  );
}
