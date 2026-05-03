import { stockLabelOptions } from "@/lib/product-form-shared";
import { CustomisableSelect } from "@/ui/customisable-select";
import { FormColumn, FormErrors, FormField, FormLabel } from "@/ui/forms/form-utils";
import { FieldMetadata, getInputProps } from "@conform-to/react";

export function ActionFormStockLabelType({
  field,
  title = "Stock entry label",
}: {
  field: FieldMetadata<unknown>;
  title?: string;
}) {
  return (
    <FormColumn className="w-full">
      <div className="w-full md:w-110">
        <FormLabel htmlFor={field.name} title={title} className="inline-block" />
        <FormField>
          <CustomisableSelect
            {...getInputProps(field, {
              type: "hidden",
            })}
            options={stockLabelOptions}
            className="w-40"
          />
        </FormField>
      </div>
      <FormErrors id={field.errorId} errors={field.errors} />
    </FormColumn>
  );
}
