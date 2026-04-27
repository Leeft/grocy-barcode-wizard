"use client";

import { ProductLocation as Location } from "@/interfaces/grocy";
import CustomisableSelect, {
  CustomisableSelectOption,
  CustomisableSelectOptionArray,
  CustomisableSelectProps,
} from "../customisable-select";

type Freezers = Record<string, CustomisableSelectOption>;

interface LocationDropdownProps extends Omit<CustomisableSelectProps, "options"> {
  units: Location[];
  options?: CustomisableSelectProps["options"];
  noFreezers: boolean;
  allowEmpty?: boolean;
  firstOptionTitle?: string;
  disableOption?: string;
}

export const LocationDropdown: React.FC<LocationDropdownProps> = ({
  units,
  noFreezers,
  allowEmpty = false,
  firstOptionTitle = "Pick ...",
  disableOption,
  ...rest
}) => {
  const freezers: Freezers = {};

  units.map((unit) => {
    // @ts-expect-error : is_freezer does not exist in the generated type
    if (unit.id !== undefined && unit.is_freezer) freezers[unit.id] = unit;
  });

  const options: CustomisableSelectOptionArray = [];

  if (units !== undefined) {
    options.push({
      value: allowEmpty ? "0" : "",
      label: allowEmpty ? "[not set]" : firstOptionTitle,
    });

    function compareWords(a: Location, b: Location) {
      if (a.name!.toLowerCase() < b.name!.toLowerCase()) {
        return -1;
      } else {
        return 1;
      }
    }

    units.sort(compareWords).forEach((entity: Location) => {
      if (entity.id && entity.name) {
        options.push({
          value: entity.id?.toString(),
          label: entity.name,
          isDisabled:
            (noFreezers && entity.id !== undefined && entity.id in freezers) ||
            (disableOption !== undefined && disableOption === entity.id?.toString())
              ? true
              : false,
        });
      }
    });
  }

  return <CustomisableSelect {...rest} options={options} />;
};
