"use client";

import { QUConversion } from "@/interfaces";
import { QuantityUnit } from "@/interfaces/grocy";
import { getTargetTriple } from "next/dist/build/swc/generated-native";

type UnitTarget = {
  id: number | undefined;
  from_qu_id: number | undefined;
  to_qu_id: number | undefined;
  factor: number | undefined;
  target: QuantityUnit | undefined;
};

export function QuantityUnitCalculation({
  units,
  selectedUnit,
  factor,
  className,
  conversions,
  quantity,
}: {
  units: QuantityUnit[];
  selectedUnit: number;
  factor: number;
  className?: string;
  conversions: QUConversion[];
  quantity: number;
}) {
  // const source: QuantityUnit = units
  //   .find((unit) => {
  //     return unit.id == selectedUnit;
  //   });

  const safeQuantity = !Number.isNaN(quantity) ? quantity : 0;

  const matchedUnits: UnitTarget[] = conversions
    .filter((conv) => {
      return conv.from_qu_id == selectedUnit;
    })
    .map((conv): UnitTarget => {
      const target = units.find((unit) => {
        return unit.id == conv.to_qu_id;
      });
      return {
        id: conv.id,
        from_qu_id: conv.from_qu_id,
        to_qu_id: conv.to_qu_id,
        factor: conv.factor,
        target: target,
      };
    });

  return (
    <div className={className}>
      {matchedUnits.map((m) => (
        <span key={m.id}>
          = {floatString(m.factor! * safeQuantity!)} {m.factor! * safeQuantity > 1 ? m.target!.name_plural : m.target!.name}
        </span>
      ))}
    </div>
  );
}

function floatString(value: number) {
  return Number.parseFloat(value.toFixed(4));
}
