"use client";

import { use, useContext, useState } from "react";
import { QuantityUnitsDropdown } from "./quantity-units-dropdown";
import { QuantityUnitCalculation } from "@/app/components/quantity-unit-calculation";
import { QuantityUnit, QuantityUnitConversion } from "@/interfaces/grocy";
import { QuantityUnitContext } from "@/app/providers/quantity-unit-context";
import { QuantityUnitConversionContext } from "@/app/providers/quantity-unit-conversion-context";

export function ByVolumeApp({}: {}) {
  const [selectedId, setSelectedId] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1.0);

  const quantityUnitsPromise = useContext(QuantityUnitContext);
  const quantityUnitConversionPromise = useContext(QuantityUnitConversionContext);

  // @ts-ignore
  const units: QuantityUnit[] = use(quantityUnitsPromise);
  // @ts-ignore
  const conversions: QuantityUnitConversion[] = use(quantityUnitConversionPromise);

  return (
    <div className="flex pt-3">
      <input
        name="purchase_quantity"
        type="number"
        className="w-19 flex-none h-8 text-right text-lg mt-0.75 p-3 mr-4"
        defaultValue={quantity}
        onChange={( e ) => setQuantity(Number.parseFloat(e.target.value))}
      />
      <QuantityUnitsDropdown
        units={units}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        className="w-40 flex-2 mr-4"
        mode="volume-metric"
      />
      <QuantityUnitCalculation
        units={units}
        conversions={conversions}
        selectedUnit={selectedId}
        quantity={quantity}
        factor={1.0}
        className="flex-2 text-lg pt-1.5"
      />
    </div>
  );
}
