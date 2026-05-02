"use client";

import { use, useActionState, useContext, useState } from "react";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
import { productAddSubmit } from "./product-add-submit";
import { parseWithZod } from "@conform-to/zod/v4";
import { createProductAddSchema } from "./product-add-schema";
import { Button } from "@/ui/button";
import { FormRow, FormColumn, FormLabel, FormField, FormErrors } from "@/ui/forms/form-utils";
import clsx from "clsx";
import { dateInputCommonStyles, inputCommonStyles, stockLabelOptions } from "@/lib/product-form-shared";
import { UnitForAmount } from "@/components/unit-for-amount";
import {
  Product,
  ProductLocation as PrLocation,
  ShoppingLocation,
  StockEntry,
  QuantityUnitConversion,
} from "@/interfaces/grocy";
import CustomisableSelect from "@/ui/customisable-select";
import { DueDateType, PurchasePriceType, StockLabelType } from "@/generated/prisma/enums";
import { LocationDropdown } from "@/ui/product/location-dropdown";
import { LocationContext } from "@/providers/location-context";
import { ShoppingLocationContext } from "@/providers/shopping-location-context";
import Link from "next/link";
import { GrocyConfigContext } from "@/providers/grocy-config-context";
import { ProductStockContext } from "@/providers/product-stock-context";
import { QuantityUnitConversionResolvedContext } from "@/providers/quantity-unit-conversion-resolved-context";
import { FieldSet, Legend } from "@/ui/forms/fieldset";
import { AmountPlusUnitSelectionAdd } from "@/ui/forms/amount-plus-unit-selection-add";
import { CaptureSubmitOnEnter } from "../capture-submit";

const unitTaggedLabelClass = clsx(); //"w-60 flex grow");

export function ProductAddForm({ code, product }: { code: string; product: Product }) {
  const stock = use(useContext(ProductStockContext) as Promise<StockEntry[]>);
  const conversions = use(
    useContext(QuantityUnitConversionResolvedContext) as Promise<QuantityUnitConversion[]>,
  );

  const schema = createProductAddSchema(product, stock, conversions);

  const [lastResult, action, submitPending] = useActionState(productAddSubmit, undefined);

  const grocyConfig = use(useContext(GrocyConfigContext) as Promise<Record<string, never>>);

  let purchasePriceType;
  switch (product.default_purchase_price_type) {
    default:
    case 1:
      purchasePriceType = PurchasePriceType.UNSPECIFIED;
      break;
    case 2:
      purchasePriceType = PurchasePriceType.UNIT_PRICE;
      break;
    case 3:
      purchasePriceType = PurchasePriceType.TOTAL_PRICE;
      break;
  }

  let stockLabelType;
  switch (product.default_stock_label_type) {
    default:
    case 0:
      stockLabelType = StockLabelType.NO_LABEL;
      break;
    case 1:
      stockLabelType = StockLabelType.SINGLE_LABEL;
      break;
    case 2:
      stockLabelType = StockLabelType.LABEL_PER_UNIT;
      break;
  }

  let dueDateType;
  switch (product.due_type) {
    default:
      dueDateType = DueDateType.NO_EXPIRY;
      break;
    case 1:
      dueDateType = DueDateType.BEST_BEFORE;
      break;
    case 2:
      dueDateType = DueDateType.EXPIRY_DATE;
      break;
  }

  const locations = use(useContext(LocationContext) as Promise<PrLocation[]>);
  const shoppingLocations = use(useContext(ShoppingLocationContext) as Promise<ShoppingLocation[]>);

  const [form, fields] = useForm({
    lastResult,

    defaultValue: {
      amount: "1",
      bestBeforeDate: "",
      price: "0",
      locationId: product.location_id,
      shoppingLocationId: "",
      stockLabelType: stockLabelType,
      note: undefined,
      dueDateType: dueDateType,
      purchasePriceType: purchasePriceType,
    },

    onValidate({ formData }) {
      return parseWithZod(formData, { schema: schema });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const [amountValue, setAmountValue] = useState<string>("1");

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
        <input {...getInputProps(fields.productId, { type: "hidden" })} value={product.id} />
        <input {...getInputProps(fields.barcode, { type: "hidden" })} value={code} />
        <input {...getInputProps(fields.dueDateType, { type: "hidden" })} />

        <FieldSet>
          <Legend className="text-add">Add / purchase</Legend>

          <FormRow comment="amount">
            <AmountPlusUnitSelectionAdd
              product={product}
              amountValue={amountValue}
              setAmountValue={setAmountValue}
            />
          </FormRow>

          <FormRow comment="price">
            <FormColumn className="inline w-full">
              <div className="w-72">
                <div className={`${unitTaggedLabelClass} flex`}>
                  <div>
                    <FormLabel
                      htmlFor={fields.price.name}
                      title="Price"
                      className="relative top-[-8] mb-0!"
                    />
                  </div>
                  <div className="flex grow flex-row text-right">
                    <div className="inline grow pr-1">
                      {fields.purchasePriceType.value === PurchasePriceType.TOTAL_PRICE ? (
                        <div className="inline-flex text-right">
                          {grocyConfig.CURRENCY}{" "}
                          {(Number(fields.price.value) / Number(fields.amount.value)).toFixed(2)}
                          {" per "}
                          <UnitForAmount
                            unit={product.qu_id_stock!}
                            title=""
                            className="flex h-5 pl-1.5 text-right text-sm"
                            plural={false}
                          />
                        </div>
                      ) : (
                        <div>
                          {grocyConfig.CURRENCY}{" "}
                          {(Number(fields.price.value) * Number(fields.amount.value)).toFixed(2)} total price
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <FormField className="flex flex-row gap-x-2">
                  <input
                    {...getInputProps(fields.price, {
                      type: "number",
                    })}
                    min={0}
                    step={0.01}
                    className={clsx(inputCommonStyles, "w-full")}
                    placeholder="Price"
                    onFocus={(e) => e.currentTarget.select()}
                    required
                  />
                  <CustomisableSelect
                    {...getInputProps(fields.purchasePriceType, {
                      type: "hidden",
                    })}
                    options={[
                      { value: PurchasePriceType.UNIT_PRICE, label: "per unit" },
                      { value: PurchasePriceType.TOTAL_PRICE, label: "total price" },
                    ]}
                    className="w-60"
                  />
                </FormField>
              </div>
              <FormErrors id={fields.price.errorId} errors={fields.price.errors} />
            </FormColumn>
          </FormRow>

          {product.default_best_before_days > -1 && (
            <FormRow comment="best_before_date">
              <FormColumn className="w-full flex-none">
                <div className="w-64">
                  <FormLabel
                    htmlFor={fields.bestBeforeDate.name}
                    title={product.due_type === 1 ? "Best before *" : "Expires at *"}
                  ></FormLabel>
                  <FormField>
                    <input
                      {...getInputProps(fields.bestBeforeDate, {
                        type: "date",
                      })}
                      required
                      onFocus={(e) => e.currentTarget.select()}
                      className={dateInputCommonStyles}
                    />
                  </FormField>
                </div>
                <FormErrors id={fields.bestBeforeDate.errorId} errors={fields.bestBeforeDate.errors} />
              </FormColumn>
            </FormRow>
          )}

          <FormRow comment="shoppingLocationId">
            <FormColumn className="w-full">
              <div className="w-full md:w-110">
                <FormLabel
                  htmlFor={fields.shoppingLocationId.name}
                  title={`Shop`}
                  className="inline-block"
                ></FormLabel>
                <FormField>
                  <LocationDropdown
                    {...getInputProps(fields.shoppingLocationId, {
                      type: "number",
                    })}
                    units={shoppingLocations}
                    className="w-full flex-2"
                    noFreezers={false}
                    allowEmpty={false}
                  />
                </FormField>
              </div>
              <FormErrors id={fields.shoppingLocationId.errorId} errors={fields.shoppingLocationId.errors} />
            </FormColumn>
          </FormRow>

          <FormRow comment="locationId">
            <FormColumn className="w-full">
              <div className="w-full md:w-110">
                <FormLabel
                  htmlFor={fields.locationId.name}
                  title={`Location`}
                  className="inline-block"
                ></FormLabel>
                <FormField>
                  <LocationDropdown
                    {...getInputProps(fields.locationId, {
                      type: "number",
                    })}
                    units={locations}
                    className="w-full flex-2"
                    noFreezers={product.should_not_be_frozen ? true : false}
                    allowEmpty={false}
                  />
                </FormField>
              </div>
              <FormErrors id={fields.locationId.errorId} errors={fields.locationId.errors} />
            </FormColumn>
          </FormRow>

          <FormRow comment="stockLabelType">
            <FormColumn className="w-full">
              <div className="w-full md:w-110">
                <FormLabel
                  htmlFor={fields.stockLabelType.name}
                  title={`Stock entry label`}
                  className="inline-block"
                ></FormLabel>
                <FormField>
                  <CustomisableSelect
                    {...getInputProps(fields.stockLabelType, {
                      type: "hidden",
                    })}
                    options={stockLabelOptions}
                    className="w-40"
                  />
                </FormField>
              </div>
              <FormErrors id={fields.stockLabelType.errorId} errors={fields.stockLabelType.errors} />
            </FormColumn>
          </FormRow>

          <FormRow comment="note">
            <FormColumn className="w-full md:w-110">
              <div className={`${unitTaggedLabelClass} flex`}>
                <FormLabel htmlFor={fields.note.name} title="Note" className="relative top-[-8] mb-0!" />
              </div>
              <FormField>
                <input
                  {...getInputProps(fields.note, {
                    type: "text",
                  })}
                  className={clsx(inputCommonStyles, "w-full")}
                />
              </FormField>
              <FormErrors id={fields.note.errorId} errors={fields.note.errors} />
            </FormColumn>
          </FormRow>

          <FormRow comment="Add product button">
            <FormColumn className="pt-3">
              <Button
                type="submit"
                className={clsx(inputCommonStyles, "cursor-pointer", "bg-add/50!", "border-add/90!")}
                disabled={submitPending}
              >
                Purchase
              </Button>
            </FormColumn>
            <FormColumn className="pt-5.5">
              <Link
                href={`/scan/${code}`}
                onClick={() => form.reset()}
                className={clsx(
                  inputCommonStyles,
                  "cursor-pointer",
                  "p-2.5!",
                  "rounded-lg",
                  "bg-form-cancel-button/30!",
                  "border-form-cancel-button/70!",
                )}
              >
                Cancel
              </Link>
            </FormColumn>
          </FormRow>
        </FieldSet>
      </form>
    </FormProvider>
  );
}
