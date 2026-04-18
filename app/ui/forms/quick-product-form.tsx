"use client";

import {
  ChangeEvent,
  use,
  useCallback,
  useContext,
  useEffect,
  useState,
  KeyboardEvent,
  useActionState,
} from "react";
import { QuantityUnitsDropdown } from "../product/quantity-units-dropdown";
import {
  ProductLocation as PrLocation,
  QuantityUnit,
} from "@/interfaces/grocy";
import { QuantityUnitContext } from "@/providers/quantity-unit-context";
import { quickProductFormSubmit } from "@/forms/quick-product-form-submit";
import { QuickProductFormSchema } from "@/forms/quick-product-form-schema";
import { Button } from "../button";
import { LocationContext } from "@/providers/location-context";
import { LocationDropdown } from "../product/location-dropdown";
import { FormLabel } from "./inputs/form-label";
import { FormField } from "./inputs/form-field";
import { FormErrors } from "./inputs/form-errors";
import {
  ModeToQuantityTitle,
  ModeToUnitTitle,
} from "../product/unit-mode-dropdown";
import { CameraApp } from "../camera-app";
import clsx from "clsx";
import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import TooltipWrapper from "../tooltip-wrapper";
import { DueDateType, UnitSystem } from "@/generated/prisma/enums";
import {
  dateInputCommonStyles,
  dueDateTypeOptions,
  inputCommonStyles,
  unitSystemOptions,
} from "@/lib/product-form-shared";
import CustomisableSelect from "../customisable-select";
import {
  DueDaysColumn,
  FormColumn,
  FormRow,
  FormCheckbox,
  ShouldNotBeFrozenTooltip,
  WeightModeTooltip,
  PackagingDateTooltip,
} from "@/ui/forms/form-utils";
import { dateToISODate } from "@/lib/date";

export function QuickProductForm({ code }: { code: string }) {
  const [lastResult, action, submitPending] = useActionState(
    quickProductFormSubmit,
    undefined,
  );

  const [form, fields] = useForm({
    // Sync the result of last submission
    lastResult,

    defaultValue: {
      unitAmount: "1.0",
      dueDays: "0",
      dueDaysAfterOpen: "0",
      dueDaysAfterFreezing: "0",
      dueDaysAfterThawing: "0",
    },

    // Reuse the validation logic on the client
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: QuickProductFormSchema });
    },

    // Validate the form on blur event triggered
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const units = use(useContext(QuantityUnitContext) as Promise<QuantityUnit[]>);
  const locations = use(useContext(LocationContext) as Promise<PrLocation[]>);

  const calculateDueDays = (expiryDate: Date, packagingDate: Date) => {
    if (expiryDate === null) return;
    if (packagingDate === null) return;
    form.update({
      value: {
        dueDays: Math.abs(
          Math.round(
            (packagingDate.getTime() - expiryDate.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        ),
      },
    });
    form.validate();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    if (e.key === "Enter" && target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  return (
    <form
      id={form.id}
      onSubmit={form.onSubmit}
      action={action}
      noValidate
      onKeyDown={handleKeyDown}
      className="pb-25"
      aria-describedby={form.errors ? form.errorId : undefined}
    >
      <input
        {...getInputProps(fields.barcode, { type: "hidden" })}
        value={code}
      />
      <div id={form.errorId}>{form.errors}</div>
      <div className="flex flex-col">
        <FormRow>
          <div className="flex-auto">
            <h1 className="mb-3 inline-block text-lg font-bold text-slate-400 uppercase">
              Initial product capture
            </h1>
            <TooltipWrapper id="form-purpose-tooltip">
              This form captures the essentials for a product quickly while you
              have the product at hand, only queueing it to be completed and
              added to Grocy later while your products are safely back under
              refrigeration or freezing conditions.
            </TooltipWrapper>
          </div>
        </FormRow>

        <FormRow>
          <FormColumn className="mb-2 flex-auto">
            <FormLabel htmlFor={fields.name.name} title="Product name *" />
            <FormField>
              <input
                {...getInputProps(fields.name, { type: "text" })}
                placeholder="Name of the product to create, 2 to 128 characters long"
                className={clsx("w-full", "pr-3", inputCommonStyles, "mb-0")}
              />
            </FormField>
            <FormErrors id={fields.name.errorId} errors={fields.name.errors} />
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormColumn>
            <div className="flex flex-col leading-7">
              <FormField>
                <FormCheckbox fieldInfo={fields.shouldNotBeFrozen}>
                  This product should not be frozen
                  <ShouldNotBeFrozenTooltip />
                </FormCheckbox>
              </FormField>
              <FormErrors
                id={fields.shouldNotBeFrozen.errorId}
                errors={fields.shouldNotBeFrozen.errors}
              />
            </div>
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormColumn className="flex-none">
            <FormLabel
              htmlFor="unitSystem"
              title="Unit system *"
              className="inline"
            >
              <WeightModeTooltip />
            </FormLabel>
            <FormField>
              <CustomisableSelect
                {...getInputProps(fields.unitSystem, { type: "number" })}
                options={unitSystemOptions}
                onChange={(e) => {
                  form.update({
                    value: {
                      unitSystem: e.currentTarget.value as UnitSystem,
                      unitAmount:
                        e.currentTarget.value === UnitSystem.ABSTRACT
                          ? "1.0"
                          : "",
                    },
                  });
                }}
                required
              />
            </FormField>
            <FormErrors
              id={fields.unitSystem.errorId}
              errors={fields.unitSystem.errors}
            />
          </FormColumn>
          <FormColumn className="flex-none">
            <FormLabel
              htmlFor={fields.unitAmount.name}
              title={ModeToQuantityTitle(fields.unitSystem?.value)}
            ></FormLabel>
            <FormField>
              <input
                {...getInputProps(fields.unitAmount, { type: "number" })}
                step={0.001}
                placeholder="Number"
                className={clsx(
                  "hide-arrows",
                  "peer",
                  "w-30",
                  inputCommonStyles,
                  "rounded-md!",
                )}
              />
            </FormField>
            <FormErrors
              id={fields.unitAmount.errorId}
              errors={fields.unitAmount.errors}
            />
          </FormColumn>
          <FormColumn className="grow">
            <FormLabel
              htmlFor={fields.unitId.name}
              title={ModeToUnitTitle(fields.unitSystem?.value)}
            ></FormLabel>
            <FormField>
              <QuantityUnitsDropdown
                {...getInputProps(fields.unitId, {
                  type: "number",
                })}
                units={units}
                unitSystem={fields.unitSystem.value as UnitSystem}
                className="w-46"
                required
              />
            </FormField>
            <FormErrors
              id={fields.unitId.errorId}
              errors={fields.unitId.errors}
            />
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormColumn className="grow">
            <FormLabel
              htmlFor={fields.defaultLocationId.name}
              title="Initial product location *"
            ></FormLabel>
            <FormField>
              <LocationDropdown
                {...getInputProps(fields.defaultLocationId, { type: "number" })}
                units={locations}
                className="w-auto flex-2"
                noFreezers={fields.shouldNotBeFrozen.value ? true : false}
                required
              />
            </FormField>
            <FormErrors
              id={fields.defaultLocationId.errorId}
              errors={fields.defaultLocationId.errors}
            />
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormColumn className="flex-none">
            <FormLabel
              htmlFor={fields.dueDateType.name}
              title="Due date type *"
            ></FormLabel>
            <FormField>
              <CustomisableSelect
                {...getInputProps(fields.dueDateType, { type: "hidden" })}
                options={dueDateTypeOptions}
              />
            </FormField>
            <FormErrors
              id={fields.dueDateType.errorId}
              errors={fields.dueDateType.errors}
            />
          </FormColumn>

          {fields.dueDateType.value !== DueDateType.NO_EXPIRY && (
            <>
              <FormColumn className="flex-none">
                <FormLabel
                  htmlFor={fields.dueOrExpiryDate.name}
                  title={
                    fields.dueOrExpiryDate.value === DueDateType.BEST_BEFORE
                      ? "Best before *"
                      : "Expires at *"
                  }
                ></FormLabel>
                <FormField>
                  <input
                    {...getInputProps(fields.dueOrExpiryDate, {
                      type: "date",
                    })}
                    required
                    className={dateInputCommonStyles}
                    onChange={(e) => {
                      if (fields.packagingDate.value)
                        calculateDueDays(
                          new Date(e.currentTarget.value),
                          new Date(fields.packagingDate.value),
                        );
                    }}
                  />
                </FormField>
                <FormErrors
                  id={fields.dueOrExpiryDate.errorId}
                  errors={fields.dueOrExpiryDate.errors}
                />
              </FormColumn>
              <FormColumn className="flex-none">
                <FormLabel
                  htmlFor={fields.packagingDate.name}
                  title="Packaging date"
                  className="inline"
                >
                  <PackagingDateTooltip />
                </FormLabel>
                <FormField>
                  <input
                    {...getInputProps(fields.packagingDate, { type: "date" })}
                    className={dateInputCommonStyles}
                    max={dateToISODate(new Date())}
                    onChange={(e) => {
                      if (fields.dueOrExpiryDate.value)
                        calculateDueDays(
                          new Date(fields.dueOrExpiryDate.value),
                          new Date(e.currentTarget.value),
                        );
                    }}
                  />
                </FormField>
                <FormErrors
                  id={fields.packagingDate.errorId}
                  errors={fields.packagingDate.errors}
                />
              </FormColumn>
            </>
          )}
        </FormRow>

        {fields.dueDateType.value !== DueDateType.NO_EXPIRY && (
          <FormRow className="flex-col">
            <DueDaysColumn
              fieldInfo={fields.dueDays}
              title="Default due days *"
              placeholder="default due days"
            />
            <DueDaysColumn
              fieldInfo={fields.dueDaysAfterOpen}
              title="Default due days after open *"
              placeholder="days after open"
            />
            {!fields.shouldNotBeFrozen.value && (
              <>
                <DueDaysColumn
                  fieldInfo={fields.dueDaysAfterFreezing}
                  title="Default due days after freezing *"
                  placeholder="days after freezing"
                />
                <DueDaysColumn
                  fieldInfo={fields.dueDaysAfterThawing}
                  title="Default due days after thawing *"
                  placeholder="days after thawing"
                />
              </>
            )}
          </FormRow>
        )}

        <CameraApp />

        <FormRow>
          <FormColumn className="mt-6 flex-none">
            <Button type="submit" disabled={submitPending}>
              Add to queue
            </Button>
          </FormColumn>
        </FormRow>
      </div>
    </form>
  );
}
