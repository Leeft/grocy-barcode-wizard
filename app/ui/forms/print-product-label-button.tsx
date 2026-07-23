"use client";

import { printProductLabel } from "@/lib/grocy-update";
import { inputCommonStyles } from "@/lib/product-form-shared";
import { clsx } from "clsx";

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

export function PrintProductLabelButton({
  title,
  children,
  productId,
}: {
  title: string;
  children: React.ReactNode;
  productId: number;
}) {
  const handleClick = async () => {
    // const result =
    await printProductLabel(productId);
  };

  return (
    <button
      title={title}
      className={clsx(stockButtonCommon, "text-print", "bg-print/10", "border-print/90!")}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
