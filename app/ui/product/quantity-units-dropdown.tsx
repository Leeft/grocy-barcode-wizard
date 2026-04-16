"use client";

import { QuantityUnit } from "@/interfaces/grocy";
import React, { useState } from "react";
import { UnitSystem } from "@/generated/prisma/enums";
import CustomisableSelect, {
  CustomisableSelectProps,
  CustomisableSelectOptionArray,
} from "../customisable-select";

const quantityTypes = [
  "weight-metric",
  "volume-metric",
  "weight-us",
  "volume-us-wet",
  "volume-us-dry",
] as const;

type QuantityType = (typeof quantityTypes)[number];

const quantityGroupLabels: Record<QuantityType, string> = {
  "weight-metric": "Weight (metric)",
  "volume-metric": "Volume (metric)",
  "weight-us": "Weight (US)",
  "volume-us-wet": "Volume (US; wet)",
  "volume-us-dry": "Volume (US; dry)",
};

interface QuantityUnitsDropdownProps extends Omit<CustomisableSelectProps, 'options'> {
  units: QuantityUnit[];
  unitSystem: UnitSystem;
  options?: CustomisableSelectProps['options'];
}

export const QuantityUnitsDropdown: React.FC<QuantityUnitsDropdownProps> = ({
  units,
  unitSystem,
  ...rest
}) => {
  const options = quantityUnitsToOptions({
    units: units,
    unitSystem: unitSystem,
  });

  const pickMe: CustomisableSelectOptionArray = [
    {
      value: "",
      label: "Pick ...",
    },
  ];

  const combinedOptions = pickMe.concat(options);

  const [selectedOption, setSelectedOption] = useState(combinedOptions[0]);

  options.map((value) => {
    if ("value" in value) {
      if (Number(value.value) === rest.defaultValue) {
        setSelectedOption(value);
      }
    }
  });

  // const handleChange = (value: SingleValue<OptionType | GroupType>) => {
  //   if (
  //     value !== null &&
  //     value !== undefined &&
  //     "value" in value &&
  //     (selectedId === null || value.value !== selectedId.toString())
  //   ) {
  //     setSelectedOption(value);
  //   }
  // };

  return (
    <>
      <CustomisableSelect {...rest}
        options={combinedOptions}
      />
    </>
  );
};

function quantityUnitsToOptions({
  units,
  unitSystem,
}: {
  units: QuantityUnit[];
  unitSystem: UnitSystem;
}) {
  if (units === undefined) return [];

  const options: CustomisableSelectOptionArray = [];

  if (unitSystem !== UnitSystem.ABSTRACT) {
    quantityTypes.forEach((type: QuantityType) => {
      const groupOptions: CustomisableSelectOptionArray = [];
      units.forEach((entity: QuantityUnit) => {
        if (
          entity !== undefined &&
          entity.id &&
          entity.userfields !== undefined &&
          entity.userfields.type !== undefined &&
          entity.userfields.type !== null &&
          RegExp(`${unitSystem}`, "i").test(type)
        ) {
          if (entity.userfields.type == type) {
            groupOptions.push({
              value: entity.id.toString(),
              label: entity.name!,
              type: entity.userfields.type,
            });
          }
        }
      });

      options.push({
        label: quantityGroupLabels[type],
        options: groupOptions,
      });
    });
  } else {
    function compareWords(a: QuantityUnit, b: QuantityUnit) {
      if (a.name!.toLowerCase() < b.name!.toLowerCase()) {
        return -1;
      } else {
        return 1;
      }
    }

    units.sort(compareWords).forEach((entity: QuantityUnit) => {
      if (
        entity !== undefined &&
        entity.id &&
        entity.userfields !== undefined &&
        (entity.userfields.type == undefined ||
          entity.userfields.type === null ||
          !RegExp(/(VOLUME|WEIGHT)/i).test(entity.userfields.type))
      ) {
        options.push({
          value: entity.id?.toString(),
          label: entity.name!,
          type: entity.userfields.type,
        });
      }
    });
  }

  return options;
}
