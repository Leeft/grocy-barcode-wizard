"use client";

import { SingleValue } from "react-select";
import CustomSelect from "../custom-select";
import { ShoppingLocation as Location } from "@/interfaces/grocy";
import { OptionType } from "@/interfaces/options";

export function ShoppingLocationDropdown({
  name,
  units,
  className,
  setSelectedId,
  optional = false,
  insert,
  placeholder = "Pick a location...",
}: {
  name: string;
  units: Location[];
  className?: string;
  setSelectedId?: React.Dispatch<React.SetStateAction<number>>;
  optional?: boolean;
  insert?: OptionType;
  placeholder?: string;
}) {
  const options: OptionType[] = locationsToOptions({
    entityObjects: units,
  });

  let defaultValue = undefined;

  if (optional && insert !== undefined) {
    options.unshift(insert);
    defaultValue = options[0];
  }

  return (
    <CustomSelect
      className={className}
      maxMenuHeight={500}
      name={name}
      options={options}
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
}: {
  entityObjects: Location[];
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
    });
  });

  return options;
}
