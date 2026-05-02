"use client";

import clsx from "clsx";
import Link from "next/link";
import { use, useActionState, useContext, useState } from "react";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Button } from "@/ui/button";
import { FormRow, FormColumn, FormLabel, FormField, FormErrors, FormCheckbox } from "@/ui/forms/form-utils";
import {
  Product,
  ProductLocation as PrLocation,
  StockEntry,
  QuantityUnitConversion,
} from "@/interfaces/grocy";
import { LocationDropdown } from "@/ui/product/location-dropdown";
import { LocationContext } from "@/providers/location-context";
import { createProductConsumeSchema } from "./product-consume-schema";
import { productConsumeSubmit } from "./product-consume-submit";
import { ProductStockContext } from "@/providers/product-stock-context";
import { AmountPlusUnitSelection } from "@/ui/forms/amount-plus-unit-selection";
import { Trash2 } from "lucide-react";
import TooltipWrapper from "@/ui/tooltip-wrapper";
import { FieldSet, Legend } from "@/ui/forms/fieldset";
import { QuantityUnitConversionResolvedContext } from "@/providers/quantity-unit-conversion-resolved-context";
import { CaptureSubmitOnEnter } from "../capture-submit";
import { inputCommonStyles } from "@/lib/product-form-shared";

export function ProductConsumeForm({
  code,
  product,
  query,
}: {
  code: string;
  product: Product;
  query: Record<string, string | string[] | undefined>;
}) {
  const stock = use(useContext(ProductStockContext) as Promise<StockEntry[]>);
  const conversions = use(
    useContext(QuantityUnitConversionResolvedContext) as Promise<QuantityUnitConversion[]>,
  );

  const schema = createProductConsumeSchema(product, stock, conversions);

  const [lastResult, action, submitPending] = useActionState(productConsumeSubmit, undefined);

  // Array of unique location_id's from the stock entries for this product
  const locationsFromStock = [
    ...new Set(stock.filter((item) => item.location_id !== undefined).map((item) => item.location_id)),
  ];

  // Just the locations that have any stock, with the product default marked as default
  // which is used to present the dropdown of which stock entry to use for this action
  const stockLocations = use(useContext(LocationContext) as Promise<PrLocation[]>)
    .filter((item) => locationsFromStock.indexOf(item.id) > -1)
    .map((item) => {
      return {
        id: item.id,
        name: item.id === product.default_consume_location_id ? item.name + " (Default location)" : item.name,
      };
    });

  const consumeLocationId: string =
    product.default_consume_location_id !== undefined &&
    locationsFromStock.indexOf(product.default_consume_location_id) > -1
      ? product.default_consume_location_id.toString()
      : "0";

  const [form, fields] = useForm({
    lastResult,

    defaultValue: {
      barcode: code,
      productId: product.id,
      amount: "1",
      amountShadow: "1",
      amountQuantityUnitId: product.qu_id_stock,
      locationId: consumeLocationId,
      //recipeId: "", // TODO
      exactAmount: true,
      allowSubproductSubstitution: true,
      spoiled: query.spoiled === "true" ? true : false,
      stockEntryId: undefined,
    },

    onValidate({ formData }) {
      return parseWithZod(formData, { schema: schema });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  // The location where to "consume from"
  const [fromLocation, setFromLocation] = useState<string>(consumeLocationId!);

  // Just the stock entries that apply to the current "consume from location"
  const [stockFromLocation, setStockFromLocation] = useState<StockEntry[]>(
    stock.filter((se) => se.location_id === Number(fromLocation)),
  );

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
        <input {...getInputProps(fields.productId, { type: "hidden" })} />
        <input {...getInputProps(fields.barcode, { type: "hidden" })} />

        <FieldSet>
          <Legend className={fields.spoiled.value ? "text-spoiled" : "text-consume"}>
            {fields.spoiled.value ? "Spoiled" : "Consume"}
          </Legend>

          <FormRow comment="locationId">
            <FormColumn className="w-full">
              <div className="w-full md:w-110">
                <FormLabel
                  htmlFor={fields.locationId.name}
                  title={`Consume from location`}
                  className="inline-block"
                ></FormLabel>
                <FormField>
                  <LocationDropdown
                    {...getInputProps(fields.locationId, {
                      type: "number",
                      value: false,
                    })}
                    units={stockLocations}
                    firstOption={{ value: "0", label: "Pick ..." }}
                    value={fromLocation}
                    className="w-full flex-2"
                    noFreezers={product.should_not_be_frozen ? true : false}
                    autoFocus={true}
                    allowEmpty={true}
                    onChange={(e) => {
                      const newStock = stock.filter((se) => se.location_id === Number(e.currentTarget.value));
                      setFromLocation(e.currentTarget.value);
                      setStockFromLocation(newStock);
                    }}
                  />
                </FormField>
              </div>
              <FormErrors id={fields.locationId.errorId} errors={fields.locationId.errors} />
            </FormColumn>
          </FormRow>

          <FormRow comment="amount">
            {stockFromLocation.length > 0 && fromLocation !== "0" && (
              <AmountPlusUnitSelection
                product={product}
                stock={stockFromLocation}
                amountValue={amountValue}
                setAmountValue={setAmountValue}
              />
            )}
          </FormRow>

          <input {...getInputProps(fields.exactAmount, { type: "hidden" })} />
          {false && (
            <FormRow comment="exactAmount">
              <FormColumn className="w-full">
                <div className="flex flex-col leading-7">
                  <FormField>
                    <FormCheckbox fieldInfo={fields.exactAmount}>
                      Exact amount
                      <TooltipWrapper id="consume-exact-amount">
                        For tare weight handling enabled products, <code>true</code> when the given is the
                        absolute amount to be consumed, not the amount including the container weight.
                      </TooltipWrapper>
                    </FormCheckbox>
                  </FormField>
                  <FormErrors id={fields.exactAmount.errorId} errors={fields.exactAmount.errors} />
                </div>{" "}
              </FormColumn>
            </FormRow>
          )}

          <input {...getInputProps(fields.allowSubproductSubstitution, { type: "hidden" })} />
          {false && (
            <FormRow comment="allowSubproductSubstitution">
              <FormColumn className="w-full">
                <div className="flex flex-col leading-7">
                  <FormField>
                    <FormCheckbox fieldInfo={fields.allowSubproductSubstitution}>
                      Allow subproduct substitution
                      <TooltipWrapper id="allow-subproduct-substitution">
                        <code>true</code> when any in stock sub product should be used when the given product
                        is a parent product and currently not in stock.
                      </TooltipWrapper>
                    </FormCheckbox>
                  </FormField>
                  <FormErrors
                    id={fields.allowSubproductSubstitution.errorId}
                    errors={fields.allowSubproductSubstitution.errors}
                  />
                </div>{" "}
              </FormColumn>
            </FormRow>
          )}

          <FormRow comment="spoiled">
            <FormColumn className="w-full">
              <div className="flex flex-col leading-7">
                <FormField>
                  <FormCheckbox fieldInfo={fields.spoiled}>
                    Inventory is spoiled <Trash2 className="mb-1 inline size-4" />
                  </FormCheckbox>
                </FormField>
                <FormErrors id={fields.spoiled.errorId} errors={fields.spoiled.errors} />
              </div>{" "}
            </FormColumn>
          </FormRow>

          <FormRow comment="Consume product button">
            <FormColumn className="pt-3">
              <Button
                type="submit"
                className={clsx(
                  inputCommonStyles,
                  "cursor-pointer",
                  fields.spoiled.value ? "bg-spoiled/50!" : "bg-consume/50!",
                  fields.spoiled.value ? "border-spoiled/90!" : "border-consume/90!",
                )}
                disabled={submitPending}
              >
                {fields.spoiled.value ? "Spoil" : "Consume"}
              </Button>
            </FormColumn>
            <FormColumn className="pt-5.5">
              <Link
                href={`/scan/${code}`}
                className={clsx(
                  inputCommonStyles,
                  "cursor-pointer",
                  "p-2.5!",
                  "rounded-lg",
                  "bg-red-500/50",
                  "border-red-500/70!",
                )}
              >
                Cancel
              </Link>
            </FormColumn>
          </FormRow>
          {/*

           */}
        </FieldSet>
      </form>
    </FormProvider>
  );
}
