"use client";

import { KeyboardEvent, use, useActionState, useState } from "react";
import { Button } from "@/ui/button";
import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { FormCheckbox, FormColumn, FormErrors, FormField, FormRow } from "@/ui/forms/form-utils";
import { settingsSubmit } from "@/forms/settings-form-submit";
import { SettingsFormSchema } from "@/forms/settings-form-schema";
import { GetSettings } from "@/lib/settings-db";

export function SettingsForm({ settings }: { settings: Promise<GetSettings> }) {
  const [lastResult, action, submitPending] = useActionState(settingsSubmit, undefined);
  const [dirty, setDirty] = useState<boolean>(false);

  const data = use(settings);
  const defaultValue = {
    openCameraByDefault: data.openCameraByDefault ? 'on' : null,
    playSoundOnScan: data.playSoundOnScan ? 'on' : null,
  };

  const [form, fields] = useForm({
    lastResult,

    defaultValue,

    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SettingsFormSchema });
    },
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    if (e.key === "Enter" && target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  return (
    <FormProvider context={form.context}>
      <form
        id={form.id}
        onSubmit={form.onSubmit}
        action={action}
        noValidate
        onKeyDown={handleKeyDown}
        className="pb-25"
        aria-describedby={form.errors ? form.errorId : undefined}
      >
        <div id={form.errorId}>{form.errors}</div>
        <div className="flex flex-col gap-y-3">
          <FormRow comment="Page header">
            <FormColumn className="flex-auto">
              <h1 className="inline-block text-lg font-bold text-slate-400 uppercase">Settings</h1>
              {/* <TooltipWrapper id="settings-tooltip">These are your settings. Really.</TooltipWrapper> */}
            </FormColumn>
          </FormRow>

          <FormRow comment="Open the camera by default">
            <FormColumn>
              <div className="flex flex-col leading-7">
                <FormField>
                  <FormCheckbox fieldInfo={fields.openCameraByDefault} onChange={() => setDirty(true)}>
                    Always open the camera by default
                  </FormCheckbox>
                </FormField>
                <FormErrors
                  id={fields.openCameraByDefault.errorId}
                  errors={fields.openCameraByDefault.errors}
                />
              </div>
            </FormColumn>
          </FormRow>

          <FormRow comment="Open the camera by default">
            <FormColumn>
              <div className="flex flex-col leading-7">
                <FormField>
                  <FormCheckbox fieldInfo={fields.playSoundOnScan} onChange={() => setDirty(true)}>
                    Play a sound when a barcode is scanned
                  </FormCheckbox>
                </FormField>
                <FormErrors
                  id={fields.playSoundOnScan.errorId}
                  errors={fields.playSoundOnScan.errors}
                />
              </div>
            </FormColumn>
          </FormRow>

          <FormRow comment="Save settings button">
            <FormColumn>
              <Button type="submit" className={`cursor-pointer ${!dirty ? 'opacity-40' : 'opacity-100'}`} disabled={submitPending}>
                Save settings
              </Button>
            </FormColumn>
          </FormRow>
        </div>
      </form>
    </FormProvider>
  );
}
