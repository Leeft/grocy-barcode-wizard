"use client";

import { Option } from "@/interfaces";
import AsyncSelect from "react-select/async";
import { EntityObjectsToOptions } from "../../lib/grocy";
import { use, useContext, useState } from "react";
import dropdownstyles from "../../lib/dropdownstyles";
import { LocationContext } from "@/app/providers/location-context";

export function LocationsDropdown({
  //   name,
  selectedIndex,
}: {
  //   name: string;
  selectedIndex?: number;
}) {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const locationPromise = useContext(LocationContext);
  if (!locationPromise) {
    throw new Error("useContext must be used within a data provider");
  }

  // @ts-expect-error
  const data = use(locationPromise);

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
      placeholder="Search locations..."
      loadingMessage={() => "Loading..."}
      noOptionsMessage={({ inputValue }) =>
        inputValue ? `No locations found for "${inputValue}"` : "Start typing to search..."
      }
    />
  );
}
