"use client";

import { Product } from "@/interfaces/grocy";
import { createContext } from "react";

export const ProductContext = createContext<Promise<Product>[] | null>([]);

export default function ProductProvider({
  children,
  promise,
}: {
  children: React.ReactNode;
  promise: Promise<Product>[] | null;
}) {
  return <ProductContext value={promise}>{children}</ProductContext>;
}
