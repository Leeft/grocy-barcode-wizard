"use client";

import { useActionState, useState } from "react";
import { productCreateSubmit } from "@/forms/product-form-submit";
import { Button } from "@/ui/button";
import { CameraApp } from "@/ui/camera-app";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import TooltipWrapper from "@/ui/tooltip-wrapper";
import { FormColumn, FormRow } from "@/ui/forms/form-utils";
import CreateProductFields from "@/ui/forms/create-product-fields";
import { ProductFormSchema } from "@/forms/product-form-schema";
import { CaptureSubmitOnEnter } from "@/forms/capture-submit";

export function CreateProductForm({ code }: { code: string }) {
  const [lastResult, action, submitPending] = useActionState(productCreateSubmit, undefined);

  const [form, fields] = useForm({
    lastResult,

    id: `create-${code}`,

    defaultValue: {
      unitAmount: "1.0",
      dueDays: "0",
      dueDaysAfterOpen: "0",
      dueDaysAfterFreezing: "0",
      dueDaysAfterThawing: "0",
    },

    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ProductFormSchema });
    },

    // Validate the form on blur event triggered
    //shouldValidate: "onBlur",
    //shouldRevalidate: "onInput",
  });

  const [selectedUnit, setSelectedUnit] = useState<string>(fields.unitId.value!);

  return (
    <FormProvider context={form.context}>
      <CaptureSubmitOnEnter formId={form.id} />
      <form
        id={form.id}
        onSubmit={form.onSubmit}
        action={action}
        noValidate
        className="pb-25"
        aria-describedby={form.errors ? form.errorId : undefined}
      >
        <input {...getInputProps(fields.barcode, { type: "hidden" })} value={code} />
        <input {...getInputProps(fields.intent, { type: "hidden" })} value="create" />
        <div id={form.errorId}>{form.errors}</div>
        <div className="flex flex-col gap-y-5">
          <FormRow comment="Page header">
            <FormColumn className="flex-auto">
              <h1 className="inline-block text-lg font-bold text-slate-400 uppercase">
                Initial product capture
              </h1>
              <TooltipWrapper id="form-purpose-tooltip">
                This form captures the essentials for a product quickly while you have the product at hand,
                only queueing it to be completed and added to Grocy later while your products are safely back
                under refrigeration or freezing conditions.
              </TooltipWrapper>
            </FormColumn>
          </FormRow>

          <CreateProductFields
            formId={form.id}
            fields={fields}
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
          />

          <CameraApp />

          <FormRow comment="Create add to queue button">
            <FormColumn>
              <Button type="submit" disabled={submitPending}>
                Add to queue
              </Button>
            </FormColumn>
          </FormRow>
        </div>
      </form>
    </FormProvider>
  );
}
