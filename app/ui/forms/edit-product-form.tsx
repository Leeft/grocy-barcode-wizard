"use client";

import { use, useContext, useActionState, useState } from "react";
import { QuantityUnitsDropdown } from "@/ui/product/quantity-units-dropdown";
import { ProductLocation as PrLocation, Product, ProductGroup, QuantityUnit } from "@/interfaces/grocy";
import { QuantityUnitContext } from "@/providers/quantity-unit-context";
import { productUpdateSubmit } from "@/forms/product-form-submit";
import { Button } from "@/ui/button";
import { LocationContext } from "@/providers/location-context";
import { LocationDropdown } from "@/ui/product/location-dropdown";
import { CameraApp } from "@/ui/camera-app";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
import TooltipWrapper from "@/ui/tooltip-wrapper";
import { GetProduct } from "@/lib/product-db";
import clsx from "clsx";
import { inputCommonStyles } from "@/lib/product-form-shared";
import { DueDateType, UnitSystem } from "@/generated/prisma/enums";
import {
  FormContainer,
  FormCheckbox,
  FormColumn,
  FormErrors,
  FormField,
  FormLabel,
  FormRow,
  FormRowGroup,
} from "./form-utils";
import { ProductGroupDropdown } from "../product/product-group-dropdown";
import { ProductGroupContext } from "@/providers/product-group-context";
import { GrocyConfigContext } from "@/providers/grocy-config-context";
import { toLookup } from "@/lib/utils";
import UnitConversions from "@/lib/conversions";
import UnitConversionsEditor from "./unit-conversions-editor";
import CreateProductFields from "./create-product-fields";
import { ProductDropdown } from "../product/product-dropdown";
import { ProductContext } from "@/providers/product-context";
import Grocy from "@/components/icons/grocy";
import { UnitForAmount } from "@/components/unit-for-amount";
import { CaptureSubmitOnEnter } from "@/forms/capture-submit";
import { parseWithZod } from "@conform-to/zod/v4";
import { editProductFormSchema } from "@/forms/product-form-schema";

const unitTaggedLabelClass = clsx("w-60 flex grow");
const unitConversions = new UnitConversions();

function defaultsForForm(code: string, product: Promise<GetProduct>) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const data = use(product);

  const defaultValue = {
    intent: "update",
    id: data.id,
    name: data.name,
    barcode: code,
    shouldNotBeFrozen: !data.canBeFrozen || data.dueDateType === DueDateType.NO_EXPIRY ? "on" : null,
    unitSystem: data.unitSystem,
    unitAmount: data.unitAmount,
    unitId: data.unitChosen.toString(),
    defaultLocationId: data.defaultLocation.toString(),
    dueDateType: data.dueDateType,
    dueOrExpiryDate: data.expiresAt,
    packagingDate: data.packagingDate,
    dueDays: data.dueDays !== null ? data.dueDays.toString() : "",
    dueDaysAfterOpen: data.dueDaysAfterOpen !== null ? data.dueDaysAfterOpen.toString() : "",
    dueDaysAfterFreezing: data.dueDaysAfterFreezing !== null ? data.dueDaysAfterFreezing.toString() : "",
    dueDaysAfterThawing: data.dueDaysAfterThawing !== null ? data.dueDaysAfterThawing.toString() : "",
    productGroup: data.productGroup ?? 0,
    parentProductId: data.parentProductId ?? 0,
    defaultConsumeLocationId: data.consumeLocationId ?? 0,
    cantOpen: data.cantOpen,
    dontShowOnStock: data.dontShowOnStock,
    disableStockChecking: data.disableStockChecking,
    enableTareWeight: data.enableTareWeight,
    moveOnOpen: data.moveOnOpen,
    purchasePriceType: data.purchasePriceType ?? "UNSPECIFIED",
    tareWeight: data.tareWeight ?? 0,
    energy: data.energy ?? 0,
    quickConsumeAmount: data.quickConsumeAmount ?? 1,
    quickOpenAmount: data.quickOpenAmount ?? 1,
    defaultQuantityUnitPurchase: data.defaultQuantityUnitPurchase ?? data.unitChosen.toString(),
    defaultQuantityUnitConsume: data.defaultQuantityUnitConsume ?? data.unitChosen.toString(),
    quantityUnitPrices: data.quantityUnitPrices ?? data.unitChosen.toString(),
    purchaseConversionFactor: data.purchaseConversionFactor ?? 1,
    consumeConversionFactor: data.consumeConversionFactor ?? 1,
    priceConversionFactor: data.priceConversionFactor ?? 1,
    purchasePrice: data.purchasePrice,
    quantity: data.quantity,
    submitMode: "createInGrocy",
    notes: data.notes,

    energyCalculationHelper: 0,
    energyCalculatorOptions: "PER100G",
  };

  return defaultValue;
}

export function EditProductForm({ code, product }: { code: string; product: Promise<GetProduct> }) {
  const [lastResult, action, submitPending] = useActionState(productUpdateSubmit, undefined);

  const products = use(useContext(ProductContext) as Promise<Product[]>);
  const productNames: string[] = products.map((pr) => pr.name).filter((name) => name !== undefined);

  const [form, fields] = useForm({
    lastResult,

    defaultValue: defaultsForForm(code, product),

    onValidate({ formData }) {
      return parseWithZod(formData, { schema: editProductFormSchema(productNames) });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const [submitMode, setSubmitMode] = useState<"createInGrocy" | "updateOnly">("createInGrocy");

  const [selectedUnit, setSelectedUnit] = useState<string>(fields.unitId.value!);
  const [selectedPurchaseQuId, setSelectedPurchaseQuId] = useState<string>(
    fields.defaultQuantityUnitPurchase.value as string,
  );
  const [selectedConsumeQuId, setSelectedConsumeQuId] = useState<string>(
    fields.defaultQuantityUnitConsume.value as string,
  );
  const [selectedPriceQuId, setSelectedPriceQuId] = useState<string>(
    fields.quantityUnitPrices.value as string,
  );

  if (selectedPurchaseQuId !== selectedUnit) {
    unitConversions.trackConversion(selectedUnit, selectedPurchaseQuId, "PURCHASE");
  }

  if (selectedConsumeQuId !== selectedUnit) {
    unitConversions.trackConversion(selectedUnit, selectedConsumeQuId, "CONSUME");
  }

  if (selectedPriceQuId !== selectedUnit) {
    unitConversions.trackConversion(selectedUnit, selectedPriceQuId, "PRICE");
  }

  const units = use(useContext(QuantityUnitContext) as Promise<QuantityUnit[]>);
  const locations = use(useContext(LocationContext) as Promise<PrLocation[]>);
  const grocyConfig = use(useContext(GrocyConfigContext) as Promise<Record<string, never>>);
  const productGroups = use(useContext(ProductGroupContext) as Promise<ProductGroup[]>);

  const locationsMap = toLookup(locations);

  const awaitedProduct = use(product);
  const photo = awaitedProduct.productPhoto;

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
        <input {...getInputProps(fields.id, { type: "hidden" })} />
        <input {...getInputProps(fields.barcode, { type: "hidden" })} />
        <input {...getInputProps(fields.intent, { type: "hidden", value: false })} defaultValue="update" />
        <input
          {...getInputProps(fields.submitMode, { type: "hidden", value: false })}
          defaultValue={undefined}
          value={submitMode}
        />

        <div id={form.errorId}>{form.errors}</div>
        <div className="flex flex-col gap-y-5">
          <FormRow comment="Page header">
            <FormColumn className="flex-auto">
              <h1 className="inline-block text-lg font-bold text-slate-400 uppercase">
                Complete product capture
              </h1>
              <TooltipWrapper id="form-purpose-tooltip">
                This form completes the queued product capture to then configure the product in Grocy and add
                any stock as indicated.
                <br />
                <br />
                In case you need to make any changes, here is the data captured earlier. Plus you should enter
                more detailed data; so far we&apos;ve only grabbed the minimum required to create a basic
                product.
              </TooltipWrapper>
            </FormColumn>
          </FormRow>

          <FormContainer comment="Quick capture product fields">
            <CreateProductFields
              formId={form.id}
              fields={fields}
              selectedUnit={selectedUnit}
              setSelectedUnit={setSelectedUnit}
              unitConversions={unitConversions}
              selectedPurchaseQuId={selectedPurchaseQuId}
              setSelectedPurchaseQuId={setSelectedPurchaseQuId}
              selectedConsumeQuId={selectedConsumeQuId}
              setSelectedConsumeQuId={setSelectedConsumeQuId}
              selectedPriceQuId={selectedPriceQuId}
              setSelectedPriceQuId={setSelectedPriceQuId}
            />
          </FormContainer>

          <hr className="mt-4 mb-2 text-slate-500" />

          <FormRowGroup comment="Default quantity unit for purchase *">
            <FormRow>
              <FormLabel
                htmlFor={fields.defaultQuantityUnitPurchase.name}
                title="Default quantity unit purchase *"
              ></FormLabel>
            </FormRow>
            <FormRow comment="Quantity unit for purchase [fields]" className="gap-y-5">
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
                      unitConversions.trackConversion(fields.unitId.value!, e.currentTarget.value, "PURCHASE")
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
            <FormRow comment="Quantity unit for consume [fields]" className="gap-y-5">
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
                      unitConversions.trackConversion(fields.unitId.value!, e.currentTarget.value, "CONSUME")
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
              <FormLabel htmlFor={fields.quantityUnitPrices.name} title="Quantity unit for prices *" />
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
                      unitConversions.trackConversion(fields.unitId.value!, e.currentTarget.value, "PRICE")
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

          <FormContainer comment="Unit conversion for 'purchase'">
            <UnitConversionsEditor
              field={fields.purchaseConversionFactor}
              conversions={unitConversions}
              from={selectedUnit}
              to={selectedPurchaseQuId}
              toValue={fields.unitAmount.value}
              initialFactor={fields.purchaseConversionFactor.value ?? "1"}
              active={selectedPurchaseQuId !== selectedUnit}
            />
          </FormContainer>

          <FormContainer comment="Unit conversion for 'consume'">
            <UnitConversionsEditor
              field={fields.consumeConversionFactor}
              conversions={unitConversions}
              from={selectedUnit}
              to={selectedConsumeQuId}
              toValue={fields.unitAmount.value}
              initialFactor={fields.consumeConversionFactor.value ?? "1"}
              active={selectedConsumeQuId !== selectedPurchaseQuId}
            />
          </FormContainer>

          <FormContainer comment="Unit conversion for 'price tracking'">
            <UnitConversionsEditor
              field={fields.priceConversionFactor}
              conversions={unitConversions}
              from={selectedUnit}
              to={selectedPriceQuId}
              toValue={fields.unitAmount.value}
              initialFactor={fields.priceConversionFactor.value ?? "1"}
              active={selectedPriceQuId !== selectedConsumeQuId && selectedPriceQuId !== selectedPurchaseQuId}
            />
          </FormContainer>

          <hr className="mt-2 mb-2 text-slate-500" />

          <FormRow comment="Product group">
            <FormColumn className="w-full">
              <FormLabel
                htmlFor={fields.productGroup.name}
                title="Product group"
                className="w-full md:w-110"
              ></FormLabel>
              <FormField>
                <ProductGroupDropdown
                  {...getInputProps(fields.productGroup, { type: "number" })}
                  className="w-80"
                  insert={{ value: "0", label: "[no group]" }}
                  units={productGroups}
                />
              </FormField>
              <FormErrors id={fields.productGroup.errorId} errors={fields.productGroup.errors} />
            </FormColumn>
          </FormRow>

          <FormRow comment="Parent product">
            <FormColumn className="w-full">
              <FormLabel
                htmlFor={fields.parentProductId.name}
                title="Parent product"
                className="w-full"
              ></FormLabel>
              <FormField>
                <ProductDropdown
                  {...getInputProps(fields.parentProductId, { type: "number" })}
                  className="w-full md:w-110"
                  insert={{ value: "0", label: "[no parent]" }}
                  units={products}
                />
              </FormField>
              <FormErrors id={fields.parentProductId.errorId} errors={fields.parentProductId.errors} />
            </FormColumn>
          </FormRow>

          <FormRow comment='Default "Consume" location'>
            <FormColumn className="w-full">
              <FormLabel
                htmlFor={fields.defaultConsumeLocationId.name}
                title={`Default “consume” location`}
                className="inline-block"
              >
                <TooltipWrapper id="product-group-tooltip">
                  &ldquo;Quick consume&rdquo; actions will use any stock at this location first.
                </TooltipWrapper>
              </FormLabel>
              <FormField>
                <LocationDropdown
                  {...getInputProps(fields.defaultConsumeLocationId, {
                    type: "number",
                  })}
                  units={locations}
                  className="w-full flex-2 md:w-110"
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

          <FormRow comment="[ ] Can't be opened">
            <FormColumn>
              <div className="flex flex-col leading-7">
                <FormField>
                  <FormCheckbox fieldInfo={fields.cantOpen}>Can&apos;t be opened</FormCheckbox>
                </FormField>
                <FormErrors id={fields.cantOpen.errorId} errors={fields.cantOpen.errors} />
              </div>
            </FormColumn>
          </FormRow>

          <FormContainer comment="[ ] Move to location ... on 'open'">
            {fields.defaultConsumeLocationId.value !== undefined &&
              Number(fields.defaultConsumeLocationId.value) > 0 &&
              !fields.cantOpen.value && (
                <FormRow>
                  <FormColumn>
                    <div className="flex flex-col leading-7">
                      <FormField>
                        <FormCheckbox fieldInfo={fields.moveOnOpen}>
                          Move to “consume” location{" "}
                          <span className="text-location">
                            {locationsMap[fields.defaultConsumeLocationId.value]!.name}
                          </span>{" "}
                          on “open”
                          <TooltipWrapper id="move-on-open-tooltip">
                            When marking this product as &ldquo;open&rdquo; the configured amount will be
                            moved to the default consume location.
                          </TooltipWrapper>
                        </FormCheckbox>
                      </FormField>
                      <FormErrors id={fields.moveOnOpen.errorId} errors={fields.moveOnOpen.errors} />
                    </div>
                  </FormColumn>
                </FormRow>
              )}
          </FormContainer>

          <FormRow comment="[ ] Never show on stock overview">
            <FormColumn>
              <div className="flex flex-col leading-7">
                <FormField>
                  <FormCheckbox fieldInfo={fields.dontShowOnStock}>
                    Never show on stock overview
                    <TooltipWrapper id="do-not-show-on-stock-tooltip">
                      Hide from the stock overview irrespective of the stock status of this item.
                    </TooltipWrapper>
                  </FormCheckbox>
                </FormField>
                <FormErrors id={fields.dontShowOnStock.errorId} errors={fields.dontShowOnStock.errors} />
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
                      The default setting to use when adding the product as a recipe ingredient.
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

          <FormRowGroup comment="Tare weight configuration">
            {fields.unitSystem.value === UnitSystem.WEIGHT ? (
              <>
                <FormRow>
                  <FormColumn>
                    <div className="flex flex-col leading-7">
                      <FormField>
                        <FormCheckbox fieldInfo={fields.enableTareWeight}>
                          Enable tare weight handling
                          <TooltipWrapper id="enable-tare-weight-tooltip">
                            In tare weight mode you always have to measure the total quantity of your stock
                            including the weight of the container, and you provide the weight of the container
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

                {fields.enableTareWeight.value !== undefined && fields.enableTareWeight.value ? (
                  <FormRow>
                    <FormColumn className="grow">
                      <div className={`${unitTaggedLabelClass} mb-2 h-5`}>
                        <FormLabel
                          htmlFor={fields.tareWeight.name}
                          title="Tare weight"
                          className="relative top-[-8]"
                        ></FormLabel>
                        <UnitForAmount unit={fields.unitId.value!} className="grow text-right" />
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
                      <FormErrors id={fields.tareWeight.errorId} errors={fields.tareWeight.errors} />
                    </FormColumn>
                  </FormRow>
                ) : (
                  <input
                    {...getInputProps(fields.tareWeight, {
                      type: "hidden",
                    })}
                    defaultValue={0}
                  />
                )}
              </>
            ) : (
              <input
                {...getInputProps(fields.tareWeight, {
                  type: "hidden",
                })}
                defaultValue={0}
              />
            )}
          </FormRowGroup>

          <FormRow comment="Energy">
            <FormColumn className="w-60">
              <div className={`${unitTaggedLabelClass} mb-2 h-5`}>
                <FormLabel htmlFor={fields.energy.name} title="Energy" className="relative top-[-8]" />
                <div className="grow text-right text-nowrap text-slate-400">
                  <div
                    title="This value is obtained from Grocy, you can change it there"
                    className={clsx(
                      "text-nowrap",
                      "inline-block",
                      "cursor-help",
                      !grocyConfig && "text-form-error",
                    )}
                  >
                    {grocyConfig && grocyConfig.ENERGY_UNIT ? grocyConfig.ENERGY_UNIT : "??"}
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
                  placeholder={`Energy per stock quantity`}
                  className={clsx(inputCommonStyles)}
                />
                &nbsp;
              </FormField>
              <FormErrors id={fields.energy.errorId} errors={fields.energy.errors} />
            </FormColumn>
          </FormRow>

          <FormContainer comment="Quick open amount">
            {!fields.cantOpen.value ? (
              <FormRow comment="Quick open amount">
                <FormColumn className="grow">
                  <div className={`${unitTaggedLabelClass} mb-2 h-5`}>
                    <FormLabel
                      htmlFor={fields.quickOpenAmount.name}
                      title="Quick open amount"
                      className="relative top-[-8]"
                    />
                    <UnitForAmount unit={fields.unitId.value!} className="h-5 grow text-right text-sm" />
                  </div>
                  <FormField>
                    <input
                      {...getInputProps(fields.quickOpenAmount, { type: "number" })}
                      min={0.001}
                      max={10000}
                      step={0.001}
                      placeholder="Number"
                      className={clsx(inputCommonStyles)}
                    />
                  </FormField>
                  <FormErrors id={fields.quickOpenAmount.errorId} errors={fields.quickOpenAmount.errors} />
                </FormColumn>
              </FormRow>
            ) : (
              <input {...getInputProps(fields.quickOpenAmount, { type: "hidden" })} value="1" />
            )}
          </FormContainer>

          <CameraApp photo={photo} />

          <FormRow comment="Create product submit button" className="gap-y-5">
            <FormColumn className="shrink">
              <Button
                type="submit"
                className={clsx(
                  "border-create-product-button/70",
                  "bg-create-product-button/20",
                  "text-create-product-button",
                )}
                onClick={() => setSubmitMode("createInGrocy")}
                disabled={submitPending}
              >
                <Grocy className="ml-[-3] w-8 fill-[#e99629] stroke-[#191902] pr-2 pl-0" />
                Create product in Grocy
              </Button>
            </FormColumn>
            <FormColumn className="shrink">
              <Button
                type="submit"
                className={clsx(
                  "border-update-queue-button/70!",
                  "bg-update-queue-button/20",
                  "text-update-queue-button",
                )}
                onClick={() => setSubmitMode("updateOnly")}
                disabled={submitPending}
              >
                Update local only
              </Button>
            </FormColumn>
          </FormRow>
        </div>
      </form>
    </FormProvider>
  );
}
