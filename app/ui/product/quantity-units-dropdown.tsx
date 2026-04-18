"use client";

import { QuantityUnit } from "@/interfaces/grocy";
import React, { RefObject } from "react";
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

const allTypes = ["abstract", ...quantityTypes] as const;

type QuantityType = (typeof quantityTypes)[number];
type AllType = (typeof allTypes)[number];

const quantityGroupLabels: Record<AllType, string> = {
  abstract: "Abstract/discrete",
  "weight-metric": "Weight (metric)",
  "volume-metric": "Volume (metric)",
  "weight-us": "Weight (US)",
  "volume-us-wet": "Volume (US; wet)",
  "volume-us-dry": "Volume (US; dry)",
};

interface QuantityUnitsDropdownProps extends Omit<
  CustomisableSelectProps,
  "options"
> {
  units: QuantityUnit[];
  unitSystem: UnitSystem;
  options?: CustomisableSelectProps["options"];
  allOptions?: boolean;
  plural?: boolean;
  ref?: RefObject<HTMLSelectElement>;
}

export const QuantityUnitsDropdown: React.FC<QuantityUnitsDropdownProps> = ({
  units,
  unitSystem,
  allOptions = false,
  plural = false,
  ref,
  ...rest
}) => {
  const options = quantityUnitsToOptions({
    units: units,
    unitSystem: unitSystem,
    allOptions: allOptions,
    plural: plural,
  });

  const pickMe: CustomisableSelectOptionArray = [
    {
      value: "",
      label: "Pick ...",
    },
  ];

  const combinedOptions = pickMe.concat(options);

  return <CustomisableSelect {...rest} ref={ref} options={combinedOptions} />;
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
  plural,
}: {
  units: QuantityUnit[];
  unitSystem: UnitSystem;
  allOptions: boolean;
  plural: boolean;
}) {
  if (units === undefined) return [];

  const options: CustomisableSelectOptionArray = [];

  if (unitSystem !== UnitSystem.ABSTRACT) {
    quantityTypes.forEach((type: QuantityType) => {
      const groupOptions: CustomisableSelectOptionArray = [];
      units.sort(compareWords).forEach((entity: QuantityUnit) => {
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
              label: plural ? entity.name_plural! : entity.name!,
              type: entity.userfields.type,
            });
          }
        }
      });

      if (groupOptions.length > 0) {
        options.push({
          label: quantityGroupLabels[type],
          options: groupOptions,
        });
      }
    });

    if (allOptions) {
      const abstractOptions: CustomisableSelectOptionArray = [];

      units.forEach((entity: QuantityUnit) => {
        if (
          entity !== undefined &&
          entity.id &&
          entity.userfields !== undefined &&
          (entity.userfields.type === undefined ||
            entity.userfields.type === null ||
            entity.userfields.type === "")
        ) {
          abstractOptions.push({
            value: entity.id.toString(),
            label: entity.name!,
            type: entity.userfields.type,
          });
        }
      });

      if (abstractOptions.length > 0) {
        options.unshift({
          label: quantityGroupLabels["abstract"],
          options: abstractOptions,
        });
      }
    }
  } else {
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
