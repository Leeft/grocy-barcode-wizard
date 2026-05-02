"use client";

import { use, useActionState, useContext, useState } from "react";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Button } from "@/ui/button";
import { FormRow, FormColumn, FormLabel, FormField, FormErrors } from "@/ui/forms/form-utils";
import clsx from "clsx";
import { Product, ProductLocation, QuantityUnitConversion, StockEntry } from "@/interfaces/grocy";
import Link from "next/link";
import CustomisableSelect from "@/ui/customisable-select";
import { StockEntrySummaryText } from "@/ui/stock-entry-summary";
import { sumStock } from "@/lib/utils";
import { productTransferSubmit } from "@/forms/actions/product-transfer-submit";
import { createProductTransferSchema } from "@/forms/actions/product-transfer-schema";
import { LocationContext } from "@/providers/location-context";
import { LocationDropdown } from "@/ui/product/location-dropdown";
import { AmountPlusUnitSelection } from "@/ui/forms/amount-plus-unit-selection";
import { ProductStockContext } from "@/providers/product-stock-context";
import { QuantityUnitConversionResolvedContext } from "@/providers/quantity-unit-conversion-resolved-context";
import { FieldSet, Legend } from "@/ui/forms/fieldset";
import { CaptureSubmitOnEnter } from "../capture-submit";

export function ProductTransferForm({ code, product }: { code: string; product: Product }) {
  const stock = use(useContext(ProductStockContext) as Promise<StockEntry[]>);
  const conversions = use(
    useContext(QuantityUnitConversionResolvedContext) as Promise<QuantityUnitConversion[]>,
  );

  const schema = createProductTransferSchema(product, stock, conversions);

  const [lastResult, action, submitPending] = useActionState(productTransferSubmit, undefined);

  const [locationFrom, setLocationFrom] = useState<number>(product.location_id!);
  const [locationTo, setLocationTo] = useState<number>(0);

  const locations = use(useContext(LocationContext) as Promise<ProductLocation[]>);

  const [form, fields] = useForm({
    lastResult,

    defaultValue: {
      barcode: code,
      productId: product.id,
      amount: "1",
      locationIdFrom: product.location_id,
      locationIdTo: undefined,
      stockEntryId: undefined,
    },

    onValidate({ formData }) {
      return parseWithZod(formData, { schema: schema });
    },

    // Validate the form on blur event triggered
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const stockOptions = stock
    .filter((se) => se.location_id === locationFrom)
    .map((se) => {
      const node = StockEntrySummaryText({ product: product, se: se });
      return { value: se.stock_id!, label: node };
    });

  stockOptions.unshift({
    value: "",
    label: "",
  });

  const uniqueLocationsFromStock = [
    ...new Set(stock.filter((item) => item.location_id !== undefined).map((item) => item.location_id)),
  ];

  const [stockAtLocation, setStockAtLocation] = useState<StockEntry[]>(
    stock.filter((se) => se.location_id === locationFrom),
  );

  const stockFromLocations = locations
    .filter((item) => uniqueLocationsFromStock.indexOf(item.id) > -1)
    .map((item) => {
      // make shallow copy to edit
      return { id: item.id, name: item.name };
    });
  stockFromLocations.forEach((item) => {
    if (item.id === product.location_id) item.name = item.name + " (Default location)";
  });

  const targetLocations = locations;

  const [amountValue, setAmountValue] = useState<string>(
    sumStock({ stock: stockAtLocation, stockId: fields.stockEntryId.value }).toString(),
  );

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
          <Legend className="text-transfer">Transfer</Legend>

          <FormRow comment="fromLocationId">
            <FormColumn className="w-full">
              <div className="w-full md:w-110">
                <FormLabel
                  htmlFor={fields.locationIdFrom.name}
                  title={`Transfer from location`}
                  className="inline-block"
                ></FormLabel>
                <FormField>
                  <LocationDropdown
                    {...getInputProps(fields.locationIdFrom, {
                      type: "number",
                      value: false,
                    })}
                    units={stockFromLocations}
                    value={locationFrom}
                    className="w-full flex-2"
                    noFreezers={product.should_not_be_frozen ? true : false}
                    allowEmpty={false}
                    autoFocus={true}
                    onChange={(e) => {
                      setLocationFrom(Number(e.currentTarget.value));
                      const newStock = stock.filter((se) => se.location_id === Number(e.currentTarget.value));
                      setStockAtLocation(newStock);
                      setAmountValue(
                        sumStock({ stock: newStock, stockId: fields.stockEntryId.value }).toString(),
                      );
                    }}
                  />
                </FormField>
              </div>
              <FormErrors id={fields.locationIdFrom.errorId} errors={fields.locationIdFrom.errors} />
            </FormColumn>
          </FormRow>

          <FormRow comment="amount">
            <AmountPlusUnitSelection
              product={product}
              stock={stockAtLocation}
              amountValue={amountValue}
              setAmountValue={setAmountValue}
            />
          </FormRow>

          <FormRow comment="toLocationId">
            <FormColumn className="w-full">
              <div className="w-full md:w-110">
                <FormLabel
                  htmlFor={fields.locationIdTo.name}
                  title={`Transfer to location`}
                  className="inline-block"
                ></FormLabel>
                <FormField>
                  <LocationDropdown
                    {...getInputProps(fields.locationIdTo, {
                      type: "number",
                      value: false,
                    })}
                    units={targetLocations}
                    value={locationTo}
                    disableOption={locationFrom.toString()}
                    className="w-full flex-2"
                    noFreezers={product.should_not_be_frozen === 1 ? true : false}
                    allowEmpty={false}
                    onChange={(e) => setLocationTo(Number(e.currentTarget.value))}
                  />
                </FormField>
              </div>
              <FormErrors id={fields.locationIdTo.errorId} errors={fields.locationIdTo.errors} />
            </FormColumn>
          </FormRow>

          <FormRow comment="stock entry">
            <FormColumn className="w-full">
              <FormLabel
                htmlFor={fields.stockEntryId.name}
                title="Specific stock entry"
                className="relative top-[-8] mb-0!"
              />
              <FormField className="flex flex-row gap-x-2">
                <CustomisableSelect
                  {...getInputProps(fields.stockEntryId, {
                    type: "hidden",
                  })}
                  options={stockOptions}
                  className="w-full md:w-110"
                  onChange={(e) => {
                    setAmountValue(sumStock({ stock: stock, stockId: e.currentTarget.value }).toString());
                  }}
                />
              </FormField>
              <FormErrors id={fields.amount.errorId} errors={fields.amount.errors} />
            </FormColumn>
          </FormRow>

          <FormRow comment="Transfer product button">
            <FormColumn className="pt-3">
              <Button type="submit" className="cursor-pointer" disabled={submitPending}>
                Transfer
              </Button>
            </FormColumn>
            <FormColumn className="pt-5.75">
              <Link
                href={`/scan/${code}`}
                className={clsx("cursor-pointer", "p-2.75", "rounded-lg", "bg-amber-800")}
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
