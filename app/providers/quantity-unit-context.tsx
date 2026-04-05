"use client";

import { QuantityUnit } from "@/interfaces/grocy";
import { createContext } from "react";

export const QuantityUnitContext = createContext<Promise<
  QuantityUnit[]
> | null>(null);

export default function QuantityUnitProvider({
  children,
  promise,
}: {
  children: React.ReactNode;
  promise: Promise<QuantityUnit[]> | null;
}) {
  return <QuantityUnitContext value={promise}>{children}</QuantityUnitContext>;
}
