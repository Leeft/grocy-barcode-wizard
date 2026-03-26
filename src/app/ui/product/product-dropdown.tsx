"use client";

import { Option } from "@/interfaces";
import { SingleValue } from "react-select";
import CustomSelect from "../custom-select";
import { Product } from "@/interfaces/grocy";

type OptionsPlusSelected = [Option[], Option | undefined];

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
  insert?: Option;
  placeholder?: string;
}) {
  const [options, /*selected*/] = productsToOptions({
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
      onChange={(inputValue: SingleValue<Option>, /*action: ActionMeta<Option>*/) => {
        if (setSelectedId && inputValue?.value !== undefined)
          setSelectedId(Number.parseInt(inputValue?.value));
      }}
      defaultValue={defaultValue}
      //   defaultValue={options[0]}
      isSearchable
      placeholder={placeholder}
      noOptionsMessage={({ inputValue }) =>
        inputValue ? `No quantity units found for "${inputValue}"` : "Start typing to pick..."
      }
    />
  );
}

function productsToOptions({ entityObjects }: { entityObjects: Product[] }): OptionsPlusSelected {
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
  function compareWords(a: Product, b: Product) {
    if (a.name!.toLowerCase() < b.name!.toLowerCase()) {
      return -1;
    } else {
      return 1;
    }
  }
  entityObjects.sort(compareWords).forEach((entity: Product) => {
    options.push({
      value: entity.id,
      label: entity.name,
    });
  });

  return [options, undefined];
}
