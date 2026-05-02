import { DueDateType, PurchasePriceType, StockLabelType, UnitSystem } from "@/generated/prisma/enums";
import clsx from "clsx";

export const inputCommonStyles: string = clsx(
  "rounded-md",
  "py-[6]",
  "px-2",
  "border-1",
  "border-form-input-border",
  "hover:focus:border-form-focused",
  "bg-form-input-background",
  "placeholder:font-normal",
  "placeholder:text-form-placeholder",
  "invalid:border-form-input-invalid-border/80",
  "focus:border-form-focused",
  "focus:border-2",
  "focus:invalid:text-form-input-text-focused-invalid",
  "focus:invalid:placeholder:text-white-600",
  "focus:invalid:bg-form-input-invalid-bg",
  "focus:invalid:border-form-focused-input-invalid-border",
  "outline-0",
  "min-h-[38px]",
  "text-md",
);

export const dueDaysInputCommonStyles: string = clsx(inputCommonStyles);

export const dateInputCommonStyles: string = clsx(inputCommonStyles);

export const dueDateTypeOptions = [
  { value: DueDateType.BEST_BEFORE, label: "Best before" },
  { value: DueDateType.EXPIRY_DATE, label: "Expires at" },
  { value: DueDateType.NO_EXPIRY, label: "Does not expire" },
];

export const unitSystemOptions = [
  { value: UnitSystem.WEIGHT, label: "By weight" },
  { value: UnitSystem.VOLUME, label: "By volume" },
  { value: UnitSystem.ABSTRACT, label: "Abstract/discrete" },
];

export const purchasePriceOptions = [
  { value: PurchasePriceType.UNSPECIFIED, label: "Unspecified" },
  { value: PurchasePriceType.UNIT_PRICE, label: "Unit price" },
  { value: PurchasePriceType.TOTAL_PRICE, label: "Total price" },
];

export const energyCalculatorOptions = [
  { value: "PER100G", label: "Per 100g/100ml" },
  //{ value: PurchasePriceType.UNIT_PRICE, label: "Unit price" },
  //{ value: PurchasePriceType.TOTAL_PRICE, label: "Total price" },
];

export const stockLabelOptions = [
  { value: StockLabelType.NO_LABEL, label: "No label" },
  { value: StockLabelType.SINGLE_LABEL, label: "Single label" },
  { value: StockLabelType.LABEL_PER_UNIT, label: "Label per unit" },
];
