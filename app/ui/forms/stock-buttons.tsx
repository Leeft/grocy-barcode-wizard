"use client";

import {
  consumeOneOfSpecificStockEntry,
  consumeSpecificStockEntry,
  consumeSpoiledSpecificStockEntry,
  openSpecificStockEntry,
  transferSpecificStockEntry,
} from "@/lib/grocy-update";
import clsx from "clsx";
import React, { useState } from "react";

const stockButtonCommon = clsx(
  "mt-2",
  "inline-flex",
  "cursor-pointer",
  "rounded-md",
  "border",
  "bg-slate-700",
  "p-1",
  "px-2",
  "cursor-pointer",
  "disabled:bg-slate-800",
  "disabled:cursor-not-allowed",
  "disabled:text-slate-500",
  "h-9.5",
  "py-2",
  "mt-0!",
);

export function ConsumeStockEntryButton({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <button title={title} className={stockButtonCommon} formAction={consumeSpecificStockEntry}>
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
    <button title={title} className={stockButtonCommon} formAction={consumeOneOfSpecificStockEntry}>
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
    <button title={title} className={stockButtonCommon} formAction={consumeSpoiledSpecificStockEntry}>
      {children}
    </button>
  );
}

export function TransferStockEntryButton({
  title,
  disabled,
  children,
  //   showOptions,
  //   setShowOptions,
}: {
  title: string;
  disabled: boolean;
  children: React.ReactNode;
  //   showOptions: boolean;
  //   setShowOptions: Dispatch<SetStateAction<boolean>>;
}) {
  const [opened, setOpened] = useState<boolean>(false);
  return (
    <button
      title={title}
      className={clsx(stockButtonCommon)}
      disabled={disabled}
      // onClick={(event) => {
      //   // setShowOptions(!showOptions);
      //   event?.preventDefault();
      // }}
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
      className={stockButtonCommon}
      disabled={disabled}
      formAction={openSpecificStockEntry}
    >
      {children}
    </button>
  );
}
