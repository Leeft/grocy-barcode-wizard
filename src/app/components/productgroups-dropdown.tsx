"use client";
import AsyncSelect from "react-select/async";
import { EntityObjectsToOptions, grocyClient } from "../lib/grocy";
import { useState } from "react";
import { Option } from "@/interfaces";

export function ProductgroupsDropdown({
  // name,
  // size,
  // className,
  selectedIndex,
}: {
  // name: string;
  // size?: number;
  // className?: string;
  selectedIndex?: number;
}) {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const loadOptions = async (inputValue: string) => {
    try {
      const { data, error } = await grocyClient.GET("/objects/{entity}", {
        params: {
          path: { entity: "product_groups" },
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
      key={'group-' + selectedIndex}
      value={selectedOption}
      loadOptions={loadOptions}
      defaultOptions
      onChange={setSelectedOption}
      isSearchable
      placeholder="Search groups..."
      loadingMessage={() => "Loading..."}
      noOptionsMessage={({ inputValue }) =>
        inputValue ? `No product groups found for "${inputValue}"` : "Start typing to search..."
      }
    />
  );
}
