"use client";

import { QuantityUnit } from "@/interfaces/grocy";
import CustomSelect, { CustomSelectHandle } from "../custom-select";
import {
  OptionOrGroupArray,
  OptionType,
} from "@/interfaces/options";
import { ModeType } from "@/interfaces";
import { useState } from "react";

const quantityTypes = [
  "weight-metric",
  "volume-metric",
  "weight-us",
  "volume-us-wet",
  "volume-us-dry",
] as const;

type QuantityType = (typeof quantityTypes)[number];

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
  //setSelectedId,
  required = false,
  isSearchable = true,
  maxMenuHeight = 320,
  ref,
}: {
  name: string;
  units: QuantityUnit[];
  className?: string;
  mode: ModeType | undefined;
  selectedId: number | null;
  //setSelectedId: React.Dispatch<React.SetStateAction<number>>;
  required?: boolean | undefined;
  isSearchable?: boolean;
  maxMenuHeight?: number;
  ref?: React.RefObject<CustomSelectHandle | null>;
}) {
  const options = quantityUnitsToOptions({
    entityObjects: units,
    mode: mode,
  });

  const pickMe: OptionOrGroupArray = [
    {
      value: "0",
      label: "Pick ...",
      isDisabled: true,
    },
  ];

  const combinedOptions = pickMe.concat(options);

  const [selectedOption, setSelectedOption] = useState(combinedOptions[0]);

  options.map((value) => {
    if ("value" in value) {
      if (Number(value.value) === selectedId) {
        setSelectedOption(value);
      }
    }
  });

  // const handleChange = (value: SingleValue<OptionType | GroupType>) => {
  //   if (
  //     value !== null &&
  //     value !== undefined &&
  //     "value" in value &&
  //     (selectedId === null || value.value !== selectedId.toString())
  //   ) {
  //     setSelectedOption(value);
  //   }
  // };

  return (
    <>
      <CustomSelect
        ref={ref}
        id={name}
        className={className}
        maxMenuHeight={maxMenuHeight}
        name={name}
        options={combinedOptions}
        required={required}
        isSearchable={isSearchable}
        value={selectedOption}
        //onChange={handleChange}
        placeholder="Pick..."
        noOptionsMessage={({ inputValue }) =>
          inputValue
            ? `No quantity units found for "${inputValue}"`
            : "Start typing to pick..."
        }
      />
    </>
  );
}

function quantityUnitsToOptions({
  entityObjects,
  mode,
}: {
  entityObjects: QuantityUnit[];
  mode: ModeType | undefined;
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
