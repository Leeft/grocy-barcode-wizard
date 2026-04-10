"use client";

import CustomSelect from "../custom-select";
import { SingleValue } from "react-select";
import { OptionType } from "@/interfaces/options";

type ModeType = "weight" | "volume" | "abstract";

export function UnitModeDropdown({
  name,
  className,
  setSelectedMode,
}: {
  name: string;
  className?: string;
  setSelectedMode: React.Dispatch<React.SetStateAction<ModeType | undefined>>;
}) {
  return (
    <CustomSelect
      id={name}
      className={className}
      maxMenuHeight={320}
      name={name}
      options={[
        {
          value: "weight",
          label: "By weight",
        },
        {
          value: "volume",
          label: "By volume",
        },
        {
          value: "abstract",
          label: "Abstract/discrete",
        },
      ]}
      required={true}
      isSearchable={false}
      placeholder="Pick..."
      onChange={(inputValue: SingleValue<OptionType> /* action */) => {
          if (inputValue?.value !== undefined) {
            const value = inputValue?.value as ModeType;
            setSelectedMode(value);
          }
      }}
    />
  );
}
