"use client";

import { QuantityUnitConversion } from "@/interfaces/grocy";
import { createContext } from "react";

export const QuantityUnitConversionResolvedContext = createContext<Promise<QuantityUnitConversion[]> | null>(
  null,
);

export default function QuantityUnitConversionResolvedProvider({
  children,
  promise,
}: {
  children: React.ReactNode;
  promise: Promise<QuantityUnitConversion[]> | null;
}) {
  return (
    <QuantityUnitConversionResolvedContext value={promise}>{children}</QuantityUnitConversionResolvedContext>
  );
}
