"use client";

import CustomSelect from "../custom-select";
import { SingleValue } from "react-select";
import { OptionType } from "@/interfaces/options";

type ModeType = "weight" | "volume" | "abstract";

export function ModeToQuantityTitle(mode: string | undefined) {
  let value: string = "Amount";
  switch (mode) {
    case "weight":
      value = "Weight";
    case "volume":
      value = "Volume";
    case "abstract":
      value = "Unit Amount";
    default:
      value = "Amount";
  }
  return <>{value} *</>;
}

export function ModeToUnitTitle(mode: string | undefined) {
  let value: string = "Unit";
  switch (mode) {
    case "weight":
      value = "Weight unit";
    case "volume":
      value = "Volume unit";
    case "abstract":
      value = "Abstract/discrete unit";
    default:
      value = "Unit";
  }
  return <>{value} *</>;
}

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
