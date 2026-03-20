"use client";

import { ProductLocation } from "@/interfaces/grocy";
import { createContext } from "react";

export const LocationContext = createContext<Promise<ProductLocation>[] | null>([]);

export default function LocationProvider({
  children,
  promise,
}: {
  children: React.ReactNode;
  promise: Promise<ProductLocation>[] | null;
}) {
  return <LocationContext value={promise}>{children}</LocationContext>;
}
