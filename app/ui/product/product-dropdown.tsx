"use client";

import { SingleValue } from "react-select";
import CustomSelect from "../custom-select";
import { Product } from "@/interfaces/grocy";
import { OptionType } from "@/interfaces/options";

export function ProductDropdown({
  name,
  units,
  className,
  setSelectedId,
  optional = true,
  insert,
  placeholder = "Pick a product...",
}: {
  name: string;
  units: Product[];
  className?: string;
  setSelectedId?: React.Dispatch<React.SetStateAction<number>>;
  optional?: boolean;
  insert?: OptionType;
  placeholder?: string;
}) {
  const options = productsToOptions({
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
        inputValue: SingleValue<OptionType> /*action: ActionMeta<Option>*/,
      ) => {
        if (setSelectedId && inputValue?.value !== undefined)
          setSelectedId(Number.parseInt(inputValue?.value));
      }}
      defaultValue={defaultValue}
      isSearchable
      placeholder={placeholder}
      noOptionsMessage={({ inputValue }) =>
        inputValue
          ? `No quantity units found for "${inputValue}"`
          : "Start typing to pick..."
      }
    />
  );
}

function productsToOptions({
  entityObjects,
}: {
  entityObjects: Product[];
}): OptionType[] {
  if (entityObjects === undefined) return [];

  const options: OptionType[] = [];

  function compareWords(a: Product, b: Product) {
    if (a.name!.toLowerCase() < b.name!.toLowerCase()) {
      return -1;
    } else {
      return 1;
    }
  }
  entityObjects.sort(compareWords).forEach((entity: Product) => {
    options.push({
      value: entity.id?.toString(),
      label: entity.name,
    });
  });

  return options;
}
