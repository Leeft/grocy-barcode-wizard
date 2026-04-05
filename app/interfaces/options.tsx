export type OptionType = {
  value: string | undefined;
  label: string | undefined;
  type?: string | undefined;
  isDisabled?: boolean;
};

export type GroupType = {
  label: string | undefined;
  options: OptionType[];
};

export type OptionOrGroup = OptionType | GroupType;

export type OptionOrGroupArray = Array<OptionOrGroup>;
