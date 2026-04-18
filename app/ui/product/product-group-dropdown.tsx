"use client";

import React from "react";
import { ProductGroup } from "@/interfaces/grocy";
import CustomisableSelect, {
  CustomisableSelectOption,
  CustomisableSelectOptionArray,
  CustomisableSelectProps,
} from "../customisable-select";

interface ProductGroupDropdownProps extends Omit<
  CustomisableSelectProps,
  "options"
> {
  units: ProductGroup[];
  insert?: CustomisableSelectOption;
  options?: CustomisableSelectProps["options"];
}

export const ProductGroupDropdown: React.FC<ProductGroupDropdownProps> = ({
  units,
  insert,
  ...rest
}) => {
  const options = productGroupsToOptions({
    entityObjects: units,
  });

  if (!rest.required && insert !== undefined) {
    options.unshift(insert);
  }

  return <CustomisableSelect {...rest} options={options} />;
};

function productGroupsToOptions({
  entityObjects,
}: {
  entityObjects: ProductGroup[];
}): CustomisableSelectOptionArray {
  if (entityObjects === undefined) return [];

  const options: CustomisableSelectOptionArray = [];

  function compareWords(a: ProductGroup, b: ProductGroup) {
    if (a.name!.toLowerCase() < b.name!.toLowerCase()) {
      return -1;
    } else {
      return 1;
    }
  }
  entityObjects.sort(compareWords).forEach((entity: ProductGroup) => {
    options.push({
      value: entity.id.toString(),
      label: entity.name,
    });
  });

  return options;
}
