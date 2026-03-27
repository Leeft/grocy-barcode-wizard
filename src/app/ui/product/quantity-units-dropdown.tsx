"use client";

import { QuantityUnit } from "@/interfaces/grocy";
import CustomSelect from "../custom-select";
import { OptionOrGroupArray, OptionType } from "@/interfaces/options";
import { SingleValue } from "react-select";

const quantityTypes = [
  "weight-metric",
  "volume-metric",
  "weight-us",
  "volume-us-wet",
  "volume-us-dry",
] as const;

type QuantityType = (typeof quantityTypes)[number];
type ModeType = "weight" | "volume" | "abstract";

const quantityGroupLabels: Record<QuantityType, string> = {
  "weight-metric": "Weight (metric)",
  "volume-metric": "Volume (metric)",
  "weight-us": "Weight (US)",
  "volume-us-wet": "Volume (US; wet)",
  "volume-us-dry": "Volume (US; dry)",
};

export function QuantityUnitsDropdown({
  name,
  units,
  className,
  mode,
  selectedId,
  setSelectedId,
  setSelectedGroup,
  required = false,
  isSearchable = true,
}: {
  name: string;
  units: QuantityUnit[];
  className?: string;
  mode: ModeType;
  selectedId: number;
  setSelectedId: React.Dispatch<React.SetStateAction<number>>;
  setSelectedGroup: React.Dispatch<React.SetStateAction<string>>;
  required?: boolean | undefined;
  isSearchable?: boolean;
}) {
  const options = quantityUnitsToOptions({
    entityObjects: units,
    mode: mode,
  });

  return (
    <CustomSelect
      id={name}
      className={className}
      maxMenuHeight={320}
      name={name}
      options={options}
      required={required}
      isSearchable={isSearchable}
      onChange={(inputValue: SingleValue<OptionType> /* action */) => {
        if (
          inputValue !== null &&
          (selectedId === undefined || inputValue.value !== selectedId.toString())
        ) {
          if (setSelectedId && inputValue?.value !== undefined) {
            setSelectedId(Number.parseInt(inputValue?.value));
          }
          if (setSelectedGroup && inputValue?.type !== undefined) {
            setSelectedGroup(inputValue.type);
          }
        }
      }}
      placeholder="Pick..."
      noOptionsMessage={({ inputValue }) =>
        inputValue ? `No quantity units found for "${inputValue}"` : "Start typing to pick..."
      }
    />
  );
}

function quantityUnitsToOptions({
  entityObjects,
  mode,
}: {
  entityObjects: QuantityUnit[];
  mode: ModeType;
}) {
  if (entityObjects === undefined) return [];

  const options: OptionOrGroupArray = [];

  if (mode !== "abstract") {
    quantityTypes.forEach((type: QuantityType) => {
      const groupOptions: OptionType[] = [];
      entityObjects.forEach((entity: QuantityUnit) => {
        if (
          entity !== undefined &&
          entity.userfields !== undefined &&
          entity.userfields.type !== undefined &&
          entity.userfields.type !== null &&
          RegExp(`${mode}`).test(type)
        ) {
          if (entity.userfields.type == type) {
            groupOptions.push({
              value: entity.id?.toString(),
              label: entity.name,
              type: entity.userfields.type,
            });
          }
        }
      });

      options.push({
        label: quantityGroupLabels[type],
        options: groupOptions,
      });
    });
  } else {
    function compareWords(a: QuantityUnit, b: QuantityUnit) {
      if (a.name!.toLowerCase() < b.name!.toLowerCase()) {
        return -1;
      } else {
        return 1;
      }
    }

    entityObjects.sort(compareWords).forEach((entity: QuantityUnit) => {
      if (
        entity !== undefined &&
        entity.userfields !== undefined &&
        (entity.userfields.type == undefined ||
          entity.userfields.type === null ||
          !RegExp(/(volume|weight)/).test(entity.userfields.type))
      ) {
        options.push({
          value: entity.id?.toString(),
          label: entity.name,
          type: entity.userfields.type,
        });
      }
    });
  }

  return options;
}
