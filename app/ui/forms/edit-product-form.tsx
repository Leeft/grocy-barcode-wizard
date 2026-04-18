"use client";

import {
  ChangeEvent,
  use,
  useContext,
  useState,
  KeyboardEvent,
  useActionState,
  useRef,
  RefObject,
} from "react";
import { QuantityUnitsDropdown } from "@/ui/product/quantity-units-dropdown";
import {
  ProductLocation as PrLocation,
  ProductGroup,
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
  inputCommonStyles,
  purchasePriceOptions,
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
import { ProductGroupDropdown } from "../product/product-group-dropdown";
import { ProductGroupContext } from "@/providers/product-group-context";
import { dateToISODate } from "@/lib/date";
import { GrocyConfigContext } from "@/providers/grocy-config-context";
import { toMap } from "@/lib/utils";
const unitClass = "text-green-200";
const unitTaggedLabelClass = clsx("w-60 flex grow");

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

  const weightUnitIdRef = useRef<HTMLSelectElement>(undefined);

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
      dueDays:
        productData.dueDays !== null ? productData.dueDays.toString() : "",
      dueDaysAfterOpen:
        productData.dueDaysAfterOpen !== null
          ? productData.dueDaysAfterOpen.toString()
          : "",
      dueDaysAfterFreezing:
        productData.dueDaysAfterFreezing !== null
          ? productData.dueDaysAfterFreezing.toString()
          : "",
      dueDaysAfterThawing:
        productData.dueDaysAfterThawing !== null
          ? productData.dueDaysAfterThawing.toString()
          : "",

      tareWeight: 0,
      energy: 0,
      quickConsumeAmount: 1.0,
      quickOpenAmount: 1.0,
    },

    // Reuse the validation logic on the client
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EditProductFormSchema });
    },

    // Validate the form on blur event triggered
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const units = use(useContext(QuantityUnitContext) as Promise<QuantityUnit[]>);
  const locations = use(useContext(LocationContext) as Promise<PrLocation[]>);
  const grocyConfig = use(
    useContext(GrocyConfigContext) as Promise<Record<string, never>>,
  );

  const unitsMap = units.reduce(toMap, {});
  const locationsMap = locations.reduce(toMap, {});

  const productGroups = use(
    useContext(ProductGroupContext) as Promise<ProductGroup[]>,
  );

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
              earlier. Plus you should enter more detailed data; so far
              we&apos;ve only grabbed the minimum required to create a basic
              product.
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

                  if (e.currentTarget.value !== UnitSystem.WEIGHT) {
                    form.update({
                      value: {
                        enableTareWeight: false,
                      },
                    });
                  }

                  fields.unitSystem.valid = true;
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
              className={`text-sm! ${unitClass}!`}
            ></FormLabel>
            <FormField>
              <QuantityUnitsDropdown
                {...getInputProps(fields.unitId, {
                  type: "number",
                })}
                ref={weightUnitIdRef as RefObject<HTMLSelectElement>}
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

        <hr className="mt-6 mb-6 text-slate-500" />

        <FormRow>
          <FormColumn className="grow">
            <FormLabel
              htmlFor={fields.productGroup.name}
              title="Product group"
              className="inline"
            ></FormLabel>
            <FormField>
              <ProductGroupDropdown
                {...getInputProps(fields.productGroup, { type: "number" })}
                className="w-auto flex-2"
                insert={{ value: "0", label: "Pick ..." }}
                units={productGroups}
              />
            </FormField>
            <FormErrors
              id={fields.productGroup.errorId}
              errors={fields.productGroup.errors}
            />
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormColumn className="grow">
            <FormLabel
              htmlFor={fields.quantityUnitStock.name}
              title="Quantity unit stock (not editable; uses the unit system set above)"
            ></FormLabel>
            <FormField>
              <input
                {...getInputProps(fields.quantityUnitStock, {
                  type: "text",
                })}
                name={fields.quantityUnitStock.name}
                className={clsx(
                  "w-46",
                  "pr-3",
                  inputCommonStyles,
                  "mb-0",
                  "cursor-not-allowed",
                  "text-slate-400",
                  "border-slate-500",
                  `${unitClass}!`,
                )}
                value={
                  fields.unitId.value
                    ? unitsMap[fields.unitId.value].name
                    : "(Is set above)"
                }
                readOnly={true}
              />
            </FormField>
            <FormErrors id={fields.quantityUnitStock.errorId} errors={[""]} />
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormColumn className="grow">
            <FormLabel
              htmlFor={fields.defaultQuantityUnitPurchase.name}
              title="Default quantity unit purchase *"
            ></FormLabel>
            <FormField>
              <QuantityUnitsDropdown
                {...getInputProps(fields.defaultQuantityUnitPurchase, {
                  type: "number",
                })}
                units={units}
                unitSystem={fields.unitSystem.value as UnitSystem}
                allOptions
                className="w-46"
                required
              />
            </FormField>
            <FormErrors
              id={fields.defaultQuantityUnitPurchase.errorId}
              errors={fields.defaultQuantityUnitPurchase.errors}
            />
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormLabel
            htmlFor={fields.quickConsumeAmount.name}
            className="w-full grow flex-col"
            title="By default, “consume” will consume this quantity: *"
          />
        </FormRow>
        <FormRow className="mt-[-7]">
          <FormColumn className="shrink">
            <FormField>
              <input
                {...getInputProps(fields.quickConsumeAmount, {
                  type: "number",
                })}
                min={0}
                step={0.001}
                placeholder="Number"
                className={clsx(
                  "hide-arrows",
                  "peer",
                  "w-16",
                  inputCommonStyles,
                  "rounded-md!",
                )}
              />
            </FormField>
            <FormErrors
              id={fields.quickConsumeAmount.errorId}
              errors={fields.quickConsumeAmount.errors}
            />
          </FormColumn>
          <FormColumn className="shrink">
            <FormField>
              <QuantityUnitsDropdown
                {...getInputProps(fields.defaultQuantityUnitConsume, {
                  type: "number",
                })}
                units={units}
                unitSystem={fields.unitSystem.value as UnitSystem}
                allOptions
                className="w-46"
                required
              />
            </FormField>
            <FormErrors
              id={fields.defaultQuantityUnitConsume.errorId}
              errors={fields.defaultQuantityUnitConsume.errors}
            />
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormColumn className="grow">
            <FormLabel
              htmlFor={fields.quantityUnitPrices.name}
              title="Quantity unit for prices *"
            ></FormLabel>
            <FormField>
              <QuantityUnitsDropdown
                {...getInputProps(fields.quantityUnitPrices, {
                  type: "number",
                })}
                units={units}
                unitSystem={fields.unitSystem.value as UnitSystem}
                allOptions
                className="w-46"
                required
              />
            </FormField>
            <FormErrors
              id={fields.quantityUnitPrices.errorId}
              errors={fields.quantityUnitPrices.errors}
            />
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormColumn>
            <div className="flex flex-col leading-7">
              <FormField>
                <FormCheckbox fieldInfo={fields.cantOpen}>
                  Can't be opened
                </FormCheckbox>
              </FormField>
              <FormErrors
                id={fields.cantOpen.errorId}
                errors={fields.cantOpen.errors}
              />
            </div>
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormColumn>
            <div className="flex flex-col leading-7">
              <FormField>
                <FormCheckbox fieldInfo={fields.dontShowOnStock}>
                  Never show on stock overview
                  <TooltipWrapper id="do-not-show-on-stock-tooltip">
                    Hide from the stock overview irrespective of the stock
                    status of this item.
                  </TooltipWrapper>
                </FormCheckbox>
              </FormField>
              <FormErrors
                id={fields.dontShowOnStock.errorId}
                errors={fields.dontShowOnStock.errors}
              />
            </div>
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormColumn>
            <div className="flex flex-col leading-7">
              <FormField>
                <FormCheckbox fieldInfo={fields.disableOwnStock}>
                  Can't &ldquo;purchase&rdquo; these products
                  <TooltipWrapper id="disable-own-stock-tooltip">
                    This product can't have stock as it hides the product from
                    the &ldquo;purchase&rdquo; process.
                    <br />
                    <br />
                    You should probably only use this on a parent product which
                    is used to group and aggregate other products.
                  </TooltipWrapper>
                </FormCheckbox>
              </FormField>
              <FormErrors
                id={fields.disableOwnStock.errorId}
                errors={fields.disableOwnStock.errors}
              />
            </div>
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormColumn>
            <div className="flex flex-col leading-7">
              <FormField>
                <FormCheckbox fieldInfo={fields.disableStockChecking}>
                  Disable stock fulfillment checking for this ingredient
                  <TooltipWrapper id="stock-fulfillment-tooltip">
                    The default setting to use when adding the product as a
                    recipe ingredient.
                  </TooltipWrapper>
                </FormCheckbox>
              </FormField>
              <FormErrors
                id={fields.disableStockChecking.errorId}
                errors={fields.disableStockChecking.errors}
              />
            </div>
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormColumn className="grow">
            <FormLabel
              htmlFor={fields.defaultConsumeLocationId.name}
              title={`Default “consume” location`}
              className="inline"
            >
              <TooltipWrapper id="product-group-tooltip">
                &ldquo;Quick consume&rdquo; actions will use any stock at this
                location first.
              </TooltipWrapper>
            </FormLabel>
            <FormField>
              <LocationDropdown
                {...getInputProps(fields.defaultConsumeLocationId, {
                  type: "number",
                })}
                units={locations}
                className="w-auto flex-2"
                noFreezers={fields.shouldNotBeFrozen.value ? true : false}
                allowEmpty={true}
              />
            </FormField>
            <FormErrors
              id={fields.defaultConsumeLocationId.errorId}
              errors={fields.defaultConsumeLocationId.errors}
            />
          </FormColumn>
        </FormRow>

        {fields.defaultConsumeLocationId.value !== undefined &&
          Number(fields.defaultConsumeLocationId.value) > 0 &&
          !fields.cantOpen.value && (
            <FormRow>
              <FormColumn>
                <div className="flex flex-col leading-7">
                  <FormField>
                    <FormCheckbox fieldInfo={fields.moveOnOpen}>
                      Move to location{" "}
                      <span className="text-amber-200">
                        «
                        {
                          locationsMap[
                            Number(fields.defaultConsumeLocationId.value)
                          ]!.name
                        }
                        »
                      </span>{" "}
                      on “open”
                      <TooltipWrapper id="move-on-open-tooltip">
                        When marking this product as &ldquo;open&rdquo; the
                        configured amount will be moved to the default consume
                        location.
                      </TooltipWrapper>
                    </FormCheckbox>
                  </FormField>
                  <FormErrors
                    id={fields.moveOnOpen.errorId}
                    errors={fields.moveOnOpen.errors}
                  />
                </div>
              </FormColumn>
            </FormRow>
          )}

        {fields.unitSystem.value === UnitSystem.WEIGHT && (
          <>
            <FormRow>
              <FormColumn>
                <div className="flex flex-col leading-7">
                  <FormField>
                    <FormCheckbox fieldInfo={fields.enableTareWeight}>
                      Enable tare weight handling
                      <TooltipWrapper id="enable-tare-weight-tooltip">
                        In tare weight mode you always have to measure the total
                        quantity of your stock including the weight of the
                        container, and you provide the weight of the container
                        here.
                      </TooltipWrapper>
                    </FormCheckbox>
                  </FormField>
                  <FormErrors
                    id={fields.enableTareWeight.errorId}
                    errors={fields.enableTareWeight.errors}
                  />
                </div>
              </FormColumn>
            </FormRow>

            {fields.enableTareWeight.value !== undefined &&
              fields.enableTareWeight.value && (
                <FormRow>
                  <FormColumn className="grow">
                    <div className={`${unitTaggedLabelClass} h-5`}>
                      <FormLabel
                        htmlFor={fields.tareWeight.name}
                        title="Tare weight"
                      ></FormLabel>
                      <UnitForAmount
                        unit={fields.unitId.value!}
                        className="grow text-right"
                      />
                    </div>
                    <FormField>
                      <input
                        {...getInputProps(fields.tareWeight, {
                          type: "number",
                        })}
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
                      id={fields.tareWeight.errorId}
                      errors={fields.tareWeight.errors}
                    />
                  </FormColumn>
                </FormRow>
              )}
          </>
        )}

        <FormRow>
          <FormColumn className="grow">
            <div className={`${unitTaggedLabelClass} h-5`}>
              <FormLabel htmlFor={fields.energy.name} title="Energy" />

              <div className="grow text-right text-nowrap text-slate-400">
                <div
                  className={clsx(
                    "text-nowrap",
                    "inline",
                    !grocyConfig && "text-amber-700",
                  )}
                >
                  {grocyConfig && grocyConfig.ENERGY_UNIT
                    ? grocyConfig.ENERGY_UNIT
                    : "??"}
                </div>
                &nbsp;/&nbsp;
                <UnitForAmount unit={fields.unitId.value!} className="inline" />
              </div>
            </div>
            <FormField>
              <input
                {...getInputProps(fields.energy, { type: "number" })}
                min={0}
                step={0.001}
                placeholder={`Energy per TODO`}
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
              id={fields.energy.errorId}
              errors={fields.energy.errors}
            />
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormColumn className="grow">
            <div className={`${unitTaggedLabelClass} h-5`}>
              <FormLabel
                htmlFor={fields.quickOpenAmount.name}
                title="Quick open amount"
              />
              <UnitForAmount
                unit={fields.unitId.value!}
                className="h-5 grow text-right text-sm"
              />
            </div>
            <FormField>
              <input
                {...getInputProps(fields.quickOpenAmount, { type: "number" })}
                min={0}
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
              id={fields.quickOpenAmount.errorId}
              errors={fields.quickOpenAmount.errors}
            />
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormColumn className="flex-none">
            <FormLabel
              htmlFor={fields.purchasePriceType.name}
              title="Default purchase price type"
            ></FormLabel>
            <FormField>
              <CustomisableSelect
                {...getInputProps(fields.purchasePriceType, { type: "hidden" })}
                options={purchasePriceOptions}
              />
            </FormField>
            <FormErrors
              id={fields.purchasePriceType.errorId}
              errors={fields.purchasePriceType.errors}
            />
          </FormColumn>
        </FormRow>

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

function UnitForAmount({
  unit,
  className,
  ref,
}: {
  unit: number | string;
  className?: string;
  ref?: RefObject<HTMLSelectElement>;
}) {
  "use client";
  const units = use(useContext(QuantityUnitContext) as Promise<QuantityUnit[]>);
  const unitsMap = units.reduce(toMap, {});
  return (
    <>
      {Number(unit) > 0 ? (
        <div
          className={clsx("cursor-pointer", unitClass, className)}
          onClick={() => ref?.current?.focus({ preventScroll: false })}
        >
          {unitsMap[unit].name}
        </div>
      ) : (
        <div
          className={clsx("cursor-pointer", "text-amber-700", className)}
          onClick={() => ref?.current?.focus({ preventScroll: false })}
        >
          ???
        </div>
      )}
    </>
  );
}
