"use client";

import {
  consumeOneOfSpecificStockEntry,
  consumeSpecificStockEntry,
  consumeSpoiledSpecificStockEntry,
  openSpecificStockEntry,
  printStockLabel,
  transferSpecificStockEntry,
} from "@/lib/grocy-update";
import { inputCommonStyles } from "@/lib/product-form-shared";
import clsx from "clsx";
import React from "react";

const stockButtonCommon = clsx(
  "inline-flex",
  "cursor-pointer",
  "px-2",
  "pr-3",
  "cursor-pointer",
  "disabled:opacity-40",
  "h-8.5",
  "mt-0!",
  inputCommonStyles,

  "leading-6!",
  "disabled:cursor-default!",
  "pb-0!",
  "focus:pb-0",
);

export function ConsumeStockEntryButton({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <button
      title={title}
      className={clsx(stockButtonCommon, "text-consume", "bg-consume/10", "border-consume/90!")}
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
      className={clsx(stockButtonCommon, "text-consume-one!", "bg-consume-one/10!", "border-consume-one/70!")}
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
      className={clsx(stockButtonCommon, "text-spoiled", "bg-spoiled/10", "border-spoiled/70!")}
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
      className={clsx(stockButtonCommon, "text-transfer", "bg-transfer/10", "border-transfer/90!")}
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
      className={clsx(stockButtonCommon, "text-open", "bg-open/10", "border-open/90!")}
      disabled={disabled}
      formAction={openSpecificStockEntry}
    >
      {children}
    </button>
  );
}

export function PrintStockLabelButton({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      className={clsx(stockButtonCommon, "text-print", "bg-print/10", "border-print/90!")}
      formAction={printStockLabel}
    >
      {children}
    </button>
  );
}
