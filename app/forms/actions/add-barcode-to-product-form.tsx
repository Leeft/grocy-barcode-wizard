"use client";

import clsx from "clsx";
import { use, useActionState, useContext, useState } from "react";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { FormRow, FormColumn, FormField, FormLabel, FormErrors } from "@/ui/forms/form-utils";
import { AmountPlusUnitSelectionAdd } from "@/ui/forms/amount-plus-unit-selection-add";
import { CaptureSubmitOnEnter } from "../capture-submit";
import { ActionFormCancel } from "./components/action-form-cancel";
import { ActionFormSubmit } from "./components/action-form-submit";
import { AddBarcodeToProductSchema } from "../action-form-schemas";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Route } from "next";
import { ProductContext } from "@/providers/product-context";
import { Product, ShoppingLocation } from "@/interfaces/grocy";
import { CustomisableSelect, CustomisableSelectOptionArray } from "@/ui/customisable-select";
import { LocationDropdown } from "@/ui/product/location-dropdown";
import { ShoppingLocationContext } from "@/providers/shopping-location-context";
import { addBarcodeToProductSubmit } from "./add-barcode-to-product-submit";
import { withCallbacks } from "@/utils/action-state-callback/with-callback";
import { createToastCallbacks } from "@/utils/action-state-callback/toast-callback";

export function AddBarcodeToProductForm({ code }: { code: string }) {
  const [lastResult, action, submitPending] = useActionState(
    withCallbacks(
      addBarcodeToProductSubmit,
      createToastCallbacks({
        loadingMessage: "Adding barcode ...",
      }),
    ),
    undefined,
  );

  const [product, setProduct] = useState<Product | null>(null);

  const products = use(useContext(ProductContext) as Promise<Product[]>);
  const shoppingLocations = use(useContext(ShoppingLocationContext) as Promise<ShoppingLocation[]>);

  const productOptions = products
    .filter((pr) => pr.name !== undefined)
    .map((pr) => {
      return { value: pr.id?.toString(), label: pr.name };
    });

  productOptions.unshift({
    value: "0",
    label: "Pick ...",
  });

  const [form, fields] = useForm({
    lastResult,

    defaultValue: {
      base: {
        barcode: code,
        productId: undefined,
      },
      amount: {
        amount: "1",
        amountShadow: "1",
        maximumAmount: "10000",
      },
      shoppingLocationId: undefined,
      note: undefined,
    },

    onValidate({ formData }) {
      return parseWithZod(formData, { schema: AddBarcodeToProductSchema });
    },

    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
  });

  return (
    <FormProvider context={form.context}>
      <CaptureSubmitOnEnter formId={form.id} />
      <form
        id={form.id}
        onSubmit={form.onSubmit}
        action={action}
        noValidate
        className="pb-25"
        aria-describedby={form.errors ? form.errorId : undefined}
      >
        <div id={form.errorId}>{form.errors}</div>
        <input {...getInputProps(fields.base.getFieldset().barcode, { type: "hidden" })} />

        <div className="flex flex-col gap-y-5">
          <FormRow comment="Page header">
            <FormColumn className="flex-auto">
              <h1 className="inline-block text-lg font-bold text-slate-400 uppercase">
                Add barcode to product
              </h1>
            </FormColumn>
          </FormRow>

          <FormRow comment="Add barcode to product link">
            <FormColumn>
              <span className="hidden sm:inline-block">or:</span>
              <Link
                href={
                  `/scan/${encodeURIComponent(fields.base.getFieldset().barcode.value!)}` as Route<string>
                }
                className="ml-0 sm:ml-3 rounded-lg border border-dashed px-4 py-2 underline underline-offset-4 inline-block"
              >
                <ArrowRight className="inline size-6 pr-1.5" />
                Create new product for this barcode
              </Link>
            </FormColumn>
          </FormRow>

          <FormRow>
            <FormColumn className="w-full">
              <FormLabel
                htmlFor={fields.base.getFieldset().productId.id}
                title="Product to add the barcode to *"
                className="relative top-[-8] mb-0!"
              />
              <FormField className="flex flex-row gap-x-2">
                <CustomisableSelect
                  {...getInputProps(fields.base.getFieldset().productId, {
                    type: "hidden",
                  })}
                  options={productOptions as CustomisableSelectOptionArray}
                  className="w-full md:w-110"
                  required={true}
                  onChange={(e) => {
                    const productId = Number(e.currentTarget.value);
                    if (productId > 0) {
                      const product = products.find((pr) => pr.id === productId);
                      if (product !== undefined) {
                        setProduct(product);
                        //form.update();
                      }
                    }
                  }}
                />
              </FormField>
              <FormErrors
                id={fields.base.getFieldset().productId.errorId}
                errors={fields.base.getFieldset().productId.errors}
              />
            </FormColumn>
          </FormRow>

          {product !== null &&
            product.id !== undefined &&
            /^[1-9][0-9]*$/.test(fields.base.getFieldset().productId.value!) && (
              <>
                <FormRow comment="amount">
                  <AmountPlusUnitSelectionAdd key={product.id} product={product} title="Amount and unit for this barcode *"/>
                </FormRow>

                <FormRow comment="shoppingLocationId">
                  <FormColumn className="w-full">
                    <div className="w-full md:w-110">
                      <FormLabel
                        htmlFor={fields.shoppingLocationId.id}
                        title={`Shop`}
                        className="inline-block mt-0!"
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
                    <FormErrors
                      id={fields.shoppingLocationId.errorId}
                      errors={fields.shoppingLocationId.errors}
                    />
                  </FormColumn>
                </FormRow>

                <FormRow comment="Add barcode button">
                  <ActionFormSubmit pending={submitPending} className={clsx()}>
                    Add barcode to product
                  </ActionFormSubmit>
                  <ActionFormCancel code={code} onClick={() => form.reset()}>
                    Cancel
                  </ActionFormCancel>
                </FormRow>
              </>
            )}
        </div>
      </form>
    </FormProvider>
  );
}
