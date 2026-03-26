"use client";

import { ActionMeta, SingleValue } from "react-select";
import { QuantityUnit } from "@/interfaces/grocy";
import CustomSelect from "../custom-select";

interface Option {
  value: string | undefined;
  label: string | undefined;
}

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

type OptionsPlusSelected = [Option[], Option | undefined];

export function QuantityUnitsDropdown({
  name,
  // size,
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
  // size?: number;
  units: QuantityUnit[];
  className?: string;
  mode: ModeType;
  selectedId: number;
  setSelectedId: React.Dispatch<React.SetStateAction<number>>;
  setSelectedGroup: React.Dispatch<React.SetStateAction<string>>;
  required?: boolean | undefined;
  isSearchable?: boolean;
}) {
  const [options, selected] = quantityUnitsToOptions({
    entityObjects: units,
    mode: mode,
  });

  return (
    <CustomSelect<Option>
      //styles={dropdownStyles}
      id={name}
      className={className}
      maxMenuHeight={320}
      name={name}
      //key={mode + "-" + selectedId}
      //defaultValue={selectedOption}
      options={options}
      //defaultValue={selected}
      //defaultOptions
      required={required}
      isSearchable={isSearchable}
      onChange={(inputValue: SingleValue<Option>, action: ActionMeta<Option>) => {
        if (
          inputValue !== null &&
          (selectedId === undefined || inputValue.value !== selectedId.toString())
        ) {
          if (setSelectedId && inputValue?.value !== undefined) {
            setSelectedId(Number.parseInt(inputValue?.value));
          }
          // @ts-expect-error: type does not exist on the type
          if (setSelectedGroup && inputValue?.type !== undefined) {
            // @ts-expect-error: type does not exist on the type
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
}): OptionsPlusSelected {
  if (entityObjects === undefined) return [[], undefined];

  let options: any = [];

  if (mode !== "abstract") {
    quantityTypes.forEach((type: QuantityType) => {
      let groupOptions: any = [];
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
              value: entity.id,
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
    // options.push({
    //   value: 300,
    //   label: 'æg',
    //   type: null,
    // });
    //var arr = ['Aalborg', 'Sorø']; // array to sort
    //var myLocale = 'da-DK'; // danish locale

    //var sortedArr = arr.sort(function(a,b) { return a.localeCompare(b, myLocale); }); // sort

    //console.log(sortedArr);
    //function(a,b) { return a.localeCompare(b, myLocale); }
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
          value: entity.id,
          label: entity.name,
          type: entity.userfields.type,
        });
      }
    });
  }

  return [options, undefined];
}
