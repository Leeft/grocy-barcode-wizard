"use client";

import { createContext } from "react";

export const GrocyConfigContext = createContext<Promise<Record<string, never>> | null>(
  null,
);

export default function GrocyConfigProvider({
  children,
  promise,
}: {
  children: React.ReactNode;
  promise: Promise<Record<string,never>> | null;
}) {
  return <GrocyConfigContext value={promise}>{children}</GrocyConfigContext>;
}
