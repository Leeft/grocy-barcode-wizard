"use client";

import { use, useActionState, useContext } from "react";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
import { productAddSubmit } from "./product-add-submit";
import { parseWithZod } from "@conform-to/zod/v4";
import { FormRow, FormColumn, FormLabel, FormField, FormErrors } from "@/ui/forms/form-utils";
import { clsx } from "clsx";
import { inputCommonStyles } from "@/lib/product-form-shared";
import { UnitForAmount } from "@/components/unit-for-amount";
import {
  Product,
  ProductLocation as PrLocation,
  ShoppingLocation,
  grocyAsPurchasePriceType,
  grocyAsStockLabelType,
  grocyAsDueType,
} from "@/interfaces/grocy";
import CustomisableSelect from "@/ui/customisable-select";
import { PurchasePriceType } from "@/generated/prisma/enums";
import { LocationDropdown } from "@/ui/product/location-dropdown";
import { LocationContext } from "@/providers/location-context";
import { ShoppingLocationContext } from "@/providers/shopping-location-context";
import { GrocyConfigContext } from "@/providers/grocy-config-context";
import { FieldSet, Legend } from "@/ui/forms/fieldset";
import { AmountPlusUnitSelectionAdd } from "@/ui/forms/amount-plus-unit-selection-add";
import { CaptureSubmitOnEnter } from "../capture-submit";
import { ActionFormCancel } from "./components/action-form-cancel";
import { ActionFormSubmit } from "./components/action-form-submit";
import { ActionFormStockLabelType } from "./components/action-form-stock-label-type";
import { ActionFormNote } from "./components/action-form-note";
import { ProductAddSchema } from "../action-form-schemas";
import { withCallbacks } from "@/interfaces";
import { createToastCallbacks } from "@/utils/action-state-callback/toast-callback";

export function ProductAddForm({ code, product }: { code: string; product: Product }) {
  const [lastResult, action, submitPending] = useActionState(
    withCallbacks(
      productAddSubmit,
      createToastCallbacks({
        loadingMessage: "Purchasing stock in Grocy ...",
      }),
    ),
    undefined,
  );

  const grocyConfig = use(useContext(GrocyConfigContext) as Promise<Record<string, never>>);
  const locations = use(useContext(LocationContext) as Promise<PrLocation[]>);
  const shoppingLocations = use(useContext(ShoppingLocationContext) as Promise<ShoppingLocation[]>);

  const [form, fields] = useForm({
    lastResult,

    defaultValue: {
      base: {
        barcode: code,
        productId: product.id,
      },
      amount: {
        amount: "1",
        amountShadow: "1",
        amountQuantityUnitId: product.qu_id_stock,
        maximumAmount: "10000",
      },
      bestBeforeDate: "",
      price: "0",
      locationId: product.location_id,
      shoppingLocationId: "",
      stockLabelType: grocyAsStockLabelType(product.default_stock_label_type),
      note: undefined,
      dueDateType: grocyAsDueType(product.due_type),
      purchasePriceType: grocyAsPurchasePriceType(product.default_purchase_price_type),
    },

    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ProductAddSchema });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const priceValue = Number(fields.price.value);
  const amountValue = Number(fields.amount.getFieldset().amount.value);
  let total = priceValue * amountValue;
  let perUnit = priceValue / amountValue;
  if (isNaN(total)) total = 0;
  if (isNaN(perUnit)) perUnit = 0;

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
        <input {...getInputProps(fields.base.getFieldset().productId, { type: "hidden" })} />
        <input {...getInputProps(fields.base.getFieldset().barcode, { type: "hidden" })} />
        <input {...getInputProps(fields.dueDateType, { type: "hidden" })} />

        <FieldSet>
          <Legend className="text-add">Add / purchase</Legend>

          <FormRow comment="amount">
            <AmountPlusUnitSelectionAdd product={product} title="Amount to add *" />
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
                    <div className="inline grow pr-1 text-form-label">
                      {fields.purchasePriceType.value === PurchasePriceType.TOTAL_PRICE ? (
                        <div className="inline-flex text-right">
                          {grocyConfig.CURRENCY} {perUnit.toFixed(2)}
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
                          {grocyConfig.CURRENCY} {total.toFixed(2)} total price
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
