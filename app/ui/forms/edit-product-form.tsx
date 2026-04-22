"use client";

import {
  use,
  useContext,
  KeyboardEvent,
  useActionState,
  useRef,
  RefObject,
  useState,
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
import {
  ModeToQuantityTitle,
  ModeToUnitTitle,
} from "@/ui/product/unit-mode-dropdown";
import { CameraApp } from "@/ui/camera-app";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
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
  FormErrors,
  FormField,
  FormLabel,
  FormRow,
  FormRowGroup,
  PackagingDateTooltip,
  ShouldNotBeFrozenTooltip,
  WeightModeAmountTooltip,
  WeightModeTooltip,
} from "./form-utils";
import { ProductGroupDropdown } from "../product/product-group-dropdown";
import { ProductGroupContext } from "@/providers/product-group-context";
import { dateToISODate } from "@/lib/date";
import { GrocyConfigContext } from "@/providers/grocy-config-context";
import { toMap } from "@/lib/utils";
import UnitConversions, {
  ConversionSource,
  UnitConversion,
} from "@/lib/conversions";
import UnitConversionsEditor from "./unit-conversions-editor";
import { useInputControl } from "@conform-to/react";

const unitClass = "text-green-200!";
const unitTaggedLabelClass = clsx("w-60 flex grow");
const unitConversions = new UnitConversions();

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
      defaultQuantityUnitPurchase: productData.unitChosen.toString(),
      defaultQuantityUnitConsume: productData.unitChosen.toString(),
      quantityUnitPrices: productData.unitChosen.toString(),
      purchaseConversionFactor: 1,
      consumeConversionFactor: 1,
      priceConversionFactor: 1,
    },

    // Reuse the validation logic on the client
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EditProductFormSchema });
    },

    // Validate the form on blur event triggered
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const unitIdRef = useRef<HTMLSelectElement>(null);
  const unitIdControl = useInputControl(fields.unitId);
  const unitAmountRef = useRef<HTMLInputElement>(null);
  const unitAmountControl = useInputControl(fields.unitAmount);

  const [selectedUnit, setSelectedUnit] = useState<string>(
    fields.unitId.value!,
  );
  const [selectedPurchaseQuId, setSelectedPurchaseQuId] = useState<string>(
    fields.defaultQuantityUnitPurchase.value as string,
  );
  const [selectedConsumeQuId, setSelectedConsumeQuId] = useState<string>(
    fields.defaultQuantityUnitConsume.value as string,
  );
  const [selectedPriceQuId, setSelectedPriceQuId] = useState<string>(
    fields.quantityUnitPrices.value as string,
  );

  const trackConversion = ({
    from,
    to,
    source,
  }: {
    from: string;
    to: string;
    source: ConversionSource;
  }) => {
    //console.log("trackConversion", from, to, source);
    if (from === undefined || to === undefined) return;
    const conversion = new UnitConversion({
      from_qu_id: from,
      to_qu_id: to,
      factor: 1.0,
      for: source,
    });
    unitConversions.track(conversion);
  };

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
  };

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
        <input {...getInputProps(fields.id, { type: "hidden" })} />
        <input {...getInputProps(fields.barcode, { type: "hidden" })} />
        <div id={form.errorId}>{form.errors}</div>
        <div className="mr-2 flex flex-col gap-y-5">
          <FormRow comment="Page header">
            <FormColumn className="flex-auto">
              <h1 className="inline-block text-lg font-bold text-slate-400 uppercase">
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
            </FormColumn>
          </FormRow>

          <FormRow comment="Product name">
            <FormColumn>
              <FormLabel htmlFor={fields.name.name} title="Product name *" />
              <FormField>
                <input
                  {...getInputProps(fields.name, { type: "text" })}
                  placeholder="Name of the product to create, 2 to 128 characters long"
                  className={clsx(inputCommonStyles, "w-full")}
                />
              </FormField>
              <FormErrors
                id={fields.name.errorId}
                errors={fields.name.errors}
              />
            </FormColumn>
          </FormRow>

          <FormRow comment="[ ] Should not be frozen">
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

          <FormRow className="flex-wrap" comment="Unit system configuration">
            <FormColumn className="w-50" comment="Unit system">
              <FormLabel
                htmlFor="unitSystem"
                title="Stock unit system *"
                className="inline-block"
              >
                <WeightModeTooltip />
              </FormLabel>
              <FormField>
                <CustomisableSelect
                  {...getInputProps(fields.unitSystem, { type: "number" })}
                  required
                  className="w-full"
                  options={unitSystemOptions}
                  onChange={() => {
                    unitIdControl.change("");
                    unitAmountControl.change("1.0");
                  }}
                />
              </FormField>
              <FormErrors
                id={fields.unitSystem.errorId}
                errors={fields.unitSystem.errors}
              />
            </FormColumn>

            {fields.unitSystem.value !== "ABSTRACT" ? (
              <FormColumn className="w-34" comment="Unit amount">
                <FormLabel
                  htmlFor={fields.unitAmount.name}
                  title={ModeToQuantityTitle(fields.unitSystem?.value)}
                  className="inline-block"
                >
                  <WeightModeAmountTooltip />
                </FormLabel>
                <FormField>
                  <input
                    {...getInputProps(fields.unitAmount, { type: "number" })}
                    ref={unitAmountRef}
                    step={0.001}
                    placeholder="Number"
                    className={clsx(
                      "hide-arrows",
                      inputCommonStyles,
                      "w-full",
                      unitClass,
                    )}
                  />
                </FormField>
                <FormErrors
                  id={fields.unitAmount.errorId}
                  errors={fields.unitAmount.errors}
                />
              </FormColumn>
            ) : (
              <input
                {...getInputProps(fields.unitAmount, { type: "hidden" })}
                step={1}
                min={1}
                max={1}
                defaultValue={1}
                required
                readOnly
              />
            )}

            <FormColumn className="min-w-50" comment="Unit id">
              <FormLabel
                htmlFor={fields.unitId.name}
                title={ModeToUnitTitle(fields.unitSystem?.value)}
                className={`text-sm! ${unitClass}!`}
              ></FormLabel>
              <FormField className="w-min-30 flex grow">
                {fields.unitSystem.value === "ABSTRACT" && (
                  <div className="text-md shrink p-2 pl-0 font-bold text-green-200">
                    1
                  </div>
                )}
                <QuantityUnitsDropdown
                  ref={unitIdRef as RefObject<HTMLSelectElement>}
                  field={fields.unitId}
                  units={units}
                  unitSystem={fields.unitSystem.value as UnitSystem}
                  className={clsx("w-full", unitClass)}
                  selectedOption={selectedUnit!}
                  setSelectedOption={setSelectedUnit}
                  onChange={(e) => {
                    const id = e.currentTarget.value;
                    unitConversions.untrack(
                      selectedPurchaseQuId,
                      fields.unitId.value,
                    );
                    unitConversions.untrack(
                      selectedConsumeQuId,
                      fields.unitId.value,
                    );
                    unitConversions.untrack(
                      selectedPriceQuId,
                      fields.unitId.value,
                    );
                    setSelectedPurchaseQuId(id);
                    setSelectedConsumeQuId(id);
                    setSelectedPriceQuId(id);
                    trackConversion({
                      from: id,
                      to: id,
                      source: "PURCHASE",
                    });
                  }}
                />
              </FormField>
              <FormErrors
                className="grow"
                id={fields.unitId.errorId}
                errors={fields.unitId.errors}
              />
            </FormColumn>
          </FormRow>

          <FormRow comment="Initial product location">
            <FormColumn className="w-80">
              <FormLabel
                htmlFor={fields.defaultLocationId.name}
                title="Initial product location *"
              ></FormLabel>
              <FormField>
                <LocationDropdown
                  {...getInputProps(fields.defaultLocationId, {
                    type: "number",
                  })}
                  units={locations}
                  className="w-full"
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

          <FormRow comment="Due date type and expiry" className="gap-y-5">
            <FormColumn className="flex-none">
              <FormLabel
                htmlFor={fields.dueDateType.name}
                title="Due date type *"
              ></FormLabel>
              <FormField>
                <CustomisableSelect
                  {...getInputProps(fields.dueDateType, { type: "hidden" })}
                  options={dueDateTypeOptions}
                  className="w-46"
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
                    className="inline-block"
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

          <FormRowGroup comment="Default due days rows">
            {fields.dueDateType.value !== DueDateType.NO_EXPIRY && (
              <FormRow
                className="flex-col gap-y-5"
                comment="Default due days * configuration"
              >
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
          </FormRowGroup>

          <hr className="mt-0 mb-2 text-slate-500" />

          <FormRow comment="Product group">
            <FormColumn className="w-full">
              <FormLabel
                htmlFor={fields.productGroup.name}
                title="Product group"
                className="w-full"
              ></FormLabel>
              <FormField>
                <ProductGroupDropdown
                  {...getInputProps(fields.productGroup, { type: "number" })}
                  className="w-80"
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

          <FormRowGroup comment="Default quantity unit for purchase *">
            <FormRow>
              <FormLabel
                htmlFor={fields.defaultQuantityUnitPurchase.name}
                title="Default quantity unit purchase *"
              ></FormLabel>
            </FormRow>
            <FormRow
              comment="Quantity unit for purchase [fields]"
              className="gap-y-5"
            >
              <FormColumn className="w-37">
                <FormField>
                  <QuantityUnitsDropdown
                    field={fields.defaultQuantityUnitPurchase}
                    units={units}
                    unitSystem={fields.unitSystem.value as UnitSystem}
                    allOptions
                    className="w-full"
                    required
                    selectedOption={selectedPurchaseQuId}
                    setSelectedOption={setSelectedPurchaseQuId}
                    onChange={(e) =>
                      trackConversion({
                        from: fields.unitId.value!,
                        to: e.currentTarget.value,
                        source: "PURCHASE",
                      })
                    }
                  />
                </FormField>
                <FormErrors
                  id={fields.defaultQuantityUnitPurchase.errorId}
                  errors={fields.defaultQuantityUnitPurchase.errors}
                />
              </FormColumn>
            </FormRow>
          </FormRowGroup>

          <FormRowGroup comment="By default, “consume” will consume this quantity: ...">
            <FormRow>
              <FormLabel
                htmlFor={fields.quickConsumeAmount.name}
                className="w-full flex-col"
                title="By default, “consume” will consume this quantity: *"
              />
            </FormRow>
            <FormRow
              comment="Quantity unit for consume [fields]"
              className="gap-y-5"
            >
              <FormColumn className="w-20">
                <FormField>
                  <input
                    {...getInputProps(fields.quickConsumeAmount, {
                      type: "number",
                    })}
                    min={0}
                    step={0.01}
                    placeholder="Number"
                    className={clsx(inputCommonStyles, "w-full")}
                  />
                </FormField>
                <FormErrors
                  id={fields.quickConsumeAmount.errorId}
                  errors={fields.quickConsumeAmount.errors}
                />
              </FormColumn>
              <FormColumn className="w-37">
                <FormField>
                  <QuantityUnitsDropdown
                    field={fields.defaultQuantityUnitConsume}
                    units={units}
                    unitSystem={fields.unitSystem.value as UnitSystem}
                    allOptions
                    className="w-full"
                    selectedOption={selectedConsumeQuId}
                    setSelectedOption={setSelectedConsumeQuId}
                    onChange={(e) =>
                      trackConversion({
                        from: fields.unitId.value!,
                        to: e.currentTarget.value,
                        source: "CONSUME",
                      })
                    }
                    required
                  />
                </FormField>
                <FormErrors
                  id={fields.defaultQuantityUnitConsume.errorId}
                  errors={fields.defaultQuantityUnitConsume.errors}
                />
              </FormColumn>
            </FormRow>
          </FormRowGroup>

          <FormRowGroup comment="Quantity unit for prices">
            <FormRow>
              <FormLabel
                htmlFor={fields.quantityUnitPrices.name}
                title="Quantity unit for prices *"
              />
            </FormRow>
            <FormRow comment="Quantity unit for prices">
              <FormColumn className="w-37">
                <FormField>
                  <QuantityUnitsDropdown
                    field={fields.quantityUnitPrices}
                    units={units}
                    unitSystem={fields.unitSystem.value as UnitSystem}
                    allOptions
                    className="w-full"
                    selectedOption={selectedPriceQuId.toString()!}
                    setSelectedOption={setSelectedPriceQuId}
                    onChange={(e) =>
                      trackConversion({
                        from: fields.unitId.value!,
                        to: e.currentTarget.value,
                        source: "PRICE",
                      })
                    }
                    required
                  />
                </FormField>
                <FormErrors
                  id={fields.quantityUnitPrices.errorId}
                  errors={fields.quantityUnitPrices.errors}
                />
              </FormColumn>
            </FormRow>
          </FormRowGroup>

          <UnitConversionsEditor
            conversions={unitConversions}
            unitSystem={fields.unitSystem.value as UnitSystem}
            from={selectedUnit}
            to={selectedPurchaseQuId}
            toValue={fields.unitAmount.value}
          />

          {selectedConsumeQuId !== selectedPurchaseQuId && (
            <UnitConversionsEditor
              conversions={unitConversions}
              unitSystem={fields.unitSystem.value as UnitSystem}
              from={selectedUnit}
              to={selectedConsumeQuId}
              toValue={fields.unitAmount.value}
            />
          )}

          {selectedPriceQuId !== selectedConsumeQuId &&
            selectedPriceQuId !== selectedPurchaseQuId && (
              <UnitConversionsEditor
                conversions={unitConversions}
                unitSystem={fields.unitSystem.value as UnitSystem}
                from={selectedUnit}
                to={selectedPriceQuId}
                toValue={fields.unitAmount.value}
              />
            )}

          <hr className="mt-2 mb-2 text-slate-500" />

          <FormRow comment="[ ] Can't be opened">
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

          <FormRow comment="[ ] Never show on stock overview">
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

          <FormRow comment="[ ] Can't purchase these products">
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
                      You should probably only use this on a parent product
                      which is used to group and aggregate other products.
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

          <FormRow comment="[ ] Disable stock fulfillment checking for this ingredient">
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

          <FormRow comment='Default "Consume" location'>
            <FormColumn className="w-120">
              <FormLabel
                htmlFor={fields.defaultConsumeLocationId.name}
                title={`Default “consume” location`}
                className="inline-block"
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

          <FormRowGroup comment="[ ] Move to location ... on 'open'">
            {fields.defaultConsumeLocationId.value !== undefined &&
              Number(fields.defaultConsumeLocationId.value) > 0 &&
              !fields.cantOpen.value && (
                <FormRow>
                  <FormColumn>
                    <div className="flex flex-col leading-7">
                      <FormField>
                        <FormCheckbox fieldInfo={fields.moveOnOpen}>
                          Move to “consume” location{" "}
                          <span className="text-amber-200">
                            {
                              locationsMap[
                                Number(fields.defaultConsumeLocationId.value)
                              ]!.name
                            }
                          </span>{" "}
                          on “open”
                          <TooltipWrapper id="move-on-open-tooltip">
                            When marking this product as &ldquo;open&rdquo; the
                            configured amount will be moved to the default
                            consume location.
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
          </FormRowGroup>

          {fields.unitSystem.value === UnitSystem.WEIGHT && (
            <>
              <FormRow>
                <FormColumn>
                  <div className="flex flex-col leading-7">
                    <FormField>
                      <FormCheckbox fieldInfo={fields.enableTareWeight}>
                        Enable tare weight handling
                        <TooltipWrapper id="enable-tare-weight-tooltip">
                          In tare weight mode you always have to measure the
                          total quantity of your stock including the weight of
                          the container, and you provide the weight of the
                          container here.
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
                      <div className={`${unitTaggedLabelClass} mb-2 h-5`}>
                        <FormLabel
                          htmlFor={fields.tareWeight.name}
                          title="Tare weight"
                          className="relative top-[-8]"
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
                          className={clsx(inputCommonStyles)}
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

          <FormRow comment="Energy">
            <FormColumn className="grow">
              <div className={`${unitTaggedLabelClass} mb-2 h-5`}>
                <FormLabel
                  htmlFor={fields.energy.name}
                  title="Energy"
                  className="relative top-[-8]"
                />
                <div className="grow text-right text-nowrap text-slate-400">
                  <div
                    className={clsx(
                      "text-nowrap",
                      "inline-block",
                      !grocyConfig && "text-amber-700",
                    )}
                  >
                    {grocyConfig && grocyConfig.ENERGY_UNIT
                      ? grocyConfig.ENERGY_UNIT
                      : "??"}
                  </div>
                  &nbsp;/&nbsp;
                  <UnitForAmount
                    unit={fields.unitId.value!}
                    className="inline"
                  />
                </div>
              </div>
              <FormField>
                <input
                  {...getInputProps(fields.energy, { type: "number" })}
                  min={0}
                  step={0.001}
                  placeholder={`Energy per TODO`}
                  className={clsx(inputCommonStyles)}
                />
              </FormField>
              <FormErrors
                id={fields.energy.errorId}
                errors={fields.energy.errors}
              />
            </FormColumn>
          </FormRow>

          <FormRow comment="Quick open amount">
            <FormColumn className="grow">
              <div className={`${unitTaggedLabelClass} mb-2 h-5`}>
                <FormLabel
                  htmlFor={fields.quickOpenAmount.name}
                  title="Quick open amount"
                  className="relative top-[-8]"
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
                    // "hide-arrows",
                    // "peer",
                    // "w-30",
                    inputCommonStyles,
                    // "rounded-md!",
                  )}
                />
              </FormField>
              <FormErrors
                id={fields.quickOpenAmount.errorId}
                errors={fields.quickOpenAmount.errors}
              />
            </FormColumn>
          </FormRow>

          <FormRow comment="Default purchase price type">
            <FormColumn className="w-full">
              <FormLabel
                htmlFor={fields.purchasePriceType.name}
                title="Default purchase price type"
              ></FormLabel>
              <FormField>
                <CustomisableSelect
                  {...getInputProps(fields.purchasePriceType, {
                    type: "hidden",
                  })}
                  options={purchasePriceOptions}
                  className="w-40"
                />
              </FormField>
              <FormErrors
                id={fields.purchasePriceType.errorId}
                errors={fields.purchasePriceType.errors}
              />
            </FormColumn>
          </FormRow>

          <CameraApp />

          <FormRow comment="Create product submit button">
            <FormColumn>
              <Button type="submit" disabled={submitPending}>
                Create product
              </Button>
            </FormColumn>
          </FormRow>
        </div>
      </form>
    </FormProvider>
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
