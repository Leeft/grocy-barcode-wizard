"use client";

import { KeyboardEvent, use, useActionState, useContext, useState } from "react";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Button } from "@/ui/button";
import { FormRow, FormColumn, FormLabel, FormField, FormErrors } from "@/ui/forms/form-utils";
import clsx from "clsx";
import { Product, ProductLocation, StockEntry } from "@/interfaces/grocy";
import Link from "next/link";
import CustomisableSelect from "@/ui/customisable-select";
import { StockEntrySummary } from "@/ui/stock-entry-summary";
import { getNodeText } from "@/lib/utils";
import { productTransferSubmit } from "@/forms/actions/product-transfer-submit";
import { ProductTransferSchema } from "@/forms/actions/product-transfer-schema";
import { LocationContext } from "@/providers/location-context";
import { LocationDropdown } from "@/ui/product/location-dropdown";
import { AmountPlusUnitSelection } from "@/ui/forms/amount-plus-unit-selection";

export function ProductTransferForm({
  code,
  product,
  stock,
  openOnly = false,
}: {
  code: string;
  product: Product;
  stock: StockEntry[];
  openOnly?: boolean;
}) {
  const [lastResult, action, submitPending] = useActionState(productTransferSubmit, undefined);

  const [locationFrom, setLocationFrom] = useState<number>(product.location_id!);
  const [locationTo, setLocationTo] = useState<number>(0);

  const locations = use(useContext(LocationContext) as Promise<ProductLocation[]>);

  const [form, fields] = useForm({
    lastResult,

    id: `transfer-${code}`,

    defaultValue: {
      barcode: code,
      productId: product.id,
      amount: 1,
      locationIdFrom: product.location_id,
      locationIdTo: undefined,
      stockEntryId: undefined,
    },

    // Reuse the validation logic on the client
    onValidate({ formData }) {
      const foo = parseWithZod(formData, { schema: ProductTransferSchema });
      return foo;
    },

    // Validate the form on blur event triggered
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    if (e.key === "Enter" && target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  const stockOptions = stock
    .filter((se) => !openOnly || !se.open)
    .filter((se) => se.location_id === locationFrom)
    .map((se) => {
      const node = StockEntrySummary({ product: product, se: se });
      return { value: se.stock_id!, label: getNodeText(node) };
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

  const [availableStock, setAvailableStock] = useState<number>(
    recalculateAvailableStock(stockAtLocation, false, fields.stockEntryId.value),
  );

  return (
    <FormProvider context={form.context}>
      <form
        id={form.id}
        onSubmit={form.onSubmit}
        action={action}
        noValidate
        onKeyDown={handleKeyDown}
        aria-describedby={form.errors ? form.errorId : undefined}
        className="pt-2p pb-25"
      >
        <input {...getInputProps(fields.productId, { type: "hidden" })} defaultValue={product.id} />
        <input {...getInputProps(fields.barcode, { type: "hidden" })} defaultValue={code} />
        <div id={form.errorId}>{form.errors}</div>
        <fieldset className="my-2 mt-5 flex flex-col gap-y-4 rounded-md border border-slate-500 px-4 pt-2 pb-5 tracking-[0.9]">
          <legend className="text-transfer mb-2 ml-1 px-2 font-bold uppercase">Transfer</legend>
          {/* */}
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
                    onChange={(e) => {
                      setLocationFrom(Number(e.currentTarget.value));
                      const newStock = stock.filter((se) => se.location_id === Number(e.currentTarget.value));
                      setStockAtLocation(newStock);
                      setAvailableStock(
                        recalculateAvailableStock(newStock, false, fields.stockEntryId.value),
                      );
                    }}
                  />
                </FormField>
              </div>
              <FormErrors id={fields.locationIdFrom.errorId} errors={fields.locationIdFrom.errors} />
            </FormColumn>
          </FormRow>
          {/* */}
          <FormRow comment="amount">
            <AmountPlusUnitSelection
              product={product}
              stock={stockAtLocation}
              availableStock={availableStock}
              setAvailableStock={setAvailableStock}
            />
          </FormRow>
          {/* */}
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
          {/* */}
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
                    setAvailableStock(recalculateAvailableStock(stock, false, e.currentTarget.value));
                  }}
                />
              </FormField>
              <FormErrors id={fields.amount.errorId} errors={fields.amount.errors} />
            </FormColumn>
          </FormRow>
          {/* */}
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
        </fieldset>
      </form>
    </FormProvider>
  );
}

function recalculateAvailableStock(stock: StockEntry[], openOnly: boolean, stock_id: string | undefined) {
  let availableStock = 0;
  stock.map((se) => {
    if (stock_id === undefined || stock_id === null || stock_id === "") {
      // any stock
      if ((!openOnly || !se.open) && se.amount !== undefined) {
        availableStock += se.amount;
      }
    } else {
      if ((!openOnly || !se.open) && se.stock_id === stock_id && se.amount !== undefined) {
        availableStock += se.amount;
      }
    }
  });
  return availableStock;
}
