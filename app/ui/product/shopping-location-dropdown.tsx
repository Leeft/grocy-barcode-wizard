"use client";

import { ShoppingLocation as Location } from "@/interfaces/grocy";
import CustomisableSelect, {
  CustomisableSelectOptionArray,
  CustomisableSelectProps,
} from "@/ui/customisable-select";

interface ShoppingLocationDropdownProps extends Omit<
  CustomisableSelectProps,
  "options"
> {
  units: Location[];
  options?: CustomisableSelectProps["options"];
}

export const ShoppingLocationDropdown: React.FC<
  ShoppingLocationDropdownProps
> = ({
  units,
  ...rest
}) => {
  const options: CustomisableSelectOptionArray = locationsToOptions({
    entityObjects: units,
  });

  return (
    <CustomisableSelect
      {...rest}
      options={options}

    />
  );
};

function locationsToOptions({
  entityObjects,
}: {
  entityObjects: Location[];
}): CustomisableSelectOptionArray {
  if (entityObjects === undefined) return [];

  const options: CustomisableSelectOptionArray = [];

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
      });
    }
  });

  return options;
}
