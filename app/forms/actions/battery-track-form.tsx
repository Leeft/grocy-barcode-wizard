"use client";

import { useActionState } from "react";
import { parseWithZod } from "@conform-to/zod/v4";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
import { batteryTrackSubmit } from "@/forms/actions/battery-track-submit";
import { FormRow, FormColumn, FormLabel, FormField, FormErrors } from "@/ui/forms/form-utils";
import { inputCommonStyles } from "@/lib/product-form-shared";
import { FieldSet, Legend } from "@/ui/forms/fieldset";
import { CaptureSubmitOnEnter } from "@/forms/capture-submit";
import { ActionFormSubmit } from "./components/action-form-submit";
import { BatteryChargeTrackingSchema } from "@/forms/action-form-schemas";
import { Battery } from "@/interfaces/grocy";

export function BatteryTrackForm({ code, battery }: { code: string; battery: Battery }) {
  const [lastResult, action, submitPending] = useActionState(batteryTrackSubmit, undefined);

  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  const [form, fields] = useForm({
    lastResult,

    defaultValue: {
      barcode: code,
      batteryId: battery.id?.toString(),
      chargeDate: date.toISOString().replace(/[.]\d+Z$/, ""),
    },

    onValidate({ formData }) {
      return parseWithZod(formData, { schema: BatteryChargeTrackingSchema });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <FormProvider context={form.context}>
      <CaptureSubmitOnEnter formId={form.id} />
      <form
        id={form.id}
        onSubmit={form.onSubmit}
        action={action}
        noValidate
        aria-describedby={form.errors ? form.errorId : undefined}
        className="pt-2p pb-25"
      >
        <div id={form.errorId}>{form.errors}</div>
        <input {...getInputProps(fields.barcode, { type: "hidden" })} />
        <input {...getInputProps(fields.batteryId, { type: "hidden" })} />

        <FieldSet>
          <Legend className="text-track-battery">Track battery charge event</Legend>

          <FormRow comment="Charge date">
            <FormColumn className="w-full flex-none">
              <div className="w-64">
                <FormLabel htmlFor={fields.chargeDate.id} title="Charge date and time *"></FormLabel>
                <FormField>
                  <input
                    {...getInputProps(fields.chargeDate, {
                      type: "datetime-local",
                    })}
                    step={60}
                    required
                    onFocus={(e) => e.currentTarget.select()}
                    className={inputCommonStyles}
                  />
                </FormField>
              </div>
              <FormErrors id={fields.chargeDate.errorId} errors={fields.chargeDate.errors} />
            </FormColumn>
          </FormRow>

          <FormRow comment="Track charge button">
            <ActionFormSubmit
              className="bg-track-battery/50! border-track-battery/90!"
              pending={submitPending}
            >
              <span className="text-white">Track battery charge</span>
            </ActionFormSubmit>
          </FormRow>
        </FieldSet>
      </form>
    </FormProvider>
  );
}
