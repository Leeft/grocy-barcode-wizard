"use client";

import { StockEntry } from "@/interfaces/grocy";
import React, { createContext } from "react";

export type ProductStockPromise = Promise<StockEntry[]>;

interface ContainerProps {
  children: React.ReactNode;
  promise: ProductStockPromise;
}

const ProductStockContext = createContext<ProductStockPromise | null>(null);

const ProductStockProvider = ({ children, promise }: ContainerProps) => {
  return <ProductStockContext value={promise}>{children}</ProductStockContext>;
};

export { ProductStockContext, ProductStockProvider };
