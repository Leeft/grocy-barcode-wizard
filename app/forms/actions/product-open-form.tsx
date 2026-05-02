"use client";

import { use, useActionState, useContext, useState } from "react";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Button } from "@/ui/button";
import { FormRow, FormColumn, FormLabel, FormField, FormErrors } from "@/ui/forms/form-utils";
import clsx from "clsx";
import { Product, QuantityUnitConversion, StockEntry } from "@/interfaces/grocy";
import Link from "next/link";
import CustomisableSelect from "@/ui/customisable-select";
import { StockEntrySummaryText } from "@/ui/stock-entry-summary";
import { sumStock } from "@/lib/utils";
import { productOpenSubmit } from "@/forms/actions/product-open-submit";
import { QuantityUnitConversionResolvedContext } from "@/providers/quantity-unit-conversion-resolved-context";
import { createProductOpenSchema } from "./product-open-schema";
import { FieldSet, Legend } from "@/ui/forms/fieldset";
import { AmountPlusUnitSelection } from "@/ui/forms/amount-plus-unit-selection";
import { CaptureSubmitOnEnter } from "../capture-submit";
import { inputCommonStyles } from "@/lib/product-form-shared";

export function ProductOpenForm({
  code,
  product,
  stock,
}: {
  code: string;
  product: Product;
  stock: StockEntry[];
}) {
  const conversions = use(
    useContext(QuantityUnitConversionResolvedContext) as Promise<QuantityUnitConversion[]>,
  );

  const schema = createProductOpenSchema(product, stock, conversions);

  const [lastResult, action, submitPending] = useActionState(productOpenSubmit, undefined);

  const [form, fields] = useForm({
    lastResult,

    id: `open-${code}`,

    defaultValue: {
      barcode: code,
      productId: product.id,
      amount: 1,
      allowSubproductSubstitution: true,
    },

    // Reuse the validation logic on the client
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: schema });
    },

    // Validate the form on blur event triggered
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const unopenedStock = stock.filter((se) => !se.open);

  const filteredStock = unopenedStock
    .filter((se) => !se.open)
    .filter((se) => !fields.stockEntryId.value || fields.stockEntryId.value === se.stock_id);

  const stockOptions = unopenedStock.map((se) => {
    const node = StockEntrySummaryText({ product: product, se: se });
    return { value: se.stock_id!, label: node };
  });

  stockOptions.unshift({
    value: "",
    label: "",
  });

  const [selectedStock, setSelectedStock] = useState<StockEntry[]>(filteredStock);

  const [amountValue, setAmountValue] = useState<string>(
    sumStock({ stock: selectedStock, stockId: fields.stockEntryId.value }).toString(),
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
          <Legend className="text-open">Open</Legend>

          <FormRow comment="amount">
            <AmountPlusUnitSelection
              product={product}
              stock={filteredStock}
              amountValue={amountValue}
              setAmountValue={setAmountValue}
              autoFocus={true}
            />
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
                  className="w-full"
                  onChange={(e) => {
                    setAmountValue(sumStock({ stock: stock, stockId: e.currentTarget.value }).toString());
                  }}
                />
              </FormField>
              <FormErrors id={fields.amount.errorId} errors={fields.amount.errors} />
            </FormColumn>
          </FormRow>
          {/* */}
          {/* <FormRow comment="allowSubproductSubstitution">
            <FormColumn className="w-full">
              <div className="flex flex-col leading-7">
                <FormField>
                  <FormCheckbox fieldInfo={fields.allowSubproductSubstitution}>Allow subproduct substitution</FormCheckbox>
                </FormField>
                <FormErrors id={fields.allowSubproductSubstitution.errorId} errors={fields.allowSubproductSubstitution.errors} />
              </div>{" "}
            </FormColumn>
          </FormRow> */}
          {/* */}
          <FormRow comment="Open product button">
            <FormColumn className="pt-3">
              <Button
                type="submit"
                className={clsx(inputCommonStyles, "cursor-pointer", "bg-open/50!", "border-open/90!")}
                disabled={submitPending}
              >
                Open
              </Button>
            </FormColumn>
            <FormColumn className="pt-5.5">
              <Link
                href={`/scan/${code}`}
                onClick={(e) => form.reset()}
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
