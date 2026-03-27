"use client";

import { QuantityUnitConversion } from "@/interfaces/grocy";
import { createContext } from "react";

export const QuantityUnitConversionContext = createContext<Promise<
  QuantityUnitConversion[]
> | null>(null);

export default function QuantityUnitConversionProvider({
  children,
  promise,
}: {
  children: React.ReactNode;
  promise: Promise<QuantityUnitConversion[]> | null;
}) {
  return (
    <QuantityUnitConversionContext value={promise}>
      {children}
    </QuantityUnitConversionContext>
  );
}
