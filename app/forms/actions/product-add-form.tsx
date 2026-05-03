"use client";

import { use, useActionState, useContext, useState } from "react";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
import { productAddSubmit } from "./product-add-submit";
import { parseWithZod } from "@conform-to/zod/v4";
import { createProductAddSchema } from "./product-add-schema";
import { FormRow, FormColumn, FormLabel, FormField, FormErrors } from "@/ui/forms/form-utils";
import clsx from "clsx";
import { inputCommonStyles } from "@/lib/product-form-shared";
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
import { GrocyConfigContext } from "@/providers/grocy-config-context";
import { ProductStockContext } from "@/providers/product-stock-context";
import { QuantityUnitConversionResolvedContext } from "@/providers/quantity-unit-conversion-resolved-context";
import { FieldSet, Legend } from "@/ui/forms/fieldset";
import { AmountPlusUnitSelectionAdd } from "@/ui/forms/amount-plus-unit-selection-add";
import { CaptureSubmitOnEnter } from "../capture-submit";
import { ActionFormCancel } from "./components/action-form-cancel";
import { ActionFormSubmit } from "./components/action-form-submit";
import { ActionFormStockLabelType } from "./components/action-form-stock-label-type";
import { ActionFormNote } from "./components/action-form-note";

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
                <div className={`flex`}>
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
                      className={inputCommonStyles}
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
            <ActionFormStockLabelType field={fields.stockLabelType} />
          </FormRow>

          <FormRow comment="note">
            <ActionFormNote field={fields.note} />
          </FormRow>

          <FormRow comment="Add product button">
            <ActionFormSubmit className="bg-add/50! border-add/90!" pending={submitPending}>
              Purchase
            </ActionFormSubmit>
            <ActionFormCancel code={code} onClick={() => form.reset()}>
              Cancel
            </ActionFormCancel>
          </FormRow>
        </FieldSet>
      </form>
    </FormProvider>
  );
}
