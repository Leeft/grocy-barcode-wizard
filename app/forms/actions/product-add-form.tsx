"use client";

import { KeyboardEvent, use, useActionState, useContext } from "react";
import { FormProvider, getInputProps, useForm } from "@conform-to/react";
import { productAddSubmit } from "./product-add-submit";
import { parseWithZod } from "@conform-to/zod/v4";
import { ProductAddSchema } from "./product-add-schema";
import { Button } from "@/ui/button";
import { FormRow, FormColumn, FormLabel, FormField, FormErrors } from "@/ui/forms/form-utils";
import clsx from "clsx";
import { dateInputCommonStyles, inputCommonStyles, stockLabelOptions } from "@/lib/product-form-shared";
import { UnitForAmount } from "@/components/unit-for-amount";
import { Product, ProductLocation as PrLocation, ShoppingLocation } from "@/interfaces/grocy";
import CustomisableSelect from "@/ui/customisable-select";
import { DueDateType, PurchasePriceType, StockLabelType } from "@/generated/prisma/enums";
import { LocationDropdown } from "@/ui/product/location-dropdown";
import { LocationContext } from "@/providers/location-context";
import { ShoppingLocationContext } from "@/providers/shopping-location-context";
import Link from "next/link";
import { GrocyConfigContext } from "@/providers/grocy-config-context";

const unitTaggedLabelClass = clsx(); //"w-60 flex grow");

export function ProductAddForm({ code, product }: { code: string; product: Product }) {
  const [lastResult, action, submitPending] = useActionState(productAddSubmit, undefined);
  const grocyConfig = use(useContext(GrocyConfigContext) as Promise<Record<string, never>>);

  let purchasePriceType;
  switch (product.default_purchase_price_type) {
    default:
    case 1:
      purchasePriceType = PurchasePriceType.UNSPECIFIED;
      break;
    case 2:
      purchasePriceType = PurchasePriceType.UNIT_PRICE;
      break;
    case 3:
      purchasePriceType = PurchasePriceType.TOTAL_PRICE;
      break;
  }

  let stockLabelType;
  switch (product.default_stock_label_type) {
    default:
    case 0:
      stockLabelType = StockLabelType.NO_LABEL;
      break;
    case 1:
      stockLabelType = StockLabelType.SINGLE_LABEL;
      break;
    case 2:
      stockLabelType = StockLabelType.LABEL_PER_UNIT;
      break;
  }

  let dueDateType;
  switch (product.due_type) {
    default:
      dueDateType = DueDateType.NO_EXPIRY;
      break;
    case 1:
      dueDateType = DueDateType.BEST_BEFORE;
      break;
    case 2:
      dueDateType = DueDateType.EXPIRY_DATE;
      break;
  }

  const [form, fields] = useForm({
    lastResult,

    id: `add-to-${code}`,

    defaultValue: {
      amount: 1,
      bestBeforeDate: "",
      price: "0",
      locationId: product.location_id,
      shoppingLocationId: "",
      stockLabelType: stockLabelType,
      note: undefined,
      dueDateType: dueDateType,
      purchasePriceType: purchasePriceType,
    },

    // Reuse the validation logic on the client
    onValidate({ formData }) {
      console.log("doing validation");
      const foo = parseWithZod(formData, { schema: ProductAddSchema });
      console.log(foo);
      return foo;
    },

    // // Validate the form on blur event triggered
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
  });

  const locations = use(useContext(LocationContext) as Promise<PrLocation[]>);
  const shoppingLocations = use(useContext(ShoppingLocationContext) as Promise<ShoppingLocation[]>);

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    if (e.key === "Enter" && target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  if (form.errors !== undefined) console.log("form errors", form.errors);

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
        <input {...getInputProps(fields.productId, { type: "hidden" })} value={product.id} />
        <input {...getInputProps(fields.barcode, { type: "hidden" })} value={code} />
        <input {...getInputProps(fields.dueDateType, { type: "hidden" })} />
        <div id={form.errorId}>{form.errors}</div>
        <fieldset className="my-2 mt-5 flex flex-col gap-y-4 rounded-md border border-slate-500 px-4 pt-2 pb-5 tracking-[0.9]">
          <legend className="text-add mb-2 ml-1 px-2 font-bold uppercase">Add / purchase</legend>
          {/* */}
          <FormRow comment="amount">
            <FormColumn className="w-full">
              <div className="w-60">
                <div className={`${unitTaggedLabelClass} flex`}>
                  <div>
                    <FormLabel
                      htmlFor={fields.amount.name}
                      title="Add amount *"
                      className="relative top-[-8] mb-0!"
                    />
                  </div>
                  <UnitForAmount
                    unit={product.qu_id_stock!}
                    title="You may enter a fractional value, but this is the stock unit used for this product and this unit can't be easily changed."
                    className="h-5 grow text-right text-sm"
                    plural={true}
                  />
                </div>
                <FormField>
                  <input
                    {...getInputProps(fields.amount, {
                      type: "number",
                    })}
                    min={1}
                    step={1}
                    max={10000}
                    className={clsx(inputCommonStyles, "w-full")}
                    placeholder="Amount to add"
                    required
                  />
                </FormField>
              </div>
              <FormErrors id={fields.amount.errorId} errors={fields.amount.errors} />
            </FormColumn>
          </FormRow>
          {/* */}
          <FormRow comment="price">
            <FormColumn className="inline w-full">
              <div className="w-72">
                <div className={`${unitTaggedLabelClass} flex`}>
                  <div>
                    <FormLabel
                      htmlFor={fields.price.name}
                      title="Price"
                      className="relative top-[-8] mb-0!"
                    />
                  </div>
                  <div className="flex grow flex-row text-right">
                    <div className="inline grow pr-1">
                      {fields.purchasePriceType.value === PurchasePriceType.TOTAL_PRICE ? (
                        <div className="inline-flex text-right">
                          {grocyConfig.CURRENCY}{" "}
                          {(Number(fields.price.value) / Number(fields.amount.value)).toFixed(2)}
                          {" per "}
                          <UnitForAmount
                            unit={product.qu_id_stock!}
                            title=""
                            className="flex h-5 pl-1.5 text-right text-sm"
                            plural={false}
                          />
                        </div>
                      ) : (
                        <div>
                          {grocyConfig.CURRENCY}{" "}
                          {(Number(fields.price.value) * Number(fields.amount.value)).toFixed(2)} total price
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <FormField className="flex flex-row gap-x-2">
                  <input
                    {...getInputProps(fields.price, {
                      type: "number",
                    })}
                    min={0}
                    step={0.01}
                    className={clsx(inputCommonStyles, "w-full")}
                    placeholder="Price"
                    required
                  />
                  <CustomisableSelect
                    {...getInputProps(fields.purchasePriceType, {
                      type: "hidden",
                    })}
                    options={[
                      { value: PurchasePriceType.UNIT_PRICE, label: "per unit" },
                      { value: PurchasePriceType.TOTAL_PRICE, label: "total price" },
                    ]}
                    className="w-60"
                  />
                </FormField>
              </div>
              <FormErrors id={fields.price.errorId} errors={fields.price.errors} />
            </FormColumn>
          </FormRow>
          {/* */}
          {product.default_best_before_days > -1 && (
            <FormRow comment="best_before_date">
              <FormColumn className="w-full flex-none">
                <div className="w-60">
                  <FormLabel
                    htmlFor={fields.bestBeforeDate.name}
                    title={product.due_type === 1 ? "Best before *" : "Expires at *"}
                  ></FormLabel>
                  <FormField>
                    <input
                      {...getInputProps(fields.bestBeforeDate, {
                        type: "date",
                      })}
                      required
                      className={dateInputCommonStyles}
                    />
                  </FormField>
                </div>
                <FormErrors id={fields.bestBeforeDate.errorId} errors={fields.bestBeforeDate.errors} />
              </FormColumn>
            </FormRow>
          )}
          {/* */}
          <FormRow comment="shoppingLocationId">
            <FormColumn className="w-full">
              <div className="w-80">
                <FormLabel
                  htmlFor={fields.shoppingLocationId.name}
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
          {/* */}
          <FormRow comment="locationId">
            <FormColumn className="w-full">
              <div className="w-80">
                <FormLabel
                  htmlFor={fields.locationId.name}
                  title={`Location`}
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
          {/* */}
          <FormRow comment="stockLabelType">
            <FormColumn className="w-full">
              <div className="w-60">
                <FormLabel
                  htmlFor={fields.stockLabelType.name}
                  title={`Stock entry label`}
                  className="inline-block"
                ></FormLabel>
                <FormField>
                  <CustomisableSelect
                    {...getInputProps(fields.stockLabelType, {
                      type: "hidden",
                    })}
                    options={stockLabelOptions}
                    className="w-40"
                  />
                </FormField>
              </div>
              <FormErrors id={fields.stockLabelType.errorId} errors={fields.stockLabelType.errors} />
            </FormColumn>
          </FormRow>
          {/* */}
          <FormRow comment="note">
            <FormColumn className="w-full">
              <div className={`${unitTaggedLabelClass} flex`}>
                <FormLabel htmlFor={fields.note.name} title="Note" className="relative top-[-8] mb-0!" />
              </div>
              <FormField>
                <input
                  {...getInputProps(fields.note, {
                    type: "text",
                  })}
                  className={clsx(inputCommonStyles, "w-full")}
                />
              </FormField>
              <FormErrors id={fields.note.errorId} errors={fields.note.errors} />
            </FormColumn>
          </FormRow>
          {/* */}
          <FormRow comment="Add product button">
            <FormColumn className="pt-3">
              <Button type="submit" className="cursor-pointer" disabled={submitPending}>
                Purchase stock
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
