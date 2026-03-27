"use client";

import React from "react";
import { ProductGroup } from "@/interfaces/grocy";
import CustomSelect from "../custom-select";
import { OptionType } from "@/interfaces/options";
import { SingleValue } from "react-select";

export function ProductGroupDropdown({
  name,
  units,
  className,
  setSelectedId,
  required = false,
  insert,
  placeholder = "Select or search for a product category...",
}: {
  name: string;
  units: ProductGroup[];
  className?: string;
  setSelectedId?: React.Dispatch<React.SetStateAction<number>>;
  required?: boolean;
  insert?: OptionType;
  placeholder?: string;
}) {
  const options = productGroupsToOptions({
    entityObjects: units,
  });

  let defaultValue = undefined;

  if (!required && insert !== undefined) {
    options.unshift(insert);
    defaultValue = options[0];
  }

  return (
    <CustomSelect
      className={className}
      maxMenuHeight={500}
      name={name}
      options={options}
      onChange={(inputValue: SingleValue<OptionType> /*action: ActionMeta<Option>*/) => {
        if (setSelectedId && inputValue?.value !== undefined)
          setSelectedId(Number.parseInt(inputValue?.value));
      }}
      defaultValue={defaultValue}
      isSearchable
      required={required}
      placeholder={placeholder}
      noOptionsMessage={({ inputValue }) =>
        inputValue ? `No product groups found for "${inputValue}"` : "Start typing to pick..."
      }
      loadingMessage={() => "Loading..."}
    />
  );
}

function productGroupsToOptions({
  entityObjects,
}: {
  entityObjects: ProductGroup[];
}): OptionType[] {
  if (entityObjects === undefined) return [];

  const options: OptionType[] = [];

  function compareWords(a: ProductGroup, b: ProductGroup) {
    if (a.name!.toLowerCase() < b.name!.toLowerCase()) {
      return -1;
    } else {
      return 1;
    }
  }
  entityObjects.sort(compareWords).forEach((entity: ProductGroup) => {
    options.push({
      value: entity.id.toString(),
      label: entity.name,
    });
  });

  return options;
}
