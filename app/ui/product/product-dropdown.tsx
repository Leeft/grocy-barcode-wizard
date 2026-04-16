"use client";

import { Product } from "@/interfaces/grocy";
import CustomisableSelect, {
  CustomisableSelectProps,
  CustomisableSelectOptionArray,
} from "../customisable-select";

interface ProductDropdownProps extends Omit<
  CustomisableSelectProps,
  "options"
> {
  units: Product[];
  options?: CustomisableSelectProps["options"];
}

export const ProductDropdown: React.FC<ProductDropdownProps> = ({
  units,
  ...rest
}) => {
  const options = productsToOptions({
    entityObjects: units,
  });

  let defaultValue = undefined;

  // if (!rest.required && insert !== undefined) {
  //   options.unshift(insert);
  //   defaultValue = options[0];
  // }

  return (
    <CustomisableSelect
      {...rest}
      options={options}
    />
  );
};

function productsToOptions({
  entityObjects,
}: {
  entityObjects: Product[];
}): CustomisableSelectOptionArray {
  if (entityObjects === undefined) return [];

  const options: CustomisableSelectOptionArray = [];

  function compareWords(a: Product, b: Product) {
    if (a.name!.toLowerCase() < b.name!.toLowerCase()) {
      return -1;
    } else {
      return 1;
    }
  }
  entityObjects.sort(compareWords).forEach((entity: Product) => {
    if (entity.id && entity.name) {
      options.push({
        value: entity.id?.toString(),
        label: entity.name,
      });
    }
  });

  return options;
}
