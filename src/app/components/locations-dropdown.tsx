"use client";
import AsyncSelect from "react-select/async";
import { Product } from "@/interfaces/grocy";
import { EntityObjectsToOptions, grocyClient } from "../lib/grocy";
import { useState } from "react";

interface Option {
  value: string;
  label: string;
}

export function LocationsDropdown({
  //   name,
  //   size,
  //   className,
  selectedIndex,
}: {
  //   name: string;
  //   size?: number;
  //   className?: string;
  selectedIndex?: number;
}) {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const loadOptions = async (inputValue: string) => {
    try {
      const { data, error } = await grocyClient.GET("/objects/{entity}", {
        params: {
          path: { entity: "locations" },
          query: { order: "name:asc" },
        },
      });

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
      key={'location-' + selectedIndex}
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
