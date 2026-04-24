"use client";

import { ProductLocation as Location } from "@/interfaces/grocy";
import CustomisableSelect, {
  CustomisableSelectOption,
  CustomisableSelectOptionArray,
  CustomisableSelectProps,
} from "../customisable-select";

type Freezers = Record<string, CustomisableSelectOption>;

interface LocationDropdownProps extends Omit<
  CustomisableSelectProps,
  "options"
> {
  units: Location[];
  options?: CustomisableSelectProps["options"];
  noFreezers: boolean;
  allowEmpty?: boolean;
}

export const LocationDropdown: React.FC<LocationDropdownProps> = ({
  units,
  noFreezers,
  allowEmpty = false,
  ...rest
}) => {
  const freezers: Freezers = {};

  units.map((unit) => {
    // @ts-expect-error : is_freezer does not exist in the generated type
    if (unit.id !== undefined && unit.is_freezer) freezers[unit.id] = unit;
  });

  const options = locationsToOptions({
    entityObjects: units,
    freezers: freezers,
    noFreezers: noFreezers,
    allowEmpty: allowEmpty,
  });

  return <CustomisableSelect {...rest} options={options} />;
};

function locationsToOptions({
  entityObjects,
  freezers,
  noFreezers,
  allowEmpty,
}: {
  entityObjects: Location[];
  freezers: Freezers;
  noFreezers: boolean;
  allowEmpty: boolean;
}) {
  if (entityObjects === undefined) return [];

  const options: CustomisableSelectOptionArray = [];

  options.push({
    value: allowEmpty ? "0" : "",
    label: allowEmpty ? "[not set]" : "Pick ...",
  });

  function compareWords(a: Location, b: Location) {
    if (a.name!.toLowerCase() < b.name!.toLowerCase()) {
      return -1;
    } else {
      return 1;
    }
  }

  entityObjects.sort(compareWords).forEach((entity: Location) => {
    if (entity.id && entity.name) {
      options.push({
        value: entity.id?.toString(),
        label: entity.name,
        isDisabled:
          noFreezers && entity.id !== undefined && entity.id in freezers
            ? true
            : false,
      });
    }
  });

  return options;
}
