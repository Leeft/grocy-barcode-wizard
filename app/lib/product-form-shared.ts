import { DueDateType, PurchasePriceType, UnitSystem } from "@/generated/prisma/enums";
import clsx from "clsx";

export const inputCommonStyles: string = clsx(
  "rounded-md!",
  "py-[6]",
  "px-2",
  "not-focus:py-[7.4px]",
  "not-focus:px-[10.5px]",
  "border-1!",
  "border-[#a0a7c3]!",
  "hover:border-[#ebf2ff]!",
  "focus:border-[#c7c92c]!",
  "hover:focus:border-[#c7c92c]!",
  "focus:border-2!",
  "bg-[#30384f]",
  "placeholder:font-normal",
  "placeholder:text-grey-600",
  "focus:placeholder:text-red-400",
  "invalid:border-red-[#fb2c36]",
  "focus:invalid:text-yellow-300",
  "focus:invalid:placeholder:text-white-600",
  "focus:invalid:bg-[#68352c]",
  "focus:invalid:border-[#e75f5f]",
  "outline-0!",
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
