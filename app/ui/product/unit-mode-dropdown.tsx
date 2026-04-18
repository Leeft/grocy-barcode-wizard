"use client";

import { UnitSystem } from "@/generated/prisma/enums";
import { unitSystemOptions } from "@/lib/product-form-shared";
import CustomisableSelect, { CustomisableSelectProps } from "@/ui/customisable-select";

export function ModeToQuantityTitle(mode: UnitSystem | string | undefined) {
  let value: string = "Amount";
  switch (mode) {
    case UnitSystem.WEIGHT:
      value = "Weight amount";
      break;
    case UnitSystem.VOLUME:
      value = "Volume amount";
      break;
    case UnitSystem.ABSTRACT:
      value = "Unit amount";
      break;
    default:
      value = "Amount";
      break;
  }
  return <>{value} *</>;
}

export function ModeToUnitTitle(mode: UnitSystem | string | undefined) {
  let value: string = "Unit";
  switch (mode) {
    case UnitSystem.WEIGHT:
      value = "Weight unit";
      break;
    case UnitSystem.VOLUME:
      value = "Volume unit";
      break;
    case UnitSystem.ABSTRACT:
      value = "Abstract/discrete unit";
      break;
    default:
      value = "Unit";
      break;
  }
  return <>{value} *</>;
}

interface UnitModeDropdownProps extends Omit<CustomisableSelectProps, 'options'> {
  options?: CustomisableSelectProps['options'];
}

export const UnitModeDropdown: React.FC<UnitModeDropdownProps> = ({
  ...rest
}) => {
  return (
    <CustomisableSelect {...rest}
      options={unitSystemOptions}
    />
  );
}
