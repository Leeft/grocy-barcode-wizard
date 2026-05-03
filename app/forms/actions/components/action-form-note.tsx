import { inputCommonStyles } from "@/lib/product-form-shared";
import { FormColumn, FormErrors, FormField, FormLabel } from "@/ui/forms/form-utils";
import { FieldMetadata, getInputProps } from "@conform-to/react";
import { clsx } from "clsx";

export function ActionFormNote({
  field,
  multiLine = false,
}: {
  field: FieldMetadata<unknown>;
  multiLine?: boolean;
}) {
  return (
    <FormColumn className="w-full md:w-110">
      <div className={`flex`}>
        <FormLabel htmlFor={field.name} title="Note" className="relative top-[-8] mb-0!" />
      </div>
      <FormField>
        {multiLine ? (
          <textarea
            {...getInputProps(field, {
              type: "text",
              value: false,
            })}
            className={clsx(inputCommonStyles, "w-full")}
          >
            {/* @ts-expect-error TS weirdness */}
            {field.value}
          </textarea>
        ) : (
          <input
            {...getInputProps(field, {
              type: "text",
            })}
            className={clsx(inputCommonStyles, "w-full")}
          />
        )}
      </FormField>
      <FormErrors id={field.errorId} errors={field.errors} />
    </FormColumn>
  );
}
