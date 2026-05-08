"use client";

import { use, useActionState, useState } from "react";
import { Button } from "@/ui/button";
import { FormProvider, getFieldsetProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { FormCheckbox, FormColumn, FormErrors, FormField, FormRow } from "@/ui/forms/form-utils";
import { settingsSubmit } from "@/forms/settings-form-submit";
import { SettingsFormSchema } from "@/forms/settings-form-schema";
import { GetSettings } from "@/lib/settings-db";
import { CaptureSubmitOnEnter } from "@/forms/capture-submit";
import { dateToISODate } from "@/lib/utils";
import { clsx } from "clsx";
import { flushSync } from "react-dom";
import { GetApiKeys } from "@/lib/user-db";
import { UserApiKey } from "@/generated/prisma/browser";
import dynamic from "next/dynamic";
import TooltipWrapper from "../tooltip-wrapper";
import { toast } from "react-hot-toast";
import { withCallbacks } from "@/utils/action-state-callback/with-callback";
import { createToastCallbacks } from "@/utils/action-state-callback/toast-callback";

const CopyToClipboardButton = dynamic(() => import("@/ui/forms/settings-form-clipboard"), {
  ssr: false,
});

export function SettingsForm({
  settings,
  apiKeys: apiKeysPromise,
}: {
  settings: Promise<GetSettings>;
  apiKeys: Promise<GetApiKeys>;
}) {
  const [lastResult, action, submitPending] = useActionState(
    withCallbacks(
      settingsSubmit,
      createToastCallbacks({
        loadingMessage: "Saving settings ...",
      }),
    ),
    undefined,
  );

  //const [lastResult, action, submitPending] = useActionState(settingsSubmit, undefined);
  const [dirty, setDirty] = useState<boolean>(false);

  const data = use(settings);
  const apiKeyData = use(apiKeysPromise);

  const [form, fields] = useForm({
    lastResult,

    defaultValue: {
      openCameraByDefault: data.openCameraByDefault ? "on" : null,
      playSoundOnScan: data.playSoundOnScan ? "on" : null,
      apiKeys: apiKeyData.map((entry: UserApiKey) => {
        return {
          id: entry.id,
          apiKey: entry.apiKey,
          created: entry.created,
        };
      }),
    },

    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SettingsFormSchema });
    },
  });

  const apiKeys = fields.apiKeys.getFieldList();

  const deleteKey = (key: string) => {
    if (key === undefined || key === null) return;
    apiKeys.forEach((item) => {
      const entry = item.getFieldset();
      const existingValue = item.value;
      if (existingValue !== undefined && entry.apiKey.value === key) {
        existingValue.delete = "on";
        flushSync(() => {
          form.update({
            name: item.name,
            value: existingValue,
          });
        });
        setDirty(true);
      }
    });
  };

  function makeId(length: number = 32) {
    let result = "";
    const characters = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  const appendKey = () => {
    const currentValue = fields.apiKeys.value ?? [];
    const newEntry = [
      {
        apiKey: makeId(),
        created: "2026-05-03T13:00:28.470Z",
      },
    ];
    // @ts-expect-error Not quite sure how to type these correctly
    const newValue = currentValue.concat(newEntry);
    form.update({
      name: fields.apiKeys.name,
      // @ts-expect-error Not quite sure how to type these correctly
      value: newValue,
    });
    setDirty(true);
  };

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
                    Play a sound when a barcode is accepted by the scan mode{" "}
                    <TooltipWrapper id="playmode-clarification">
                      The sound plays only when the barcode is recognised as a product barcode, and the client
                      is connected with the "SCAN mode" active (as indicated by the SCAN menu option being
                      highlighted).
                      <br />
                      <br />
                      Barcodes received while the client is not displaying a scan mode page will not be
                      accepted and processed, and no sound will play.
                    </TooltipWrapper>
                  </FormCheckbox>
                </FormField>
                <FormErrors id={fields.playSoundOnScan.errorId} errors={fields.playSoundOnScan.errors} />
              </div>
            </FormColumn>
          </FormRow>

          <fieldset {...getFieldsetProps(fields.apiKeys)} className="mb-5 rounded-lg border px-4">
            <legend className="px-2">
              API keys{" "}
              <TooltipWrapper id="api-keys-explanation" className="mr-3 pr-4">
                These API keys (you need just one, more is entirely optional) authenticate requests made to
                the API provided by this program, and need to be used to authenticate the script or program
                you use to send your barcodes to this program.
              </TooltipWrapper>
            </legend>

            <FormRow comment="API keys">
              <FormColumn>
                <div className="mt-3 mb-4 flex flex-col leading-7">
                  <FormField>
                    <div className="flex flex-col flex-wrap gap-2 gap-y-6">
                      {apiKeys.map((item) => {
                        const entry = item.getFieldset();
                        return (
                          <div key={item.key}>
                            <div
                              className={clsx(
                                `flex`,
                                `flex-row`,
                                `flex-wrap`,
                                `gap-x-5`,
                                `gap-y-2`,
                                entry.delete.value === "on" ? "line-through opacity-70" : "",
                              )}
                            >
                              <input
                                id={entry.id.id}
                                name={entry.id.name}
                                value={entry.id.value}
                                type="hidden"
                              />
                              <input
                                id={entry.apiKey.id}
                                name={entry.apiKey.name}
                                value={entry.apiKey.value}
                                type="hidden"
                              />
                              <input
                                id={entry.created.id}
                                name={entry.created.name}
                                value={entry.created.value}
                                type="hidden"
                              />
                              <input
                                id={entry.delete.id}
                                name={entry.delete.name}
                                value={entry.delete.value ? "on" : ""}
                                type="hidden"
                              />
                              <div className="w-auto shrink text-xs md:text-base">
                                <code className="">{entry.id.value ?? "-"}</code>
                              </div>
                              <div className="w-auto shrink text-xs md:text-base">
                                <code>{entry.apiKey.value}</code>
                              </div>
                              <div className="w-auto shrink text-clip">
                                {entry.created.value !== undefined
                                  ? dateToISODate(new Date(entry.created.value!))
                                  : "-"}
                              </div>
                              <CopyToClipboardButton value={entry.apiKey.value!} />
                              <div className="flex w-auto shrink">
                                <button
                                  className={
                                    "cursor-pointer rounded-lg border px-3 disabled:cursor-default disabled:opacity-50"
                                  }
                                  disabled={entry.delete.value === "on"}
                                  onClick={(e) => {
                                    deleteKey(entry.apiKey.value!);
                                    e.preventDefault();
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {apiKeys.length === 0 && <div className="text-alert font-bold">Add an API key</div>}
                    </div>

                    <button
                      className={"my-2 mt-4 cursor-pointer rounded-lg border px-3"}
                      onClick={(e) => {
                        appendKey();
                        e.preventDefault();
                      }}
                    >
                      Add API key
                    </button>
                  </FormField>
                </div>
              </FormColumn>
              <FormErrors
                className="mt-0 mb-4 pt-0"
                id={fields.apiKeys.errorId}
                errors={fields.apiKeys.errors}
              />
            </FormRow>
          </fieldset>

          <FormRow comment="Save settings button">
            <FormColumn>
              <Button
                type="submit"
                className={`cursor-pointer ${!dirty ? "opacity-40" : "opacity-100"}`}
                disabled={submitPending}
              >
                Save settings
              </Button>
            </FormColumn>
          </FormRow>
        </div>
      </form>
    </FormProvider>
  );
}
