"use client";

import { QuantityUnit, QuantityUnitConversion, StockEntry } from "@/interfaces/grocy";
import React, { createContext, useContext } from "react";

export type StockEntriesPromise = Promise<StockEntry[]>;
export type QuantityUnitsPromise = Promise<QuantityUnit[]>;
export type QuantityUnitsConversionPromise = Promise<QuantityUnitConversion[]>;

export type AmountPlusUnitObject = {
  stockEntryPromise: StockEntriesPromise;
  quantityUnitsPromise: QuantityUnitsPromise;
  resolvedQuantityUnitsConversionPromise: QuantityUnitsConversionPromise;
};

const AmountPlusUnitContext = createContext<AmountPlusUnitObject | null>(null);

// The `| null` will be removed via the check in the Hook.
const useGetAmountPlusUnitObject = () => {
  const object = useContext(AmountPlusUnitContext);
  if (!object) {
    throw new Error("useGetAmountPlusUnitObject must be used within a AmountPlusUnitProvider");
  }
  return object;
};

interface ContainerProps {
  children: React.ReactNode;
  stockEntryPromise: StockEntriesPromise;
  quantityUnitsPromise: QuantityUnitsPromise;
  resolvedQUConversionPromise: QuantityUnitsConversionPromise;
}

const AmountPlusUnitProvider = ({
  children,
  stockEntryPromise,
  quantityUnitsPromise,
  resolvedQUConversionPromise,
}: ContainerProps) => {
  const object = {
    stockEntryPromise: stockEntryPromise,
    quantityUnitsPromise: quantityUnitsPromise,
    resolvedQuantityUnitsConversionPromise: resolvedQUConversionPromise,
  };
  return <AmountPlusUnitContext value={object}>{children}</AmountPlusUnitContext>;
};

export { AmountPlusUnitContext, AmountPlusUnitProvider, useGetAmountPlusUnitObject };
