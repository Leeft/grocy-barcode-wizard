"use client";

import { Product } from "@/interfaces/grocy";
import { createContext } from "react";

export const GrocyProductContext = createContext<Promise<Product> | null>(null);

export default function GrocyProductProvider({
  children,
  promise,
}: {
  children: React.ReactNode;
  promise: Promise<Product> | null;
}) {
  return <GrocyProductContext value={promise}>{children}</GrocyProductContext>;
}
