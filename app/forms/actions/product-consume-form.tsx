"use client";

import clsx from "clsx";
import { use, useActionState, useContext, useState } from "react";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { FormRow, FormColumn, FormField, FormErrors, FormCheckbox } from "@/ui/forms/form-utils";
import { Product, ProductLocation as PrLocation, StockEntry } from "@/interfaces/grocy";
import { LocationContext } from "@/providers/location-context";
import { productConsumeSubmit } from "./product-consume-submit";
import { AmountPlusUnitSelection } from "@/ui/forms/amount-plus-unit-selection";
import { Trash2 } from "lucide-react";
import TooltipWrapper from "@/ui/tooltip-wrapper";
import { FieldSet, Legend } from "@/ui/forms/fieldset";
import { CaptureSubmitOnEnter } from "../capture-submit";
import { ActionFormLocationId } from "./components/action-form-location-id";
import { ActionFormAllowSubproductSubstitution } from "./components/action-form-allowsubproduct";
import { ActionFormCancel } from "./components/action-form-cancel";
import { ActionFormSubmit } from "./components/action-form-submit";
import { ProductConsumeSchema } from "../action-form-schemas";
import { useGetAmountPlusUnitObject } from "@/providers/amount-plus-unit-context";

export function ProductConsumeForm({
  code,
  product,
  query,
}: {
  code: string;
  product: Product;
  query: Record<string, string | string[] | undefined>;
}) {
  const multi = useGetAmountPlusUnitObject();
  const stock = use(multi.stockEntryPromise);

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
      locationId: consumeLocationId,
      //recipeId: "", // TODO
      exactAmount: true,
      allowSubproductSubstitution: true,
      spoiled: query.spoiled === "true" ? true : false,
      stockEntryId: undefined,
    },

    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ProductConsumeSchema });
    },

    shouldValidate: "onInput",
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
        <input {...getInputProps(fields.base.getFieldset().productId, { type: "hidden" })} />
        <input {...getInputProps(fields.base.getFieldset().barcode, { type: "hidden" })} />

        <FieldSet>
          <Legend className={fields.spoiled.value ? "text-spoiled" : "text-consume"}>
            {fields.spoiled.value ? "Spoiled" : "Consume"}
          </Legend>

          <FormRow comment="locationId">
            <ActionFormLocationId
              field={fields.locationId}
              title="Consume from location"
              units={stockLocations}
              value={fromLocation}
              noFreezers={product.should_not_be_frozen ? true : false}
              firstOption={{ value: "0", label: "Pick ..." }}
              allowEmpty={true}
              onChange={(e) => {
                const newStock = stock.filter((se) => se.location_id === Number(e.currentTarget.value));
                setFromLocation(e.currentTarget.value);
                setStockFromLocation(newStock);
              }}
            />
          </FormRow>

          <FormRow comment="amount">
            {stockFromLocation.length > 0 && fromLocation !== "0" && (
              <AmountPlusUnitSelection
                product={product}
                stock={stockFromLocation}
                amountValue={amountValue}
                setAmountValue={setAmountValue}
                compoundField={fields.amount.getFieldset()}
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
                </div>
              </FormColumn>
            </FormRow>
          )}

          <FormRow comment="allowSubproductSubstitution">
            <ActionFormAllowSubproductSubstitution field={fields.allowSubproductSubstitution} />
          </FormRow>

          <FormRow comment="spoiled">
            <FormColumn className="w-full">
              <div className="flex flex-col leading-7">
                <FormField>
                  <FormCheckbox fieldInfo={fields.spoiled}>
                    Inventory is spoiled <Trash2 className="mb-1 inline size-4" />
                  </FormCheckbox>
                </FormField>
                <FormErrors id={fields.spoiled.errorId} errors={fields.spoiled.errors} />
              </div>
            </FormColumn>
          </FormRow>

          <FormRow comment="Consume product button">
            <ActionFormSubmit
              pending={submitPending}
              className={clsx(
                fields.spoiled.value ? "bg-spoiled/50!" : "bg-consume/50!",
                fields.spoiled.value ? "border-spoiled/90!" : "border-consume/90!",
              )}
            >
              {fields.spoiled.value ? "Spoil" : "Consume"}
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
