"use client";

import { Option } from "@/interfaces";
import AsyncSelect from "react-select/async";
import { EntityObjectsToOptions } from "../../lib/grocy";
import { use, useContext, useState } from "react";
import dropdownstyles from "../../lib/dropdownstyles";
import { ProductGroupContext } from "@/app/providers/product-group-context";

export function ProductGroupDropdown({
  //   name,
  selectedIndex,
}: {
  //   name: string;
  selectedIndex?: number;
}) {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const productGroupPromise = useContext(ProductGroupContext);
  if (!productGroupPromise) {
    throw new Error("useContext must be used within a data provider");
  }

  // @ts-expect-error
  const data = use(productGroupPromise);

  const loadOptions = async (inputValue: string) => {
    try {
      return EntityObjectsToOptions({
        selectedIndex: selectedIndex,
        setSelectedOption: setSelectedOption,
        entityObjects: data,
      });
    } catch (error) {
      console.error("Error loading product groups:", error);
      return [];
    }
  };

  return (
    <AsyncSelect<Option>
      styles={dropdownstyles}
      key={"location-" + selectedIndex}
      value={selectedOption}
      loadOptions={loadOptions}
      defaultOptions
      onChange={setSelectedOption}
      isSearchable
      placeholder="Search product group..."
      loadingMessage={() => "Loading..."}
      noOptionsMessage={({ inputValue }) =>
        inputValue ? `No product groups found for "${inputValue}"` : "Start typing to search..."
      }
    />
  );
}
