"use client";

import { ShoppingList } from "@/interfaces/grocy";
import { createContext } from "react";

export const ShoppingListContext = createContext<Promise<ShoppingList[]> | null>(null);

export default function ShoppingListProvider({
  children,
  promise,
}: {
  children: React.ReactNode;
  promise: Promise<ShoppingList[]> | null;
}) {
  return <ShoppingListContext value={promise}>{children}</ShoppingListContext>;
}
