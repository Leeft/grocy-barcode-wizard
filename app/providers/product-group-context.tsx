"use client";

import { ProductGroup } from "@/interfaces/grocy";
import { createContext } from "react";

export const ProductGroupContext = createContext<Promise<
  ProductGroup[]
> | null>(null);

export default function ProductGroupProvider({
  children,
  promise,
}: {
  children: React.ReactNode;
  promise: Promise<ProductGroup[]> | null;
}) {
  return <ProductGroupContext value={promise}>{children}</ProductGroupContext>;
}
