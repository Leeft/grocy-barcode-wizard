"use client";

import { useActionState, useState } from "react";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { FormRow } from "@/ui/forms/form-utils";
import { Product, StockEntry } from "@/interfaces/grocy";
import { sumStock } from "@/lib/utils";
import { productOpenSubmit } from "@/forms/actions/product-open-submit";
import { FieldSet, Legend } from "@/ui/forms/fieldset";
import { AmountPlusUnitSelection } from "@/ui/forms/amount-plus-unit-selection";
import { CaptureSubmitOnEnter } from "../capture-submit";
import { ActionFormStockEntryId } from "./components/action-form-stock-entry-id";
import { ActionFormCancel } from "./components/action-form-cancel";
import { ActionFormSubmit } from "./components/action-form-submit";
import { ActionFormAllowSubproductSubstitution } from "./components/action-form-allowsubproduct";
import { ProductOpenSchema } from "../action-form-schemas";

export function ProductOpenForm({
  code,
  product,
  stock,
}: {
  code: string;
  product: Product;
  stock: StockEntry[];
}) {
  const [lastResult, action, submitPending] = useActionState(productOpenSubmit, undefined);

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
      allowSubproductSubstitution: true,
    },

    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ProductOpenSchema });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const unopenedStock = stock.filter((se) => !se.open);

  const filteredStock = unopenedStock.filter(
    (se) => !fields.stockEntryId.value || fields.stockEntryId.value === se.stock_id,
  );

  const [amountValue, setAmountValue] = useState<string>(
    sumStock({ stock: filteredStock, stockId: fields.stockEntryId.value }).toString(),
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
          <Legend className="text-open">Open</Legend>

          <FormRow comment="amount">
            <AmountPlusUnitSelection
              product={product}
              stock={filteredStock}
              amountValue={amountValue}
              setAmountValue={setAmountValue}
              autoFocus={true}
              compoundField={fields.amount.getFieldset()}
            />
          </FormRow>

          <FormRow comment="stock entry">
            <ActionFormStockEntryId
              field={fields.stockEntryId}
              product={product}
              stock={unopenedStock}
              setAmountValue={setAmountValue}
            />
          </FormRow>

          <FormRow comment="allowSubproductSubstitution">
            <ActionFormAllowSubproductSubstitution field={fields.allowSubproductSubstitution} />
          </FormRow>

          <FormRow comment="Open product button">
            <ActionFormSubmit className="bg-open/50! border-open/90!" pending={submitPending}>
              Open
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
