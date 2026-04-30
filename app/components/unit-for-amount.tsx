import { QuantityUnit } from "@/interfaces/grocy";
import { toLookup } from "@/lib/utils";
import { QuantityUnitContext } from "@/providers/quantity-unit-context";
import clsx from "clsx";
import { RefObject, use, useContext } from "react";

export function UnitForAmount({
  unit,
  className,
  ref,
  plural = false,
  title = "This unit is set at the beginning as part of the 'stock unit system'; choose wisely as Grocy uses the same 'stock unit' for many things, with added conversions filling in the gaps.",
}: {
  unit: number | string;
  className?: string;
  ref?: RefObject<HTMLSelectElement>;
  plural?: boolean;
  title?: string;
}) {
  "use client";
  const units = use(useContext(QuantityUnitContext) as Promise<QuantityUnit[]>);
  const unitsMap = toLookup(units);
  return (
    <>
      {Number(unit) > 0 ? (
        <div
          className={clsx("text-green-200", className)}
          onClick={() => ref?.current?.focus({ preventScroll: false })}
          title={title}
        >
          {plural ? unitsMap[unit]!.name_plural : unitsMap[unit]!.name}
        </div>
      ) : (
        <div
          className={clsx("text-amber-700", className)}
          onClick={() => ref?.current?.focus({ preventScroll: false })}
          title={title}
        >
          ???
        </div>
      )}
    </>
  );
}
