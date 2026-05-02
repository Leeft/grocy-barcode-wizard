"use client";

import { Product, ProductLocation, QuantityUnit, StockEntry } from "@/interfaces/grocy";
import { toLookup } from "@/lib/utils";
import { LocationContext } from "@/providers/location-context";
import { QuantityUnitContext } from "@/providers/quantity-unit-context";
import { use, useContext } from "react";

export function StockEntrySummary({ se, product }: { se: StockEntry; product: Product }) {
  const units = toLookup(use(useContext(QuantityUnitContext) as Promise<QuantityUnit[]>));
  const locations = toLookup(use(useContext(LocationContext) as Promise<ProductLocation[]>));
  const dueType = dueTypeToString(product.due_type!, product.default_best_before_days);

  if (product === undefined) {
    return <></>;
  }

  return (
    <div className="w-full">
      <code className="text-xs">{se.stock_id}</code> : {(se.amount !== null && se.amount) || "??"}&nbsp;
      {se.amount !== null && se.amount !== undefined && se.amount != 1 && product?.qu_id_stock
        ? units[product.qu_id_stock!]!.name_plural
        : units[product.qu_id_stock!]!.name}{" "}
      {se.open ? <span>(opened)</span> : ""} at {locations[se.location_id!]!.name}
      {dueType !== "No expiry" && se.best_before_date !== "2999-12-31" ? (
        <>
          ; {dueType} date is <code>{se.best_before_date}</code>{" "}
        </>
      ) : (
        <>; Does not expire</>
      )}
      {se.note && (
        <>
          {" "}
          -- note: <em>{se.note}</em>
        </>
      )}
    </div>
  );
}

export function StockEntrySummaryText({ se, product }: { se: StockEntry; product: Product }) {
  const units = toLookup(use(useContext(QuantityUnitContext) as Promise<QuantityUnit[]>));
  const locations = toLookup(use(useContext(LocationContext) as Promise<ProductLocation[]>));
  const dueType = dueTypeToString(product.due_type!, product.default_best_before_days);

  if (product === undefined) {
    return ``;
  }

  return (
    `${se.stock_id} : ${(se.amount !== null && se.amount) || "??"} ` +
    (se.amount !== null && se.amount !== undefined && se.amount != 1 && product?.qu_id_stock
      ? units[product.qu_id_stock!]!.name_plural
      : units[product.qu_id_stock!]!.name) +
    " " +
    (se.open ? `(opened) ` : ``) +
    `at ${locations[se.location_id!]!.name}` +
    (dueType !== "No expiry" ? `; ${dueType} date is ${se.best_before_date} ` : "") +
    (se.note ? ` -- note: ${se.note}` : ``)
  );
}

function dueTypeToString(dueType: number, bestBeforeDays: number): string {
  let dueTypeString = "Best before";
  if (dueType === 2) {
    dueTypeString = "Expiration";
  }
  if (bestBeforeDays === -1) {
    dueTypeString = "No expiry";
  }
  return dueTypeString;
}
