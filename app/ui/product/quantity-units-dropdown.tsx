"use client";

import { QuantityUnit } from "@/interfaces/grocy";
import React, { Dispatch, RefObject, SetStateAction } from "react";
import { UnitSystem } from "@/generated/prisma/enums";
import CustomisableSelect, {
  CustomisableSelectProps,
  CustomisableSelectOptionArray,
  CustomisableSelectGroup,
} from "../customisable-select";
import { FieldMetadata } from "@conform-to/react";

const quantityTypes = [
  "weight-metric",
  "volume-metric",
  "weight-us",
  "volume-us-wet",
  "volume-us-dry",
] as const;

const allTypes = ["abstract", ...quantityTypes] as const;

type AllType = (typeof allTypes)[number];

const quantityGroupLabels: Record<AllType, string> = {
  abstract: "Abstract/discrete",
  "weight-metric": "Weight (metric)",
  "volume-metric": "Volume (metric)",
  "weight-us": "Weight (US)",
  "volume-us-wet": "Volume (US; wet)",
  "volume-us-dry": "Volume (US; dry)",
};

interface QuantityUnitsDropdownProps extends Omit<CustomisableSelectProps, "options"> {
  units: QuantityUnit[];
  unitSystem: UnitSystem;
  options?: CustomisableSelectProps["options"];
  allOptions?: boolean;
  plural?: boolean;
  ref?: RefObject<HTMLSelectElement>;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  selectedOption: string;
  setSelectedOption?: Dispatch<SetStateAction<string>>;
  field: FieldMetadata<unknown>;
}

export const QuantityUnitsDropdown: React.FC<QuantityUnitsDropdownProps> = ({
  units,
  unitSystem,
  allOptions = false,
  ref,
  onChange,
  selectedOption,
  setSelectedOption,
  field,
  ...rest
}) => {
  return (
    <CustomisableSelect
      ref={ref}
      key={field.key}
      id={field.id}
      name={field.name}
      form={field.formId}
      aria-invalid={!field.valid || undefined}
      aria-describedby={!field.valid ? field.errorId : undefined}
      required={true}
      {...rest}
      options={quantityUnitsToOptions({
        units: units,
        unitSystem: unitSystem,
        allOptions: allOptions,
      })}
      value={selectedOption}
      onChange={(e) => {
        if (setSelectedOption) setSelectedOption(e.target.value);
        if (onChange) {
          onChange(e);
        }
      }}
    />
  );
};

function compareWords(a: QuantityUnit, b: QuantityUnit) {
  if (a.name!.toLowerCase() < b.name!.toLowerCase()) {
    return -1;
  } else {
    return 1;
  }
}

function quantityUnitsToOptions({
  units,
  unitSystem,
  allOptions,
  plural = false,
}: {
  units: QuantityUnit[];
  unitSystem: UnitSystem;
  allOptions: boolean;
  plural?: boolean;
}) {
  if (units === undefined) return [];

  const groupedOptions: Record<AllType, CustomisableSelectGroup> = {
    abstract: { label: quantityGroupLabels.abstract, options: [] },
    "weight-metric": {
      label: quantityGroupLabels["weight-metric"],
      options: [],
    },
    "volume-metric": {
      label: quantityGroupLabels["volume-metric"],
      options: [],
    },
    "weight-us": { label: quantityGroupLabels["weight-us"], options: [] },
    "volume-us-wet": {
      label: quantityGroupLabels["volume-us-wet"],
      options: [],
    },
    "volume-us-dry": {
      label: quantityGroupLabels["volume-us-dry"],
      options: [],
    },
  };

  const regex = new RegExp(`^${unitSystem ? unitSystem.toLowerCase() : ""}`);

  units.sort(compareWords).forEach((entity: QuantityUnit) => {
    const type: AllType = entity.userfields && entity.userfields.type ? entity.userfields.type : "abstract";

    if (allOptions || regex.test(type)) {
      groupedOptions[type].options.push({
        value: entity.id!.toString(),
        label: plural ? entity.name_plural! : entity.name!,
        type: type,
      });
    }
  });

  const options: CustomisableSelectOptionArray = [
    {
      value: "",
      label: "Pick ...",
    },
  ];

  allTypes.forEach((type) => {
    if (groupedOptions[type].options.length > 0) {
      options.push(groupedOptions[type]);
    }
  });

  return options;
}
