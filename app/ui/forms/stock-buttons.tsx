"use client";

import {
  consumeOneOfSpecificStockEntry,
  consumeSpecificStockEntry,
  consumeSpoiledSpecificStockEntry,
  openSpecificStockEntry,
  transferSpecificStockEntry,
} from "@/lib/grocy-update";
import clsx from "clsx";
import React from "react";

const stockButtonCommon = clsx(
  "mt-2",
  "inline-flex",
  "cursor-pointer",
  "rounded-md",
  "border",
  "p-1",
  "px-2",
  "pr-3",
  "cursor-pointer",
  "disabled:cursor-not-allowed",
  "disabled:text-slate-500",
  "h-9.5",
  "py-2",
  "mt-0!",
);

export function ConsumeStockEntryButton({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <button
      title={title}
      className={clsx(stockButtonCommon, "text-consume")}
      formAction={consumeSpecificStockEntry}
    >
      {children}
    </button>
  );
}

export function ConsumeOneOfStockEntryButton({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      className={clsx(stockButtonCommon, "text-consume-one")}
      formAction={consumeOneOfSpecificStockEntry}
    >
      {children}
    </button>
  );
}

export function ConsumeSpoiledStockEntryButton({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      className={clsx(stockButtonCommon, "text-spoiled")}
      formAction={consumeSpoiledSpecificStockEntry}
    >
      {children}
    </button>
  );
}

export function TransferStockEntryButton({
  title,
  disabled,
  children,
}: {
  title: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      className={clsx(stockButtonCommon)}
      disabled={disabled}
      formAction={transferSpecificStockEntry}
    >
      {children}
    </button>
  );
}

export function OpenStockEntryButton({
  title,
  disabled,
  children,
}: {
  title: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      className={clsx(stockButtonCommon, "text-open")}
      disabled={disabled}
      formAction={openSpecificStockEntry}
    >
      {children}
    </button>
  );
}
