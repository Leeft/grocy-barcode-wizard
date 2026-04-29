"use client";

import { StockEntry } from "@/interfaces/grocy";
import { createContext } from "react";

export const ProductStockContext = createContext<Promise<StockEntry[]> | null>(null);

export default function ProductStockProvider({
  children,
  promise,
}: {
  children: React.ReactNode;
  promise: Promise<StockEntry[]> | null;
}) {
  return <ProductStockContext value={promise}>{children}</ProductStockContext>;
}
