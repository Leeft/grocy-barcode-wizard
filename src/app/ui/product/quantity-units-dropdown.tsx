"use client";

import Select, { ActionMeta, SingleValue } from "react-select";
import { QuantityUnit } from "@/interfaces/grocy";
import dropdownStyles from "@/app/lib/dropdownstyles";
import { useState } from "react";

interface Option {
  value: string | undefined;
  label: string | undefined;
}

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
  units,
  className,
  mode,
  selectedId,
  setSelectedId,
}: {
  // name: string;
  // size?: number;
  units: QuantityUnit[],
  className?: string;
  mode: QuantityType;
  selectedId: number;
  setSelectedId: Function;
}) {
  //const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const [options, selected] = quantityUnitsToOptions({
    // @ts-ignore
    entityObjects: units,
    filterType: mode,
  });

  return (
    <Select<Option>
      styles={dropdownStyles}
      className={className}
      maxMenuHeight={500}
      name="quantity_unit"
      //key={mode + "-" + selectedId}
      //defaultValue={selectedOption}
      options={options}
      //defaultValue={selected}
      //defaultOptions
      onChange={(inputValue: SingleValue<Option>, action: ActionMeta<Option>) => {
        if (
          inputValue !== null &&
          (selectedId === undefined || inputValue.value !== selectedId.toString())
        ) {
          //console.log(inputValue);
          setSelectedId(inputValue.value);
        }
      }}
      placeholder="Pick..."
      //loadingMessage={async () => "Loading..."}
      // getOptionValue={(option: any) => `${option["id"]}`}
      // getOptionLabel={(option: any) => `${option["label"]}`}
      noOptionsMessage={({ inputValue }) =>
        inputValue ? `No quantity units found for "${inputValue}"` : "Start typing to pick..."
      }
    />
  );
}

type OptionsPlusSelected = [Option[], Option | undefined];

function quantityUnitsToOptions({
  entityObjects,
  filterType,
}: {
  entityObjects: QuantityUnit[];
  filterType: QuantityType;
}): OptionsPlusSelected {
  if (entityObjects === undefined) return [[], undefined];

  const options = entityObjects
    .filter((qu: QuantityUnit) => {
      return qu.userfields?.type === filterType;
    })
    .map(
      (qu: QuantityUnit): Option => ({
        value: qu.id?.toString(),
        label: qu.name,
      }),
    );

  return [options, undefined];
}
