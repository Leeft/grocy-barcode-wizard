"use client";

import {
  ChangeEvent,
  use,
  useContext,
  useState,
  KeyboardEvent,
  useActionState,
  useEffect,
  useCallback,
} from "react";
import { QuantityUnitsDropdown } from "@/ui/product/quantity-units-dropdown";
import {
  ProductLocation as PrLocation,
  QuantityUnit,
} from "@/interfaces/grocy";
import { QuantityUnitContext } from "@/providers/quantity-unit-context";
import { editProductFormSubmit } from "@/forms/edit-product-form-submit";
import { EditProductFormSchema } from "@/forms/edit-product-form-schema";
import { Button } from "@/ui/button";
import { LocationContext } from "@/providers/location-context";
import { LocationDropdown } from "@/ui/product/location-dropdown";
import { FormLabel } from "@/ui/forms/inputs/form-label";
import { FormField } from "@/ui/forms/inputs/form-field";
import { FormErrors } from "@/ui/forms/inputs/form-errors";
import {
  ModeToQuantityTitle,
  ModeToUnitTitle,
} from "@/ui/product/unit-mode-dropdown";
import { CameraApp } from "@/ui/camera-app";
import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import TooltipWrapper from "@/ui/tooltip-wrapper";
import { GetProduct } from "@/lib/product-db";
import clsx from "clsx";
import {
  dateInputCommonStyles,
  dueDateTypeOptions,
  dueDaysInputCommonStyles,
  inputCommonStyles,
  unitSystemOptions,
} from "@/lib/product-form-shared";
import { DueDateType, UnitSystem } from "@/generated/prisma/enums";
import CustomisableSelect from "@/ui/customisable-select";
import {
  DueDaysColumn,
  FormCheckbox,
  FormColumn,
  FormRow,
  PackagingDateTooltip,
  ShouldNotBeFrozenTooltip,
  WeightModeTooltip,
} from "./form-utils";

export function EditProductForm({
  code,
  product,
}: {
  code: string;
  product: Promise<GetProduct>;
}) {
  const [lastResult, action, submitPending] = useActionState(
    editProductFormSubmit,
    undefined,
  );

  const productData = use(product);

  const [form, fields] = useForm({
    // Sync the result of last submission
    lastResult,

    defaultValue: {
      id: productData.id,
      name: productData.name,
      barcode: code,
      shouldNotBeFrozen:
        !productData.canBeFrozen ||
        productData.dueDateType === DueDateType.NO_EXPIRY
          ? "on"
          : null,
      unitSystem: productData.unitSystem,
      unitAmount: productData.unitAmount,
      unitId: productData.unitChosen.toString(),
      defaultLocationId: productData.defaultLocation.toString(),
      dueDateType: productData.dueDateType,
      dueOrExpiryDate: productData.expiresAt,
      packagingDate: productData.packagingDate,
      defaultDueDays:
        productData.defaultDueDays !== null
          ? productData.defaultDueDays.toString()
          : "",
      defaultDueDaysAfterOpen:
        productData.defaultDueDaysAfterOpen !== null
          ? productData.defaultDueDaysAfterOpen.toString()
          : "",
      defaultDueDaysAfterFreezing:
        productData.defaultDueDaysAfterFreezing !== null
          ? productData.defaultDueDaysAfterFreezing.toString()
          : "",
      defaultDueDaysAfterThawing:
        productData.defaultDueDaysAfterThawing !== null
          ? productData.defaultDueDaysAfterThawing.toString()
          : "",
    },

    // Reuse the validation logic on the client
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EditProductFormSchema });
    },

    // Validate the form on blur event triggered
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const [shouldNotBeFrozen, setShouldNotBeFrozen] = useState<boolean>(
    fields.shouldNotBeFrozen.value ? true : false,
  );
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(UnitSystem.WEIGHT);
  const [dueDateType, setDueDateType] = useState<DueDateType>(
    DueDateType.BEST_BEFORE,
  );
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [packagingDate, setPackagingDate] = useState<Date | null>(null);

  const units = use(useContext(QuantityUnitContext) as Promise<QuantityUnit[]>);
  const locations = use(useContext(LocationContext) as Promise<PrLocation[]>);

  const calculateDueDays = useCallback(() => {
    if (expiryDate === null) return;
    if (packagingDate === null) return;
    form.update({
      value: {
        defaultDueDays: Math.abs(
          Math.round(
            (packagingDate.getTime() - expiryDate.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        ),
      },
    });
  }, [expiryDate, packagingDate]);

  // Set the due days when a packing date and due/expiry dates are set
  useEffect(() => {
    calculateDueDays();
  }, [expiryDate, packagingDate, calculateDueDays]);

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
      <input {...getInputProps(fields.id, { type: "hidden" })} />
      <input {...getInputProps(fields.barcode, { type: "hidden" })} />
      <div id={form.errorId}>{form.errors}</div>
      <div className="flex flex-col">
        <div className="flex flex-row gap-5">
          <div className="mb-4 flex-auto">
            <h1 className="mb-3 inline-block text-lg font-bold text-slate-400 uppercase">
              Complete product capture
            </h1>
            <TooltipWrapper id="form-purpose-tooltip">
              This form completes the queued product capture to then configure
              the product in Grocy and add any stock as indicated.
              <br />
              <br />
              In case you need to make any changes, here is the data captured
              earlier. Plus you should enter more detailed data; so far we've
              only grabbed the minimum required to create a basic product.
            </TooltipWrapper>
          </div>
        </div>

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
                <FormCheckbox
                  fieldInfo={fields.shouldNotBeFrozen}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setShouldNotBeFrozen(e.target.checked)
                  }
                >
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
                  setUnitSystem(e.currentTarget.value as UnitSystem);
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
                unitSystem={unitSystem}
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
                noFreezers={shouldNotBeFrozen}
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
                {...getInputProps(fields.dueDateType, { type: "number" })}
                options={dueDateTypeOptions}
                onChange={(e) =>
                  setDueDateType(e.currentTarget.value as DueDateType)
                }
              />
            </FormField>
            <FormErrors
              id="due-date-type-error"
              errors={fields.dueDateType.errors}
            />
          </FormColumn>

          {fields.dueDateType.value !== null &&
            fields.dueDateType.value !== DueDateType.NO_EXPIRY && (
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
                      onChange={(e) =>
                        setExpiryDate(new Date(e.currentTarget.value))
                      }
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
                      onChange={(e) =>
                        setPackagingDate(new Date(e.currentTarget.value))
                      }
                    />
                  </FormField>
                  <FormErrors
                    id="packaging-date-error"
                    errors={fields.packagingDate.errors}
                  />
                </FormColumn>
              </>
            )}
        </FormRow>

        {dueDateType !== DueDateType.NO_EXPIRY && (
          <FormRow className="flex-col">
            <DueDaysColumn
              fieldInfo={fields.defaultDueDays}
              title="Default due days *"
              placeholder="default due days"
            />
            <DueDaysColumn
              fieldInfo={fields.defaultDueDaysAfterOpen}
              title="Default due days after open *"
              placeholder="days after open"
            />
            {!shouldNotBeFrozen && (
              <>
                <DueDaysColumn
                  fieldInfo={fields.defaultDueDaysAfterFreezing}
                  title="Default due days after freezing *"
                  placeholder="days after freezing"
                />
                <DueDaysColumn
                  fieldInfo={fields.defaultDueDaysAfterThawing}
                  title="Default due days after thawing *"
                  placeholder="days after thawing"
                />
              </>
            )}
          </FormRow>
        )}

        <CameraApp />

        <div className="flex flex-row gap-5">
          <div className="mt-6 flex-none">
            <Button type="submit" disabled={submitPending}>
              Create product
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
