"use client";

import { use, useActionState, useContext, useState } from "react";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { FormRow } from "@/ui/forms/form-utils";
import { Product, ProductLocation, StockEntry } from "@/interfaces/grocy";
import { sumStock } from "@/lib/utils";
import { productTransferSubmit } from "@/forms/actions/product-transfer-submit";
import { LocationContext } from "@/providers/location-context";
import { AmountPlusUnitSelection } from "@/ui/forms/amount-plus-unit-selection";
import { FieldSet, Legend } from "@/ui/forms/fieldset";
import { CaptureSubmitOnEnter } from "../capture-submit";
import { ActionFormStockEntryId } from "./components/action-form-stock-entry-id";
import { ActionFormCancel } from "./components/action-form-cancel";
import { ActionFormSubmit } from "./components/action-form-submit";
import { ActionFormLocationId } from "./components/action-form-location-id";
import { ProductTransferSchema } from "../action-form-schemas";
import { useGetAmountPlusUnitObject } from "@/providers/amount-plus-unit-context";
import { createToastCallbacks } from "@/utils/action-state-callback/toast-callback";
import { withCallbacks } from "@/utils/action-state-callback/with-callback";

export function ProductTransferForm({ code, product }: { code: string; product: Product }) {
  const multi = useGetAmountPlusUnitObject();
  const stock = use(multi.stockEntryPromise);

  const [lastResult, action, submitPending] = useActionState(
    withCallbacks(
      productTransferSubmit,
      createToastCallbacks({
        loadingMessage: "Transfering product ...",
      }),
      `/scan/${encodeURIComponent(code)}`,
    ),
    undefined,
  );

  const [locationFrom, setLocationFrom] = useState<number>(product.location_id!);
  const [locationTo, setLocationTo] = useState<number>(0);

  const locations = use(useContext(LocationContext) as Promise<ProductLocation[]>);

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
      locationIdFrom: product.location_id,
      locationIdTo: undefined,
      stockEntryId: undefined,
    },

    onValidate({ formData }) {
      const r = parseWithZod(formData, { schema: ProductTransferSchema });
      return r;
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
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
        <input {...getInputProps(fields.base.getFieldset().productId, { type: "hidden" })} />
        <input {...getInputProps(fields.base.getFieldset().barcode, { type: "hidden" })} />

        <FieldSet>
          <Legend className="text-transfer">Transfer</Legend>

          <FormRow comment="fromLocationId">
            <ActionFormLocationId
              field={fields.locationIdFrom}
              title="Transfer from location"
              units={stockFromLocations}
              value={locationFrom}
              noFreezers={product.should_not_be_frozen ? true : false}
              onChange={(e) => {
                setLocationFrom(Number(e.currentTarget.value));
                const newStock = stock.filter((se) => se.location_id === Number(e.currentTarget.value));
                setStockAtLocation(newStock);
                setAmountValue(sumStock({ stock: newStock, stockId: fields.stockEntryId.value }).toString());
              }}
            />
          </FormRow>

          <FormRow comment="amount">
            <AmountPlusUnitSelection
              product={product}
              stock={stockAtLocation}
              amountValue={amountValue}
              setAmountValue={setAmountValue}
              compoundField={fields.amount.getFieldset()}
            />
          </FormRow>

          <FormRow comment="toLocationId">
            <ActionFormLocationId
              field={fields.locationIdTo}
              title="Transfer to location"
              units={targetLocations}
              value={locationTo}
              noFreezers={product.should_not_be_frozen ? true : false}
              disableOption={locationFrom.toString()}
              onChange={(e) => setLocationTo(Number(e.currentTarget.value))}
            />
          </FormRow>

          <FormRow comment="stock entry">
            <ActionFormStockEntryId
              field={fields.stockEntryId}
              product={product}
              stock={stockAtLocation}
              setAmountValue={setAmountValue}
            />
          </FormRow>

          <FormRow comment="Transfer product button">
            <ActionFormSubmit className="bg-transfer/50! border-transfer/90!" pending={submitPending}>
              Transfer
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
