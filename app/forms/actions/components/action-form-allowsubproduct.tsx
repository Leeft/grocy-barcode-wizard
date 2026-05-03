import { FormCheckbox, FormColumn, FormErrors, FormField } from "@/ui/forms/form-utils";
import TooltipWrapper from "@/ui/tooltip-wrapper";
import { FieldMetadata, getInputProps } from "@conform-to/react";

export function ActionFormAllowSubproductSubstitution({ field }: { field: FieldMetadata<unknown> }) {
  if (true) {
    return <input {...getInputProps(field, { type: "hidden" })} />;
  }

  return (
    <FormColumn className="w-full">
      <div className="flex flex-col leading-7">
        <FormField>
          <FormCheckbox fieldInfo={field}>Allow subproduct substitution</FormCheckbox>
          <TooltipWrapper id="allow-subproduct-substitution">
            <code>true</code> when any in stock sub product should be used when the given product is a parent
            product and currently not in stock.
          </TooltipWrapper>
        </FormField>
        <FormErrors id={field.errorId} errors={field.errors} />
      </div>
    </FormColumn>
  );
}
