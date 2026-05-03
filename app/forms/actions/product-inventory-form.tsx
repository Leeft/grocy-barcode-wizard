"use client";

import { use, useActionState, useContext, useState } from "react";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
import { productInventorySubmit } from "./product-inventory-submit";
import { parseWithZod } from "@conform-to/zod/v4";
import { createProductInventorySchema } from "./product-inventory-schema";
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
import { QuantityUnitConversionResolvedContext } from "@/providers/quantity-unit-conversion-resolved-context";
import { FieldSet, Legend } from "@/ui/forms/fieldset";
import { AmountPlusUnitSelectionAdd } from "@/ui/forms/amount-plus-unit-selection-add";
import { CaptureSubmitOnEnter } from "../capture-submit";

export function ProductInventoryForm({ code, product }: { code: string; product: Product }) {
  const conversions = use(
    useContext(QuantityUnitConversionResolvedContext) as Promise<QuantityUnitConversion[]>,
  );

  const schema = createProductInventorySchema(product, conversions);

  const [lastResult, action, submitPending] = useActionState(productInventorySubmit, undefined);

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

        <FieldSet>
          <Legend className="text-inventory">Inventory</Legend>

          <FormRow comment="amount">
            <AmountPlusUnitSelectionAdd
              product={product}
              amountValue={amountValue}
              setAmountValue={setAmountValue}
              title="New stock amount *"
            />
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

          <FormRow comment="price">
            <FormColumn className="w-full">
              <FormLabel htmlFor={fields.price.name} title="Price" className="relative top-[-8] mb-0!" />
              <FormField className="flex flex-row gap-x-2">
                <input
                  {...getInputProps(fields.price, {
                    type: "number",
                  })}
                  min={0}
                  step={0.01}
                  className={clsx(inputCommonStyles, "w-50")}
                  placeholder="Price"
                  onFocus={(e) => e.currentTarget.select()}
                  required
                />
              </FormField>
              <FormErrors id={fields.price.errorId} errors={fields.price.errors} />
            </FormColumn>
          </FormRow>

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
                  title={`Location *`}
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
              <div className={`flex`}>
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

          <FormRow comment="Inventory button">
            <FormColumn className="pt-3">
              <Button
                type="submit"
                className={clsx(
                  inputCommonStyles,
                  "cursor-pointer",
                  "bg-inventory/50!",
                  "border-inventory/90!",
                )}
                disabled={submitPending}
              >
                Update inventory
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
