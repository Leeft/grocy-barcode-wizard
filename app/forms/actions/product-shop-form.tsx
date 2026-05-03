"use client";

import { use, useActionState, useContext, useState } from "react";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
import { productShopSubmit } from "./product-shop-submit";
import { parseWithZod } from "@conform-to/zod/v4";
import { createProductShopSchema } from "./product-shop-schema";
import { FormRow, FormColumn, FormLabel, FormField, FormErrors } from "@/ui/forms/form-utils";
import { Product, ShoppingList } from "@/interfaces/grocy";
import { FieldSet, Legend } from "@/ui/forms/fieldset";
import { AmountPlusUnitSelectionAdd } from "@/ui/forms/amount-plus-unit-selection-add";
import { CaptureSubmitOnEnter } from "../capture-submit";
import { CustomisableSelect, CustomisableSelectOptionArray } from "@/ui/customisable-select";
import { ShoppingListContext } from "@/providers/shopping-list-context";
import { ActionFormNote } from "./components/action-form-note";
import { ActionFormSubmit } from "./components/action-form-submit";
import { ActionFormCancel } from "./components/action-form-cancel";

export function ProductShopForm({ code, product }: { code: string; product: Product }) {
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
      return parseWithZod(formData, { schema: createProductShopSchema() });
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

          <FormRow comment="shopping list entry">
            <FormColumn className="w-full">
              <FormLabel
                htmlFor={fields.listId.name}
                title="Shopping list entry"
                className="relative top-[-8] mb-0!"
              />
              <FormField className="flex flex-row gap-x-2">
                <CustomisableSelect
                  {...getInputProps(fields.listId, {
                    type: "hidden",
                  })}
                  options={shoppingListOptions}
                  className="w-full md:w-110"
                />
              </FormField>
              <FormErrors id={fields.listId.errorId} errors={fields.listId.errors} />
            </FormColumn>
          </FormRow>

          <FormRow comment="note">
            <ActionFormNote field={fields.note} multiLine={true} />
          </FormRow>

          <FormRow comment="Add to list button">
            <ActionFormSubmit
              className="bg-shopping-list/50! border-shopping-list/90!"
              pending={submitPending}
            >
              Add to list
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
