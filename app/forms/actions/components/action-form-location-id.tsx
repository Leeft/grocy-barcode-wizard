import { ProductLocation } from "@/interfaces/grocy";
import { CustomisableSelectOption } from "@/ui/customisable-select";
import { FormColumn, FormErrors, FormField, FormLabel } from "@/ui/forms/form-utils";
import { LocationDropdown } from "@/ui/product/location-dropdown";
import { FieldMetadata, getInputProps } from "@conform-to/react";
import { ChangeEventHandler } from "react";

export function ActionFormLocationId({
  field,
  title,
  units,
  value,
  noFreezers = false,
  autoFocus = false,
  allowEmpty = false,
  disableOption,
  firstOption,
  onChange,
}: {
  field: FieldMetadata<unknown>;
  title: string;
  units: ProductLocation[];
  value: string | number;
  noFreezers?: boolean;
  autoFocus?: boolean;
  allowEmpty?: boolean;
  disableOption?: string;
  firstOption?: CustomisableSelectOption | undefined;
  onChange: ChangeEventHandler<HTMLSelectElement, Element>;
}) {
  return (
    <FormColumn className="w-full">
      <div className="w-full md:w-110">
        <FormLabel htmlFor={field.name} title={title} className="inline-block"></FormLabel>
        <FormField>
          <LocationDropdown
            {...getInputProps(field, {
              type: "number",
              value: false,
            })}
            units={units}
            value={value}
            className="w-full flex-2"
            noFreezers={noFreezers}
            allowEmpty={allowEmpty}
            autoFocus={autoFocus}
            onChange={onChange}
            disableOption={disableOption}
            firstOption={firstOption}
          />
        </FormField>
      </div>
      <FormErrors id={field.errorId} errors={field.errors} />
    </FormColumn>
  );
}
