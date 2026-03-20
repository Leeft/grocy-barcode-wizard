"use client";

import { Option } from "@/interfaces";
import AsyncSelect from "react-select/async";
import { QuantityUnit } from "@/interfaces/grocy";
import dropdownStyles from "@/app/lib/dropdownstyles";
import { Dispatch, SetStateAction, use, useContext, useState } from "react";
import { QuantityUnitContext } from "../../providers/quantity-unit-context";

const quantityTypes = [
  "other",
  "weight-metric",
  "weight-us",
  "volume-metric",
  "volume-us",
] as const;

type QuantityType = (typeof quantityTypes)[number];

export function QuantityUnitsDropdown({
  // name,
  // size,
  className,
  mode,
  selectedIndex,
}: {
  // name: string;
  // size?: number;
  className?: string;
  mode: QuantityType;
  selectedIndex?: number;
}) {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const quantityUnitPromise = useContext(QuantityUnitContext);
  if (!quantityUnitPromise) {
    throw new Error("useContext must be used within a data provider");
  }

  // @ts-expect-error
  const data = use(quantityUnitPromise);

  const loadOptions = async (inputValue: string) => {
    try {
      return quantityUnitsToOptions({
        selectedIndex: selectedIndex,
        setSelectedOption: setSelectedOption,
        // @ts-ignore
        entityObjects: data,
        filterType: mode,
      });
    } catch (error) {
      console.error("Error loading quantity units:", error);
      return [];
    }
  };

  return (
    <AsyncSelect<Option>
      styles={dropdownStyles}
      className={className}
      maxMenuHeight={500}
      name="quantity_unit"
      key={mode + "-" + selectedIndex}
      value={selectedOption}
      loadOptions={loadOptions}
      defaultOptions
      onChange={setSelectedOption}
      placeholder="Pick..."
      loadingMessage={async () => "Loading..."}
      noOptionsMessage={async ({ inputValue }) =>
        inputValue ? `No quantity units found for "${inputValue}"` : "Start typing to pick..."
      }
    />
  );
}

function quantityUnitsToOptions({
  selectedIndex,
  entityObjects,
  setSelectedOption,
  filterType,
}: {
  selectedIndex?: number;
  setSelectedOption: Dispatch<SetStateAction<Option | null>>;
  entityObjects: QuantityUnit[];
  filterType: QuantityType;
}): Option[] {
  if (entityObjects === undefined) return [];

  const options: any = entityObjects
    .filter((qu: QuantityUnit) => {
      return qu.userfields?.type === filterType;
    })
    .map((qu: QuantityUnit) => ({
      value: qu.id,
      label: qu.name,
    }));

  if (selectedIndex !== undefined && selectedIndex !== null && selectedIndex >= 0) {
    const optionIndex: number = options.findIndex((n: any) => {
      return n.value.toString() === selectedIndex?.toString();
    });

    if (options[optionIndex] !== undefined) {
      setSelectedOption(options[optionIndex]);
    }
  }

  return options;
}
