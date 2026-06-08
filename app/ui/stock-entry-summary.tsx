"use client";

import { Product, ProductLocation, QuantityUnit, StockEntry } from "@/interfaces/grocy";
import { differenceInDays, toLookup } from "@/lib/utils";
import { LocationContext } from "@/providers/location-context";
import { QuantityUnitContext } from "@/providers/quantity-unit-context";
import { clsx } from "clsx";
import { use, useContext } from "react";

export function StockEntrySummary({
  se,
  product,
  className,
}: {
  se: StockEntry;
  product: Product;
  className: string;
}) {
  const units = toLookup(use(useContext(QuantityUnitContext) as Promise<QuantityUnit[]>));
  const locations = toLookup(use(useContext(LocationContext) as Promise<ProductLocation[]>));
  const dueType = dueTypeToString(product.due_type!, product.default_best_before_days);

  if (product === undefined) {
    return <></>;
  }

  return (
    <div className={clsx("w-full", className)}>
      <code className="text-xs">{se.stock_id}</code> :{" "}
      <span className="text-stock-unit">
        {(se.amount !== null && se.amount) || "??"}&nbsp;
        {se.amount !== null && se.amount !== undefined && se.amount != 1 && product?.qu_id_stock
          ? units[product.qu_id_stock!]!.name_plural
          : units[product.qu_id_stock!]!.name}
      </span>{" "}
      {se.open ? <span>(opened)</span> : ""} at{" "}
      <span className="text-location">{locations[se.location_id!]!.name}</span>
      <DueDateDisplay dueType={dueType} bestBeforeDate={se.best_before_date} />
      {se.note && (
        <>
          {" "}
          -- note: <em>{se.note}</em>
        </>
      )}
    </div>
  );
}

type DueTypeString = "Best before" | "Expiration" | "No expiry";

function DueDateDisplay({ dueType, bestBeforeDate }: { dueType: DueTypeString; bestBeforeDate?: string }) {
  if (bestBeforeDate === undefined || dueType === "No expiry" || bestBeforeDate === "2999-12-31") {
    return <>; Does not expire</>;
  }

  let dateDiff;
  try {
    dateDiff = differenceInDays(new Date(bestBeforeDate), new Date());
  } catch {
    console.error("Could not parse due date", bestBeforeDate);
  }

  if (dateDiff! >= 30) {
    const months = dateDiff! / 30;
    return (
      <span className={dueDateClass({ dueType: dueType, bestBeforeDate: bestBeforeDate })}>
        ; {dueType} date is <code>{bestBeforeDate}</code>
        {dateDiff !== undefined && (
          <>
            {": "}~{months.toPrecision(1)} months from now
          </>
        )}
      </span>
    );
  }

  return (
    <span className={dueDateClass({ dueType: dueType, bestBeforeDate: bestBeforeDate })}>
      ; {dueType} date is <code>{bestBeforeDate}</code>
      {dateDiff !== undefined && (
        <>
          {": "}
          {Math.abs(dateDiff)} days {dateDiff < 0 ? "ago" : "from now"}
        </>
      )}
    </span>
  );
}

function dueDateClass({ dueType, bestBeforeDate }: { dueType: DueTypeString; bestBeforeDate?: string }) {
  if (bestBeforeDate === undefined || dueType === "No expiry" || bestBeforeDate === "2999-12-31") {
    return "";
  }

  let dateDiff;
  try {
    dateDiff = differenceInDays(new Date(bestBeforeDate), new Date());
  } catch {
    console.error("Could not parse due date", bestBeforeDate);
  }

  let className = "text-green-400/50";

  if (dateDiff! >= 30) {
    className = "text-green-300";
    return className;
  }

  if (dueType === "Expiration" && dateDiff! < 0) {
    className = "text-red-400";
    return className;
  }

  if (dueType === "Expiration" && dateDiff! < 4) {
    className = "text-amber-400";
    return className;
  }

  if (dueType === "Best before" && dateDiff! < 3) {
    className = "text-amber-400";
    return className;
  }

  if (dueType === "Best before" && dateDiff! < 7) {
    className = "text-amber-200/80";
    return className;
  }

  if (dueType === "Best before" && dateDiff! < 14) {
    className = "text-red-400";
    return className;
  }

  if (dueType === "Best before" && dateDiff! < 0) {
    className = "text-red-400/50";
    return className;
  }

  return className;
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
    (dueType !== "No expiry" ? `; ${dueType} date xx is ${se.best_before_date} ` : "") +
    (se.note ? ` -- note: ${se.note}` : ``)
  );
}

function dueTypeToString(dueType: number, bestBeforeDays: number): DueTypeString {
  let dueTypeString = "Best before";
  if (dueType === 2) {
    dueTypeString = "Expiration";
  }
  if (bestBeforeDays === -1) {
    dueTypeString = "No expiry";
  }
  return dueTypeString as DueTypeString;
}
