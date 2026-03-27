"use client";

import { use, useContext, useState } from "react";
import { QuantityUnitsDropdown } from "./quantity-units-dropdown";
import { QuantityUnitCalculation } from "@/app/components/quantity-unit-calculation";
import { QuantityUnit, QuantityUnitConversion } from "@/interfaces/grocy";
import { QuantityUnitContext } from "@/app/providers/quantity-unit-context";
import { QuantityUnitConversionContext } from "@/app/providers/quantity-unit-conversion-context";

export function ByVolumeApp() {
  const [selectedId, setSelectedId] = useState<number>(0);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1.0);

  const quantityUnitsPromise = useContext(QuantityUnitContext) as Promise<
    QuantityUnit[]
  >;
  const quantityUnitConversionPromise = useContext(
    QuantityUnitConversionContext,
  ) as Promise<QuantityUnitConversion[]>;

  const units = use(quantityUnitsPromise);
  const conversions = use(quantityUnitConversionPromise);

  return (
    <div className="flex pt-3">
      <input
        name="purchase_quantity"
        type="number"
        className="mt-0.75 mr-4 h-8 w-19 flex-none p-3 text-right text-lg"
        defaultValue={quantity}
        onChange={(e) => setQuantity(Number.parseFloat(e.target.value))}
      />
      <QuantityUnitsDropdown
        name="TODO"
        units={units}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        setSelectedGroup={setSelectedGroup}
        className="mr-4 w-40 flex-2"
        mode="volume"
      />
      <QuantityUnitCalculation
        units={units}
        conversions={conversions}
        selectedUnit={selectedId}
        selectedGroup={selectedGroup}
        quantity={quantity}
        className="flex-2 pt-1.5 text-lg"
      />
    </div>
  );
}
