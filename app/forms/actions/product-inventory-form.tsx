"use client";

import { use, useActionState, useContext } from "react";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
import { productInventorySubmit } from "./product-inventory-submit";
import { parseWithZod } from "@conform-to/zod/v4";
import { FormRow, FormColumn, FormLabel, FormField, FormErrors } from "@/ui/forms/form-utils";
import { clsx } from "clsx";
import { inputCommonStyles } from "@/lib/product-form-shared";
import {
  Product,
  ProductLocation as PrLocation,
  ShoppingLocation,
  grocyAsStockLabelType,
} from "@/interfaces/grocy";
import { LocationDropdown } from "@/ui/product/location-dropdown";
import { LocationContext } from "@/providers/location-context";
import { ShoppingLocationContext } from "@/providers/shopping-location-context";
import { FieldSet, Legend } from "@/ui/forms/fieldset";
import { AmountPlusUnitSelectionAdd } from "@/ui/forms/amount-plus-unit-selection-add";
import { CaptureSubmitOnEnter } from "../capture-submit";
import { ActionFormStockLabelType } from "./components/action-form-stock-label-type";
import { ActionFormNote } from "./components/action-form-note";
import { ActionFormCancel } from "./components/action-form-cancel";
import { ActionFormSubmit } from "./components/action-form-submit";
import { ProductInventorySchema } from "../action-form-schemas";
import { createToastCallbacks } from "@/utils/action-state-callback/toast-callback";
import { withCallbacks } from "@/utils/action-state-callback/with-callback";

export function ProductInventoryForm({ code, product }: { code: string; product: Product }) {
  const [lastResult, action, submitPending] = useActionState(
    withCallbacks(
      productInventorySubmit,
      createToastCallbacks({
        loadingMessage: "Updating inventory ...",
      }),
      `/scan/${encodeURIComponent(code)}`,
    ),
    undefined,
  );

  const locations = use(useContext(LocationContext) as Promise<PrLocation[]>);
  const shoppingLocations = use(useContext(ShoppingLocationContext) as Promise<ShoppingLocation[]>);

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
      bestBeforeDate: "",
      price: "0",
      locationId: product.location_id,
      shoppingLocationId: "",
      stockLabelType: grocyAsStockLabelType(product.default_stock_label_type),
      note: undefined,
    },

    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ProductInventorySchema });
    },

    shouldValidate: "onBlur",
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
        aria-describedby={form.errors ? form.errorId : undefined}
        className="pt-2p pb-25"
      >
        <div id={form.errorId}>{form.errors}</div>
        <input {...getInputProps(fields.base.getFieldset().productId, { type: "hidden" })} />
        <input {...getInputProps(fields.base.getFieldset().barcode, { type: "hidden" })} />

        <FieldSet>
          <Legend className="text-inventory">Inventory</Legend>

          <FormRow comment="amount">
            <AmountPlusUnitSelectionAdd product={product} title="New stock amount *" />
          </FormRow>

          {product.default_best_before_days > -1 && (
            <FormRow comment="best_before_date">
              <FormColumn className="w-full flex-none">
                <div className="w-64">
                  <FormLabel
                    htmlFor={fields.bestBeforeDate.id}
                    title={product.due_type === 1 ? "Best before *" : "Expires at *"}
                  ></FormLabel>
                  <FormField>
                    <input
                      {...getInputProps(fields.bestBeforeDate, {
                        type: "date",
                      })}
                      required
                      onFocus={(e) => e.currentTarget.select()}
                      className={inputCommonStyles}
                    />
                  </FormField>
                </div>
                <FormErrors id={fields.bestBeforeDate.errorId} errors={fields.bestBeforeDate.errors} />
              </FormColumn>
            </FormRow>
          )}

          <FormRow comment="price">
            <FormColumn className="w-full">
              <FormLabel htmlFor={fields.price.id} title="Price" className="relative top-[-8] mb-0!" />
              <FormField className="flex flex-row gap-x-2">
                <input
                  {...getInputProps(fields.price, {
                    type: "number",
                  })}
                  min={0}
                  step={0.01}
                  className={clsx(inputCommonStyles, "w-50")}
                  placeholder="Price"
                  onFocus={(e) => e.currentTarget.select()}
                  required
                />
              </FormField>
              <FormErrors id={fields.price.errorId} errors={fields.price.errors} />
            </FormColumn>
          </FormRow>

          <FormRow comment="shoppingLocationId">
            <FormColumn className="w-full">
              <div className="w-full md:w-110">
                <FormLabel
                  htmlFor={fields.shoppingLocationId.id}
                  title={`Shop`}
                  className="inline-block"
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
              <FormErrors id={fields.shoppingLocationId.errorId} errors={fields.shoppingLocationId.errors} />
            </FormColumn>
          </FormRow>

          <FormRow comment="locationId">
            <FormColumn className="w-full">
              <div className="w-full md:w-110">
                <FormLabel
                  htmlFor={fields.locationId.id}
                  title={`Location *`}
                  className="inline-block"
                ></FormLabel>
                <FormField>
                  <LocationDropdown
                    {...getInputProps(fields.locationId, {
                      type: "number",
                    })}
                    units={locations}
                    className="w-full flex-2"
                    noFreezers={product.should_not_be_frozen ? true : false}
                    allowEmpty={false}
                  />
                </FormField>
              </div>
              <FormErrors id={fields.locationId.errorId} errors={fields.locationId.errors} />
            </FormColumn>
          </FormRow>

          <FormRow comment="stockLabelType">
            <ActionFormStockLabelType field={fields.stockLabelType} />
          </FormRow>

          <FormRow comment="note">
            <ActionFormNote field={fields.note} />
          </FormRow>

          <FormRow comment="Inventory button">
            <ActionFormSubmit className="bg-inventory/50! border-inventory/90!" pending={submitPending}>
              Update inventory
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
