"use client";

import { ProductLocation } from "@/interfaces/grocy";
import { createContext } from "react";

type LocationContextType = Promise<ProductLocation[]>;

export const LocationContext = createContext<LocationContextType | null>(null);

export default function LocationProvider({
  children,
  promise,
}: {
  children: React.ReactNode;
  promise: LocationContextType;
}) {
  return <LocationContext value={promise}>{children}</LocationContext>;
}
