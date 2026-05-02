"use client";

import { use, useActionState, useContext, useState } from "react";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
import { productShopSubmit } from "./product-shop-submit";
import { parseWithZod } from "@conform-to/zod/v4";
import { createProductShopSchema } from "./product-shop-schema";
import { Button } from "@/ui/button";
import { FormRow, FormColumn, FormLabel, FormField, FormErrors } from "@/ui/forms/form-utils";
import clsx from "clsx";
import { inputCommonStyles } from "@/lib/product-form-shared";
import { Product, ShoppingList } from "@/interfaces/grocy";
import Link from "next/link";
import { FieldSet, Legend } from "@/ui/forms/fieldset";
import { AmountPlusUnitSelectionAdd } from "@/ui/forms/amount-plus-unit-selection-add";
import { CaptureSubmitOnEnter } from "../capture-submit";
import { CustomisableSelect, CustomisableSelectOptionArray } from "@/ui/customisable-select";
import { ShoppingListContext } from "@/providers/shopping-list-context";

export function ProductShopForm({ code, product }: { code: string; product: Product }) {
  const schema = createProductShopSchema();

  const [lastResult, action, submitPending] = useActionState(productShopSubmit, undefined);

  const shoppingLists = use(useContext(ShoppingListContext) as Promise<ShoppingList[]>);

  const shoppingListOptions: CustomisableSelectOptionArray = shoppingLists.map((list) => {
    return { value: list.id.toString(), label: list.name };
  });

  const [form, fields] = useForm({
    lastResult,

    defaultValue: {
      amount: "1",
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
          <Legend className="text-shopping-list">Add to shopping list</Legend>

          <FormRow comment="amount">
            <AmountPlusUnitSelectionAdd
              product={product}
              amountValue={amountValue}
              setAmountValue={setAmountValue}
            />
          </FormRow>

          <FormRow comment="stock entry">
            <FormColumn className="w-full">
              <FormLabel
                htmlFor={fields.listId.name}
                title="Specific stock entry"
                className="relative top-[-8] mb-0!"
              />
              <FormField className="flex flex-row gap-x-2">
                <CustomisableSelect
                  {...getInputProps(fields.listId, {
                    type: "hidden",
                  })}
                  options={shoppingListOptions}
                  className="w-full"
                />
              </FormField>
              <FormErrors id={fields.listId.errorId} errors={fields.listId.errors} />
            </FormColumn>
          </FormRow>

          <FormRow comment="note">
            <FormColumn className="w-full md:w-110">
              <div className={`flex`}>
                <FormLabel htmlFor={fields.note.name} title="Note" className="relative top-[-8] mb-0!" />
              </div>
              <FormField>
                <textarea
                  {...getInputProps(fields.note, {
                    type: "text",
                    value: false,
                  })}
                  className={clsx(inputCommonStyles, "w-full")}
                >
                  {fields.note.value}
                </textarea>
              </FormField>
              <FormErrors id={fields.note.errorId} errors={fields.note.errors} />
            </FormColumn>
          </FormRow>

          <FormRow comment="Add to list button">
            <FormColumn className="pt-3">
              <Button
                type="submit"
                className={clsx(
                  inputCommonStyles,
                  "cursor-pointer",
                  "bg-shopping-list/50!",
                  "border-shopping-list/90!",
                )}
                disabled={submitPending}
              >
                Add to list
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
