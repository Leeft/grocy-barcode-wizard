"use client";

import { KeyboardEvent, use, useActionState, useContext, useEffect, useState } from "react";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Button } from "@/ui/button";
import { FormRow, FormColumn, FormLabel, FormField, FormErrors } from "@/ui/forms/form-utils";
import clsx from "clsx";
import { inputCommonStyles } from "@/lib/product-form-shared";
import { UnitForAmount } from "@/components/unit-for-amount";
import { Product, StockEntry } from "@/interfaces/grocy";
import Link from "next/link";
import { GrocyConfigContext } from "@/providers/grocy-config-context";
import CustomisableSelect from "@/ui/customisable-select";
import { StockEntrySummary } from "@/ui/stock-entry-summary";
import { getNodeText } from "@/lib/utils";
import { productOpenSubmit } from "@/forms/actions/product-open-submit";
import { ProductOpenSchema } from "@/forms/actions/product-open-schema";

const unitTaggedLabelClass = clsx();

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
  const grocyConfig = use(useContext(GrocyConfigContext) as Promise<Record<string, never>>);

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
      const foo = parseWithZod(formData, { schema: ProductOpenSchema });
      console.log(foo);
      return foo;
    },

    // Validate the form on blur event triggered
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    if (e.key === "Enter" && target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  const stockOptions = stock
    .filter((se) => !se.open)
    .map((se) => {
      const node = StockEntrySummary({ product: product, se: se });
      return { value: se.stock_id!, label: getNodeText(node) };
    });

  stockOptions.unshift({
    value: "",
    label: "",
  });

  function recalculateAvailableStock(stock_id: string | undefined) {
    let unopenedStock = 0;
    stock.map((se) => {
      if (stock_id === undefined || stock_id === "") {
        // any stock
        if (!se.open && se.amount !== undefined) unopenedStock = unopenedStock + se.amount;
      } else {
        if (!se.open && se.stock_id === stock_id && se.amount !== undefined)
          unopenedStock = unopenedStock + se.amount;
      }
    });
    return unopenedStock;
  }

  // useEffect(() => {
  //   setUnopenedStock(recalculateAvailableStock(fields.stockEntryId.value));
  // }, [fields.stockEntryId.value]);

  const [unopenedStock, setUnopenedStock] = useState<number>(
    recalculateAvailableStock(fields.stockEntryId.value),
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
          <legend className="text-open mb-2 ml-1 px-2 font-bold uppercase">Open</legend>
          {/* */}
          <FormRow comment="amount">
            <FormColumn className="w-full">
              <div className="w-80">
                <div className={`${unitTaggedLabelClass} flex`}>
                  <div className="grow">
                    <FormLabel
                      htmlFor={fields.amount.name}
                      title="Open amount *"
                      className="relative top-[-8] mb-0!"
                    />
                  </div>
                  <div className="inline-flex">
                    Max of {unopenedStock}&nbsp;
                    <UnitForAmount
                      unit={product.qu_id_stock!}
                      title="This is the stock unit used for this product and this unit can't be easily changed."
                      className="h-5 grow text-right text-sm"
                      plural={unopenedStock > 1}
                    />
                  </div>
                </div>
                <FormField>
                  <input
                    {...getInputProps(fields.amount, {
                      type: "number",
                    })}
                    min={0.001}
                    step={1}
                    max={unopenedStock}
                    className={clsx(inputCommonStyles, "w-full")}
                    placeholder="Amount to open"
                    required
                  />
                </FormField>
              </div>
              <FormErrors id={fields.amount.errorId} errors={fields.amount.errors} />
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
                  className="w-80 md:w-100"
                  onChange={(e) => setUnopenedStock(recalculateAvailableStock(e.currentTarget.value))}
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
              <Button type="submit" className="cursor-pointer" disabled={submitPending}>
                Open
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
