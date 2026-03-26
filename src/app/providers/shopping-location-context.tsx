"use client";

import { ShoppingLocation } from "@/interfaces/grocy";
import { createContext } from "react";

export const ShoppingLocationContext = createContext<Promise<ShoppingLocation>[] | null>([]);

export default function ShoppingLocationProvider({
  children,
  promise,
}: {
  children: React.ReactNode;
  promise: Promise<ShoppingLocation>[] | null;
}) {
  return <ShoppingLocationContext value={promise}>{children}</ShoppingLocationContext>;
}
