import { inputCommonStyles } from "@/lib/product-form-shared";

import React, { RefObject } from "react";

export type CustomisableSelectOption = {
  value: string;
  label: string;
  type?: string;
  isDisabled?: boolean;
};

export type CustomisableSelectGroup = {
  options: (CustomisableSelectOption | CustomisableSelectGroup)[];
  label: string;
};

type CustomisableSelectGroupOrOption =
  | CustomisableSelectOption
  | CustomisableSelectGroup;

export type CustomisableSelectOptionArray = CustomisableSelectGroupOrOption[];

export interface CustomisableSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  options: CustomisableSelectOptionArray;
  ref?: RefObject<HTMLSelectElement>;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}

export const CustomisableSelect: React.FC<CustomisableSelectProps> = ({
  className,
  options,
  ref,
  onChange,
  ...rest
}) => {
  //console.log( "rest is", rest );
  return (
    <select
      {...rest}
      ref={ref}
      onChange={onChange}
      className={`customisable ${inputCommonStyles} ${className}`}
    >
      {options.map((optionOrGroup) => (
        <OptGroup
          key={`top_` + rest.name + `_` + optionOrGroup.label}
          group={optionOrGroup}
          prefix={rest.name!}
        />
      ))}
    </select>
  );
};

function SingleOption({
  option,
  prefix,
}: {
  option: CustomisableSelectOption;
  prefix: string;
}) {
  return (
    <option
      key={prefix + `_` + option.value}
      value={option.value}
      disabled={option.isDisabled}
    >
      {option.label}
    </option>
  );
}

function isGroup(
  group: CustomisableSelectGroupOrOption,
): group is CustomisableSelectGroup {
  return (group as CustomisableSelectGroup).options !== undefined;
}

function OptGroup({
  group,
  prefix,
}: {
  group: CustomisableSelectGroupOrOption;
  prefix: string;
}) {
  if (!isGroup(group)) {
    return <SingleOption option={group} prefix={prefix} />;
  }

  if (group.options.length === 0) {
    return <></>;
  }

  return (
    <optgroup label={group.label} key={prefix + `_` + group.label}>
      {group.options.map((option: CustomisableSelectGroupOrOption) => (
        <OptGroup
          key={prefix + `_` + group.label + `_` + option.label}
          group={option}
          prefix={prefix}
        />
      ))}
    </optgroup>
  );
}

export default CustomisableSelect;
