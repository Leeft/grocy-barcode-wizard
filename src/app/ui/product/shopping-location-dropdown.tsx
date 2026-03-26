"use client";

import { ActionMeta, SingleValue, ThemeConfig } from "react-select";
import CustomSelect from "../custom-select";
import { ShoppingLocation as Location } from "@/interfaces/grocy";

interface Option {
  value: string | undefined;
  label: string | undefined;
}
type OptionsPlusSelected = [Option[], Option | undefined];

export function ShoppingLocationDropdown({
  name,
  units,
  className,
  selectedIndex,
  setSelectedId,
  optional = false,
  insert,
  placeholder = "Pick a location...",
}: {
  name: string;
  units: Location[];
  className?: string;
  selectedIndex?: number;
  setSelectedId?: React.Dispatch<React.SetStateAction<number>>;
  optional?: boolean;
  insert?: Option;
  placeholder?: string;
}) {
  const [options, /*selected*/] = locationsToOptions({
    entityObjects: units,
  });

  let defaultValue = undefined;

  if (optional && insert !== undefined) {
    options.unshift(insert);
    defaultValue = options[0];
  }

  return (
    <CustomSelect<Option>
      className={className}
      maxMenuHeight={500}
      name={name}
      options={options}
      onChange={(inputValue: SingleValue<Option>, /* action: ActionMeta<Option> */) => {
        if (setSelectedId && inputValue?.value !== undefined)
          setSelectedId(Number.parseInt(inputValue?.value));
      }}
      defaultValue={defaultValue}
      isSearchable
      placeholder={placeholder}
      noOptionsMessage={({ inputValue }) =>
        inputValue ? `No locations found for "${inputValue}"` : "Start typing to pick..."
      }
    />
  );
}

function locationsToOptions({ entityObjects }: { entityObjects: Location[] }): OptionsPlusSelected {
  if (entityObjects === undefined) return [[], undefined];

  const options: any = [];

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
  function compareWords(a: Location, b: Location) {
    if (a.name!.toLowerCase() < b.name!.toLowerCase()) {
      return -1;
    } else {
      return 1;
    }
  }
  
  entityObjects.sort(compareWords).forEach((entity: Location) => {
    options.push({
      value: entity.id,
      label: entity.name,
    });
  });

  return [options, undefined];
}
