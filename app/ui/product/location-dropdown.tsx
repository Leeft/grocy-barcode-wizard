"use client";

import { SingleValue } from "react-select";
import CustomSelect from "../custom-select";
import { ProductLocation as Location } from "@/interfaces/grocy";
import { OptionType } from "@/interfaces/options";

type Freezers = Record<string, OptionType>;

export function LocationDropdown({
  name,
  units,
  className,
  setSelectedId,
  optional = false,
  insert,
  placeholder = "Pick a location...",
  noFreezers = false,
  required = false,
}: {
  name: string;
  units: Location[];
  className?: string;
  setSelectedId?: React.Dispatch<React.SetStateAction<number>>;
  optional?: boolean;
  insert?: OptionType;
  placeholder?: string;
  noFreezers?: boolean;
  required?: boolean | undefined;
}) {
  const freezers: Freezers = {};

  units.map((unit) => {
    // @ts-expect-error : is_freezer does not exist in the generated type
    if (unit.id !== undefined && unit.is_freezer) freezers[unit.id] = unit;
  });

  const options = locationsToOptions({
    entityObjects: units,
    freezers: freezers,
    noFreezers: noFreezers,
  });

  let defaultValue = undefined;

  if (insert !== undefined) {
    options.unshift(insert);
  }
  if (optional === true) {
    defaultValue = options[0];
  }

  return (
    <CustomSelect
      className={className}
      maxMenuHeight={500}
      name={name}
      options={options}
      required={required}
      onChange={(
        inputValue: SingleValue<OptionType> /* action: ActionMeta<Option> */,
      ) => {
        if (setSelectedId && inputValue?.value !== undefined)
          setSelectedId(Number.parseInt(inputValue?.value));
      }}
      defaultValue={defaultValue}
      isSearchable
      placeholder={placeholder}
      noOptionsMessage={({ inputValue }) =>
        inputValue
          ? `No locations found for "${inputValue}"`
          : "Start typing to pick..."
      }
    />
  );
}

function locationsToOptions({
  entityObjects,
  freezers,
  noFreezers,
}: {
  entityObjects: Location[];
  freezers: Freezers;
  noFreezers: boolean;
}): OptionType[] {
  if (entityObjects === undefined) return [];

  const options: OptionType[] = [];

  function compareWords(a: Location, b: Location) {
    if (a.name!.toLowerCase() < b.name!.toLowerCase()) {
      return -1;
    } else {
      return 1;
    }
  }

  entityObjects.sort(compareWords).forEach((entity: Location) => {
    options.push({
      value: entity.id?.toString(),
      label: entity.name,
      isDisabled:
        noFreezers && entity.id !== undefined && entity.id in freezers
          ? true
          : false,
    });
  });

  return options;
}
